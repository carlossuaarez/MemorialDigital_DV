<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$nombre_base_datos = "memorial_db.db";

try {
    $db = new SQLite3($nombre_base_datos);

    // 1. Creamos las tablas con la estructura nueva
    $db->exec("CREATE TABLE IF NOT EXISTS perfil (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        codigo TEXT UNIQUE, 
        name TEXT, 
        birth TEXT, 
        death TEXT, 
        bio TEXT, 
        photo TEXT
    )");
        
    $db->exec("CREATE TABLE IF NOT EXISTS fotos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        perfil_id INTEGER, 
        src TEXT, 
        uploader_name TEXT
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS testimonios (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        perfil_id INTEGER, 
        author TEXT, 
        text TEXT
    )");

    // 2. Insertamos el primer perfil de prueba (Código: TEST1)
    $check1 = $db->querySingle("SELECT count(*) FROM perfil WHERE codigo='TEST1'");
    if ($check1 == 0) {
        $stmt = $db->prepare("INSERT INTO perfil (codigo, name, birth, death, bio, photo) VALUES (:codigo, :name, :birth, :death, :bio, :photo)");
        $stmt->bindValue(':codigo', 'TEST1');
        $stmt->bindValue(':name', 'Juan Pérez');
        $stmt->bindValue(':birth', '1945');
        $stmt->bindValue(':death', '2023');
        $stmt->bindValue(':bio', 'Biografía de prueba para Juan Pérez, accesible con el código TEST1.');
        $stmt->bindValue(':photo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'); 
        $stmt->execute();
        echo "✅ Perfil TEST1 creado.<br>";
    }

    // 3. Insertamos un segundo perfil de prueba (Código: AMIGO2)
    $check2 = $db->querySingle("SELECT count(*) FROM perfil WHERE codigo='AMIGO2'");
    if ($check2 == 0) {
        $stmt = $db->prepare("INSERT INTO perfil (codigo, name, birth, death, bio, photo) VALUES (:codigo, :name, :birth, :death, :bio, :photo)");
        $stmt->bindValue(':codigo', 'AMIGO2');
        $stmt->bindValue(':name', 'María García');
        $stmt->bindValue(':birth', '1950');
        $stmt->bindValue(':death', '2024');
        $stmt->bindValue(':bio', 'Este es el perfil privado de María, accesible solo con el código AMIGO2.');
        $stmt->bindValue(':photo', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400');
        $stmt->execute();
        echo "✅ Perfil AMIGO2 creado.<br>";
    }

    echo "<h1>✅ Base de datos configurada</h1>";
    echo "Ya puedes probar con los códigos: <b>TEST1</b> y <b>AMIGO2</b>";
    echo "<br><br><a href='index.html'>Ir a la aplicación</a>";

} catch (Exception $e) {
    echo "<h1>❌ Error</h1>" . $e->getMessage();
}