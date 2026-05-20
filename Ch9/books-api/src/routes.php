<?php

use App\Controllers\BookController;
use App\Controllers\HealthController;
use App\Middleware\AuthMiddleware;
use Slim\App;

return function (App $app): void {
    $app->get('/', [HealthController::class, 'index']);

    $app->group('/api', function ($group) {
        $group->get('/books', [BookController::class, 'index']);
        $group->get('/books/{id}', [BookController::class, 'show']);
        $group->post('/books', [BookController::class, 'create']);
        $group->put('/books/{id}', [BookController::class, 'update']);
        $group->delete('/books/{id}', [BookController::class, 'delete']);
    })->add(new AuthMiddleware());
};
