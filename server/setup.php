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

    //Crear tabla perfil
    $db->exec("CREATE TABLE IF NOT EXISTS perfil (
        id INTEGER PRIMARY KEY, 
        name TEXT, 
        birth TEXT, 
        death TEXT, 
        bio TEXT, 
        photo TEXT
    )");

    $check = $db->querySingle("SELECT count(*) FROM perfil WHERE id=1");
    if ($check == 0) {
        $stmt = $db->prepare("INSERT INTO perfil (id, name, birth, death, bio, photo) VALUES (1, :name, :birth, :death, :bio, :photo)");
        $stmt->bindValue(':name', 'Nombre del Ser Querido');
        $stmt->bindValue(':birth', 'Fecha Nacimiento');
        $stmt->bindValue(':death', 'Fecha Partida');
        $stmt->bindValue(':bio', 'Aquí aparecerá la biografía...');
        $stmt->bindValue(':photo', 'https://pro.campus.sanofi/.imaging/mte/portal/256/dam/Portal/Spain/articulos/dislipemia/whats-next-2024/perfil.png/jcr:content/perfil.png'); // Foto genérica
        $stmt->execute();
        echo "✅ Perfil inicial creado correctamente.";
    } else {
        echo "✅ La tabla perfil ya existe.";
    }

    echo "<h1>✅ Base de datos configurada</h1>";
    echo "Archivo creado: <b>" . realpath($nombre_base_datos) . "</b>";
    echo "<br><br><a href='index.html'>Volver a la aplicación</a>";

} 

catch (Exception $e) {
    echo "<h1>❌ Error</h1>" . $e->getMessage();
}