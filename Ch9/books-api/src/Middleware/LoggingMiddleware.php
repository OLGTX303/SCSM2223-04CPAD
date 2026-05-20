<?php

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class LoggingMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $startedAt = microtime(true);
        $response = $handler->handle($request);
        $durationMs = round((microtime(true) - $startedAt) * 1000, 2);

        $this->writeLog(sprintf(
            "[%s] %s %s %d %.2fms\n",
            date('Y-m-d H:i:s'),
            $request->getMethod(),
            $request->getUri()->getPath(),
            $response->getStatusCode(),
            $durationMs
        ));

        return $response;
    }

    private function writeLog(string $line): void
    {
        $logDir = dirname(__DIR__, 2) . '/storage/logs';

        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }

        file_put_contents($logDir . '/requests.log', $line, FILE_APPEND | LOCK_EX);
    }
}
