<?php

namespace App\Auth;

use App\Support\Env;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use RuntimeException;

final class JwtService
{
    private string $secret;
    private string $algo = 'HS256';
    private int $ttl;
    private string $issuer;

    public function __construct()
    {
        Env::load(dirname(__DIR__, 2) . '/.env.example');
        Env::load(dirname(__DIR__, 2) . '/.env');

        $this->secret = Env::get('JWT_SECRET');
        $this->ttl = (int) Env::get('JWT_TTL', '3600');
        $this->issuer = Env::get('JWT_ISSUER', 'books-api');

        if ($this->secret === '' || str_starts_with($this->secret, 'change-me')) {
            throw new RuntimeException('JWT_SECRET is missing or still set to the placeholder value.');
        }
    }

    public function issue(int $userId, array $extra = []): string
    {
        $now = time();
        $payload = array_merge([
            'iss' => $this->issuer,
            'sub' => $userId,
            'iat' => $now,
            'exp' => $now + $this->ttl,
        ], $extra);

        return JWT::encode($payload, $this->secret, $this->algo);
    }

    public function verify(string $token): array
    {
        return (array) JWT::decode($token, new Key($this->secret, $this->algo));
    }

    public function ttl(): int
    {
        return $this->ttl;
    }
}
