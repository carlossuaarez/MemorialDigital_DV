<?php
include "sqlite.php"; 

$database = "memorial_db";

// 1. Definimos los campos para la tabla de FOTOS
//  Usamos la función rdb_post_table($database, $table)
// El cuerpo de la petición (getBody) debería simular estos datos:
$_POST = [
    "id" => "INTEGER PRIMARY KEY AUTOINCREMENT",
    "src" => "TEXT",
    "uploader_name" => "TEXT"
];

// Simulamos la entrada de datos
function getBody() { 
    return $_POST; 
} 

echo "Creando tabla fotos... <br>";
rdb_post_table($database, "fotos");

// 2. Definimos los campos para la tabla de TESTIMONIOS
$_POST = [
    "id" => "INTEGER PRIMARY KEY AUTOINCREMENT",
    "author" => "TEXT",
    "text" => "TEXT"
];

echo "Creando tabla testimonios... <br>";
rdb_post_table($database, "testimonios");

echo "¡Base de datos lista!";
?>