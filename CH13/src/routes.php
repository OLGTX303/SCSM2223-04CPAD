<?php

use App\Auth\JwtService;
use App\Controllers\AuthController;
use App\Controllers\BookController;
use App\Controllers\HealthController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RateLimit;
use App\Repositories\UserRepository;
use App\Support\Database;
use App\Support\Env;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;

return function (App $app): void {
    $pdo = Database::pdo();
    $jwt = new JwtService();
    $auth = new AuthMiddleware($jwt);
    $authController = new AuthController(new UserRepository($pdo), $jwt);
    $loginRateLimit = new RateLimit(
        (int) Env::get('LOGIN_RATE_LIMIT', '5'),
        (int) Env::get('LOGIN_WINDOW_SECONDS', '60'),
        'login'
    );

    $app->get('/', [HealthController::class, 'index']);

    $app->post('/auth/register', [$authController, 'register']);
    $app->post('/auth/login', [$authController, 'login'])->add($loginRateLimit);
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
