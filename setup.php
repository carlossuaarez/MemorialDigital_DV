<?php
// Forzamos que se vean errores si los hay
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Nombre exacto del archivo
$nombre_base_datos = "memorial_db.db";

try {
    $db = new SQLite3($nombre_base_datos);
    
    // Crear tabla de fotos
    $db->exec("CREATE TABLE IF NOT EXISTS fotos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        src TEXT, 
        uploader_name TEXT
    )");
    
    // Crear tabla de testimonios
    $db->exec("CREATE TABLE IF NOT EXISTS testimonios (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        author TEXT, 
        text TEXT
    )");

    echo "<h1>✅ Base de datos configurada</h1>";
    echo "Archivo creado: <b>" . realpath($nombre_base_datos) . "</b>";
    echo "<br><br><a href='index.html'>Volver a la aplicación</a>";

} catch (Exception $e) {
    echo "<h1>❌ Error</h1>" . $e->getMessage();
}