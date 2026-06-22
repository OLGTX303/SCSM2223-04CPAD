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
            'version' => '4.0.0 (security hardening)',
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
                    'PUT    /api/books/{id}   (owner or admin)',
                    'DELETE /api/books/{id}   (admin only)',
                ],
            ],
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
            | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT));

        return $response->withHeader('Content-Type', 'application/json; charset=utf-8');
    }
}
