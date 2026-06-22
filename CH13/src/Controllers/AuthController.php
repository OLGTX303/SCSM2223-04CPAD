<?php

namespace App\Controllers;

use App\Auth\JwtService;
use App\Repositories\UserRepository;
use App\Support\AuditLogger;
use App\Validation\Validator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class AuthController
{
    public function __construct(
        private UserRepository $users,
        private JwtService $jwt,
    ) {
    }

    public function register(Request $req, Response $res): Response
    {
        $body = (array) $req->getParsedBody();
        $errors = (new Validator())
            ->required('name', 'email', 'password')
            ->field('name', Validator::nonEmptyString(150), 'name must be 1-150 chars')
            ->field('email', Validator::email(), 'invalid email')
            ->field('password', fn ($value): bool => is_string($value) && mb_strlen($value) >= 6, 'min 6 chars')
            ->validate($body);

        if ($errors !== []) {
            return $this->json($res, ['errors' => $errors], 400);
        }

        if ($this->users->emailExists((string) $body['email'])) {
            return $this->json($res, ['error' => 'Email already registered'], 409);
        }

        $id = $this->users->create(
            (string) $body['name'],
            (string) $body['email'],
            password_hash((string) $body['password'], PASSWORD_DEFAULT)
        );
        AuditLogger::record('register', $id, 'user:' . $id, $req, mb_strtolower(trim((string) $body['email'])));

        return $this->json($res, [
            'message' => 'Registered',
            'user' => $this->users->findById($id),
        ], 201);
    }

    public function login(Request $req, Response $res): Response
    {
        $body = (array) $req->getParsedBody();
        $user = $this->users->findByEmail((string) ($body['email'] ?? ''));

        if (!$user || !password_verify((string) ($body['password'] ?? ''), $user['password_hash'])) {
            AuditLogger::record('login.fail', $user ? (int) $user['id'] : null, null, $req, (string) ($body['email'] ?? ''));

            return $this->json($res, ['error' => 'Invalid credentials'], 401);
        }

        $token = $this->jwt->issue((int) $user['id'], [
            'role' => $user['role'],
            'email' => $user['email'],
        ]);
        AuditLogger::record('login.success', (int) $user['id'], 'user:' . $user['id'], $req, (string) $user['email']);

        return $this->json($res, [
            'token_type' => 'Bearer',
            'expires_in' => $this->jwt->ttl(),
            'access_token' => $token,
            'user' => [
                'id' => (int) $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
            ],
        ]);
    }

    public function me(Request $req, Response $res): Response
    {
        $auth = (array) $req->getAttribute('auth', []);
        $user = $this->users->findById((int) ($auth['sub'] ?? 0));

        return $user
            ? $this->json($res, $user)
            : $this->json($res, ['error' => 'Not found'], 404);
    }

    private function json(Response $res, mixed $data, int $status = 200): Response
    {
        $res->getBody()->write(json_encode(
            $data,
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
            | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
        ));

        return $res
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus($status);
    }
}
