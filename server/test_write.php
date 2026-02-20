<?php
$file = 'test_permisos.txt';
if (file_put_contents($file, "Prueba de escritura: " . date('Y-m-d H:i:s'))) {
    echo "✅ ÉXITO: El servidor PUEDE escribir en esta carpeta.";
    unlink($file); // Borrar archivo de prueba
} else {
    echo "❌ ERROR: El servidor NO TIENE permisos de escritura en la carpeta 'server/'.";
}
?>