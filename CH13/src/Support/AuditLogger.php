<?php

namespace App\Support;

use Psr\Http\Message\ServerRequestInterface as Request;
use Throwable;

final class AuditLogger
{
    public static function record(
        string $action,
        ?int $actorId = null,
        ?string $target = null,
        ?Request $request = null,
        ?string $detail = null
    ): void {
        try {
            $ipAddress = null;

            if ($request) {
                $params = $request->getServerParams();
                $ipAddress = (string) ($params['REMOTE_ADDR'] ?? '');
                $ipAddress = $ipAddress !== '' ? $ipAddress : null;
            }

            Database::pdo()->prepare(
                'INSERT INTO audit_log (actor_id, action, target, ip_address, detail)
                 VALUES (:actor_id, :action, :target, :ip_address, :detail)'
            )->execute([
                ':actor_id' => $actorId,
                ':action' => $action,
                ':target' => $target,
                ':ip_address' => $ipAddress,
                ':detail' => $detail,
            ]);
        } catch (Throwable $e) {
            error_log('[Audit] ' . $e->getMessage());
        }
    }
}
