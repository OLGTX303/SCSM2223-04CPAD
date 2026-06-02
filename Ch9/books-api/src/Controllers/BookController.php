<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class BookController
{
    /** GET /api/books - supports ?q= and ?limit= */
    public function index(Request $req, Response $res): Response
    {
        $params = $req->getQueryParams();
        $items = $this->load();

        if (!empty($params['q'])) {
            $q = mb_strtolower((string) $params['q']);
            $items = array_values(array_filter($items, fn ($b) =>
                str_contains(mb_strtolower($b['title']), $q) ||
                str_contains(mb_strtolower($b['author']), $q)
            ));
        }

        if (!empty($params['limit'])) {
            $items = array_slice($items, 0, max(1, (int) $params['limit']));
        }

        return $this->json($res, ['count' => count($items), 'data' => $items]);
    }

    /** GET /api/books/{id} */
    public function show(Request $req, Response $res, array $args): Response
    {
        $books = $this->load();
        $id = (int) ($args['id'] ?? 0);
        $book = $this->findById($books, $id);

        return $book
            ? $this->json($res, $book)
            : $this->json($res, ['error' => "Book {$id} not found"], 404);
    }

    /** POST /api/books */
    public function create(Request $req, Response $res): Response
    {
        $books = $this->load();
        $body = (array) ($req->getParsedBody() ?? []);
        $errors = $this->validate($body, requireAll: true);

        if (!empty($errors)) {
            return $this->json($res, ['errors' => $errors], 400);
        }

        $id = (max(array_column($books, 'id') ?: [0])) + 1;
        $book = [
            'id' => $id,
            'title' => trim($body['title']),
            'author' => trim($body['author']),
            'year' => (int) $body['year'],
            'genre' => trim((string) ($body['genre'] ?? 'Uncategorised')),
        ];

        $books[] = $book;
        $this->save($books);

        return $this->json($res, ['message' => 'Book created', 'data' => $book], 201)
            ->withHeader('Location', '/api/books/' . $id);
    }

    /** PUT /api/books/{id} - full or partial update */
    public function update(Request $req, Response $res, array $args): Response
    {
        $books = $this->load();
        $id = (int) ($args['id'] ?? 0);
        $idx = $this->findIndexById($books, $id);

        if ($idx === null) {
            return $this->json($res, ['error' => "Book {$id} not found"], 404);
        }

        $body = (array) ($req->getParsedBody() ?? []);
        $errors = $this->validate($body, requireAll: false);

        if (!empty($errors)) {
            return $this->json($res, ['errors' => $errors], 400);
        }

        $current = $books[$idx];
        foreach (['title', 'author', 'genre'] as $key) {
            if (array_key_exists($key, $body)) {
                $current[$key] = trim((string) $body[$key]);
            }
        }

        if (array_key_exists('year', $body)) {
            $current['year'] = (int) $body['year'];
        }

        $books[$idx] = $current;
        $this->save($books);

        return $this->json($res, ['message' => 'Book updated', 'data' => $current]);
    }

    /** DELETE /api/books/{id} */
    public function delete(Request $req, Response $res, array $args): Response
    {
        $books = $this->load();
        $id = (int) ($args['id'] ?? 0);
        $idx = $this->findIndexById($books, $id);

        if ($idx === null) {
            return $this->json($res, ['error' => "Book {$id} not found"], 404);
        }

        $deleted = $books[$idx];
        array_splice($books, $idx, 1);
        $this->save($books);

        return $this->json($res, ['message' => 'Book deleted', 'data' => $deleted]);
    }

    /** POST /api/reset */
    public function reset(Request $req, Response $res): Response
    {
        $books = $this->seedBooks();
        $this->save($books);

        return $this->json($res, [
            'message' => 'Seed data restored',
            'count' => count($books),
            'data' => $books,
        ]);
    }

    private function load(): array
    {
        $file = $this->storeFile();

        if (!is_file($file)) {
            $this->save($this->seedBooks());
        }

        $json = file_get_contents($file);
        $books = json_decode($json ?: '[]', true);

        return is_array($books) ? $books : [];
    }

    private function save(array $books): void
    {
        $file = $this->storeFile();
        $dir = dirname($file);

        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        file_put_contents(
            $file,
            json_encode(array_values($books), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
            LOCK_EX
        );
    }

    private function storeFile(): string
    {
        return dirname(__DIR__, 2) . '/var/books.json';
    }

    private function seedBooks(): array
    {
        return require __DIR__ . '/../Data/books.php';
    }

    private function findById(array $books, int $id): ?array
    {
        foreach ($books as $book) {
            if ($book['id'] === $id) {
                return $book;
            }
        }

        return null;
    }

    private function findIndexById(array $books, int $id): ?int
    {
        foreach ($books as $index => $book) {
            if ($book['id'] === $id) {
                return $index;
            }
        }

        return null;
    }

    private function validate(array $body, bool $requireAll): array
    {
        $errors = [];
        $rules = [
            'title' => fn($v) => is_string($v) && trim($v) !== '',
            'author' => fn($v) => is_string($v) && trim($v) !== '',
            'year' => fn($v) => is_numeric($v) && (int) $v >= 1000 && (int) $v <= (int) date('Y'),
        ];

        foreach ($rules as $field => $check) {
            if ($requireAll && !array_key_exists($field, $body)) {
                $errors[$field] = "{$field} is required";
                continue;
            }

            if (array_key_exists($field, $body) && !$check($body[$field])) {
                $errors[$field] = "{$field} is invalid";
            }
        }

        return $errors;
    }

    private function json(Response $res, mixed $data, int $status = 200): Response
    {
        $res->getBody()->write(json_encode($data, JSON_PRETTY_PRINT));

        return $res
            ->withHeader('Content-Type', 'application/json; charset=utf-8')
            ->withStatus($status);
    }
}
