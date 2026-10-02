<?php
// Alleen voor de lokale testomgeving (wachtwoord bestaat nergens anders). Niet op de server gebruiken.
return [
    'dsn' => 'mysql:host=db;dbname=skilltree;charset=utf8mb4',
    'user' => 'spel',
    'password' => 'local-test-only',
    'origin' => 'https://localhost:8443',
];
