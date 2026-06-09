<?php

use App\Auth\JwtService;
use App\Controllers\AuthController;
use App\Controllers\BookController;
use App\Controllers\HealthController;
use App\Middleware\AuthMiddleware;
use App\Repositories\UserRepository;
use App\Support\Database;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app): void {
    $pdo = Database::pdo();
    $jwt = new JwtService();
    $auth = new AuthMiddleware($jwt);
    $authController = new AuthController(new UserRepository($pdo), $jwt);

    $app->get('/', [HealthController::class, 'index']);

    $app->post('/auth/register', [$authController, 'register']);
    $app->post('/auth/login', [$authController, 'login']);
    $app->get('/auth/me', [$authController, 'me'])->add($auth);

    $app->get('/api/books', [BookController::class, 'index']);
    $app->get('/api/books/{id}', [BookController::class, 'show']);

    $app->group('/api/books', function ($group) {
        $group->post('', [BookController::class, 'create']);
        $group->put('/{id}', [BookController::class, 'update']);
        $group->delete('/{id}', [BookController::class, 'delete']);
    })->add($auth);

    $app->options('/{routes:.+}', fn (Request $request, Response $response) => $response);
};
