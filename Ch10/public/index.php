<?php

use App\Middleware\Cors;
use App\Middleware\JsonBodyParser;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->add(new JsonBodyParser());
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);
$app->add(new Cors());

(require __DIR__ . '/../src/routes.php')($app);

$app->run();
