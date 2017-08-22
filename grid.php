<?php

$r = [
    'total' => 600,
    'length' => 10,
    'page' => $_REQUEST['page'],
    'data' => [
        [
            'Maria',
            'Silva'
        ],
        [
            'Philipe',
            'Barra'
        ],
    ]
];

echo json_encode($r);