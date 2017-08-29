<?php

$page = $_REQUEST['page'] ? $_REQUEST['page'] : 1;

$r = [
    'total' => 600,
    'length' => 10,
    'page' => $page,
    'data' => [
        [
            "Maria $page",
            'Silva'
        ],
        [
            "Philipe $page",
            'Barra'
        ],
    ]
];
header('Content-Type: application/json');
echo json_encode($r);