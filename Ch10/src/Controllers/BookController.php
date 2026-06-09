<?php

namespace App\Controllers;

use App\Support\Database;
use PDO;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class BookController
{
    /** GET /api/books - supports ?q=, ?limit=, and ?page= */
    public function index(Request $req, Response $res): Response
    {
        $params = $req->getQueryParams();
        $q = trim((string) ($params['q'] ?? ''));
        $limit = max(1, min(100, (int) ($params['limit'] ?? 25)));
        $page = max(1, (int) ($params['page'] ?? 1));
        $offset = ($page - 1) * $limit;

        $whereSql = '';
        $args = [];

        if ($q !== '') {
            $whereSql = ' WHERE title LIKE :q_title OR author LIKE :q_author';
            $args[':q_title'] = '%' . $q . '%';
            $args[':q_author'] = '%' . $q . '%';
        }

        $countSql = 'SELECT COUNT(*) FROM books' . $whereSql;
        $countStmt = Database::pdo()->prepare($countSql);
        foreach ($args as $key => $value) {
            $countStmt->bindValue($key, $value, PDO::PARAM_STR);
        }
        $countStmt->execute();
        $total = (int) $countStmt->fetchColumn();
        $totalPages = max(1, (int) ceil($total / $limit));

        if ($page > $totalPages) {
            $page = $totalPages;
            $offset = ($page - 1) * $limit;
        }

        $sql = 'SELECT id, title, author, year, genre, created_at, updated_at FROM books'
            . $whereSql
            . ' ORDER BY id ASC LIMIT :limit OFFSET :offset';

        $stmt = Database::pdo()->prepare($sql);
        foreach ($args as $key => $value) {
            $stmt->bindValue($key, $value, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $books = $stmt->fetchAll();

        return $this->json($res, [
            'count' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => $totalPages,
            'data' => $books,
        ]);
    }

    /** GET /api/books/{id} */
    public function show(Request $req, Response $res, array $args): Response
    {
        $book = $this->findById((int) ($args['id'] ?? 0));

        return $book
            ? $this->json($res, $book)
            : $this->json($res, ['error' => 'Book not found'], 404);
    }

    /** POST /api/books */
    public function create(Request $req, Response $res): Response
    {
        $body = (array) ($req->getParsedBody() ?? []);
        $errors = $this->validate($body, requireAll: true);

        if ($errors !== []) {
            return $this->json($res, ['errors' => $errors], 400);
        }

        $stmt = Database::pdo()->prepare(
            'INSERT INTO books (title, author, year, genre) VALUES (:title, :author, :year, :genre)'
        );
        $stmt->execute([
            ':title' => trim($body['title']),
            ':author' => trim($body['author']),
            ':year' => (int) $body['year'],
            ':genre' => trim((string) ($body['genre'] ?? 'Uncategorised')),
        ]);

        $id = (int) Database::pdo()->lastInsertId();
        $book = $this->findById($id);

        return $this->json($res, ['message' => 'Book created', 'data' => $book], 201)
            ->withHeader('Location', '/api/books/' . $id);
    }

    /** PUT /api/books/{id} - full or partial update */
    public function update(Request $req, Response $res, array $args): Response
    {
        $id = (int) ($args['id'] ?? 0);
        $current = $this->findById($id);

        if (!$current) {
            return $this->json($res, ['error' => 'Book not found'], 404);
        }

        $body = (array) ($req->getParsedBody() ?? []);
        $errors = $this->validate($body, requireAll: false);

        if ($errors !== []) {
            return $this->json($res, ['errors' => $errors], 400);
        }

        $title = array_key_exists('title', $body) ? trim((string) $body['title']) : $current['title'];
        $author = array_key_exists('author', $body) ? trim((string) $body['author']) : $current['author'];
        $year = array_key_exists('year', $body) ? (int) $body['year'] : (int) $current['year'];
        $genre = array_key_exists('genre', $body) ? trim((string) $body['genre']) : $current['genre'];

        $stmt = Database::pdo()->prepare(
            'UPDATE books
             SET title = :title, author = :author, year = :year, genre = :genre
             WHERE id = :id'
        );
        $stmt->execute([
            ':id' => $id,
            ':title' => $title,
            ':author' => $author,
            ':year' => $year,
            ':genre' => $genre,
        ]);

        return $this->json($res, [
            'message' => 'Book updated',
            'data' => $this->findById($id),
        ]);
    }

    /** DELETE /api/books/{id} */
    public function delete(Request $req, Response $res, array $args): Response
    {
        $id = (int) ($args['id'] ?? 0);
        $book = $this->findById($id);

        if (!$book) {
            return $this->json($res, ['error' => 'Book not found'], 404);
        }

        $stmt = Database::pdo()->prepare('DELETE FROM books WHERE id = :id');
        $stmt->execute([':id' => $id]);

        return $this->json($res, ['message' => 'Book deleted', 'data' => $book]);
    }

    private function findById(int $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT id, title, author, year, genre, created_at, updated_at FROM books WHERE id = :id'
        );
        $stmt->execute([':id' => $id]);
        $book = $stmt->fetch();

        return $book ?: null;
    }

    private function validate(array $body, bool $requireAll): array
    {
        $errors = [];
        $rules = [
            'title' => fn ($v) => is_string($v) && trim($v) !== '',
            'author' => fn ($v) => is_string($v) && trim($v) !== '',
            'year' => fn ($v) => is_numeric($v) && (int) $v >= 1000 && (int) $v <= (int) date('Y'),
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
