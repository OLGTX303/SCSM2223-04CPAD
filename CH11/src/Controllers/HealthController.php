<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class HealthController
{
    public function index(Request $request, Response $response): Response
    {
        $response->getBody()->write(json_encode([
            'name' => 'Books REST API',
            'version' => '3.0.0 (JWT auth)',
            'endpoints' => [
                'public' => [
                    'POST /auth/register',
                    'POST /auth/login',
                    'GET  /api/books',
                    'GET  /api/books/{id}',
                ],
                'protected' => [
                    'GET    /auth/me',
                    'POST   /api/books',
                    'PUT    /api/books/{id}',
                    'DELETE /api/books/{id}   (admin only)',
                ],
            ],
        ], JSON_PRETTY_PRINT));

        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }
}
