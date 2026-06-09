<?php

namespace App\Support;

final class Env
{
    private static array $loadedFiles = [];

    public static function load(string $file): void
    {
        if (isset(self::$loadedFiles[$file]) || !is_file($file)) {
            return;
        }

        foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = array_map('trim', explode('=', $line, 2));
            $value = trim($value, "\"'");
            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }

        self::$loadedFiles[$file] = true;
    }

    public static function get(string $key, string $default = ''): string
    {
        $value = $_ENV[$key] ?? getenv($key);

        return $value === false || $value === null ? $default : (string) $value;
    }
}
