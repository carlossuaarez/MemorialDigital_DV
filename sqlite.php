<?php

//// !!! Falta pasar el nombre de la base de datos en la ruta
function router_sqlite($method) {

    global $break;
    if ($break) return;

    /// rdb relational data base
    switch($method)
    {   
        case "POST":
            route("/rdb/([^\/]+)/tables/([^\/]+)" , function($params) {rdb_post_table($params[0],$params[1]);});
            route("/rdb/([^\/]+)/([^\/]+)" , function($params) {rdb_insert($params[0],$params[1]);});
            break;
    
        case "PUT": // colleccion/id
            // USUARIO
            // route(function(&$break) {if (!is_logged_in(false)) {$break=1; print json_encode(["err"=>3,"msg"=>"No conectado"]);};});
            route("/rdb/([^\/]+)/tables/([^\/]+)" , function($params) {rdb_put_table($params[0],$params[1]);});
            route("/rdb/([^\/]+)/([^\/]+)/([^\/]+)" , function($params) {rdb_update($params[0],$params[1],$params[2]);});
            break;
            
        case "GET":    
            // route(function(&$break) {if (!is_logged_in(false)) {$break=1; print json_encode(["err"=>3,"msg"=>"No conectado"]);}});
            route("/rdb/eco" , function($params) {print_r($_SERVER['REQUEST_URI']);});
            route("/rdb/([^\/]+)/tables" , function($params) {rdb_get_tables($params[0]);});
            route("/rdb/([^\/]+)/tables/([^\/]+)" , function($params) {rdb_get_tables($params[0],$params[1]);});
            route("/rdb/([^\/]+)/([^\/]+)" , function($params) {rdb_select($params[0],$params[1]);});
            route("/rdb/([^\/]+)/([^\/]+)/([^\/]+)" , function($params) {rdb_select($params[0],$params[1],$params[2]);});
            break;
    
        case "PATCH":
            // ADMINISTRADOR
            route(function(&$break) {if (!is_admin()) {$break=1; print json_encode(["err"=>4,"msg"=>"No autorizado"]);}});
            // route("/rdb/([^\/]+)/([^\/]+)" , function($params) {patch($params[0],$params[1],$params[2]);});
            break;
        
        case "DELETE":
            // ADMINISTRADOR
            // route(function(&$break) {if (!is_admin()) {$break=1; print json_encode(["err"=>4,"msg"=>"No autorizado"]);}});
            route("/rdb/([^\/]+)/([^\/]+)/([^\/]+)" , function($params) {rdb_delete($params[0],$params[1],$params[2]);});
            break;
    
        case "OPTIONS":
            route(".*", function() { }); // en options entra siempre. Aqui habría que hacer el CORS
            break;
    
        default:
            return;
    }
}

function proccesString($val)
{
	$_value = str_replace("'", "''", $val);
	$parts = explode(",", $_value);
	foreach ($parts as $k => $val) {
		$parts[$k] = "'{$val}'";
	}
	return implode(",", $parts);
}

function rdb_open($database) {
    if (strpbrk($database,",()|;/\\'\""))
        return print "caracter ilegal";

    // $database="dival";
    // $user = is_logged_in();
    $BASE = basepath("/");
    $file = $BASE . "{$database}.db";
    try {
        $bd = new SQLite3($file,SQLITE3_OPEN_CREATE | SQLITE3_OPEN_READWRITE);
        $bd->enableExceptions(true);    
    } catch (Exception $e) {
        print json_encode(["err"=>$e->getMessage(),"file"=>$file,"database"=>$database]);
        exit;
    }    
    /// !!! poner try y exit en fallo
    return $bd; 
}

function rdb_select($database,$table,$docid=NULL) {

    $bd=rdb_open($database);
    // Copia directa para pruebas o cache

    if (!empty($docid)) {
        return print "NO IMPLEMENTADO";
        header("Content-Type: application/json");
    }

    /// Comprobamos si hay una consulta
    $query=array_filter($_REQUEST, function ($key) {return !in_array($key,['limit','offset','fields']);},ARRAY_FILTER_USE_KEY);
    $keys=array_keys($query);

    $select = "SELECT * FROM {$table} where 1=1 ";

	foreach ($query as $key => $value) {        
        $op = substr($key, -1);
        $operators = [">", "<", "|", "!", "^", "_", "%"];
        if (in_array($op, $operators))
            $key = substr($key, 0, -1);
        // $vars[$key] = str_replace("%", "", $value); //Lo necesitamos para la comprobacion REGEXP. Previene inyecciones de código, etc.

        $and = "";
        if ($op == '>')
            $and = " {$key}>='{$value}'";
        else if ($op == '<')
            $and = " {$key}<='{$value}'";
        else if ($op == '|')
            $and = " {$key} in ({$value})";
        else if ($op == '!')
            $and = " {$key}<>'{$value}'";
        else if ($op == '^')
            $and = " {$key}<>'{$value}'";
        else if ($op == "_")
            $and = " {$key} like '{$value}'";
        else if ($op == "%")
            $and = " {$key} like '%{$value}%'";
        /// Falta gestión de expresiones regulares
        else if ($key == "or") {
            /// LIST/APPS?or=a=b|c=d|d=3&and&and&or=e=f
            $or = explode('|', $value);
            $and .= "(";
            foreach ($or as $k => $v) {
                $d = explode("=", $v);
                $vars[$d[0]] = $d[1];
                if ($k === 0)
                    $and .= " REGEXP_LIKE({$d[0]}, :{$d[0]}, 'i') ";
                else
                    $and .= " OR REGEXP_LIKE({$d[0]}, :{$d[0]}, 'i') ";
            }
        } else {
            $and = " {$key} = '{$value}'";
            /// Para valores separados por comas
            // $text = proccesString($value);
            // $and = " {$key} IN ({$text})";
        }

        if (!empty($and)) {
            $select .= " AND {$and}";
        }
    }
	
    // foreach($keys as $key) $select .=" AND {$key} like {$query[$key]}";  /// like es case insensitive

    if (!empty($_REQUEST['limit']))
        $select .=" limit {$_REQUEST['limit']}";
    else     $select .=" limit 100";

    $results=[];

    // CONSULTA GENERAL. BÚSQUEDA POR TEXTO
    if (!empty($_REQUEST['search'])) {
        header("Content-Type: application/json");
        return print json_encode(["items"=>[]]);
    }

    // calcular $count;
    try {
        $result = $bd->query($select);
    } catch (Exception $e) {
        return print json_encode(["err"=>$e->getMessage(),"sql"=>$select]);
    }    

    $items=[];
    while ($row=$result->fetchArray(SQLITE3_ASSOC))    
        array_push($items,$row);

    ///!!! Hacer una consulta para el número de resultados total???

    header("Content-Type: application/json");
    /// !!! Cuenta todos los que tiene el índice, no filtra los criterios adicionales
    return print json_encode(["items"=>$items,"query"=>$select,"itemsCount"=>count($items)]);
}

function rdb_get_tables($database,$table=NULL) {
    $bd=rdb_open($database);

    // $results = $bd->query("SELECT name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%'");
    $sql="SELECT * FROM sqlite_master";
    if (!empty($table)) $sql .= " where name='{$table}'";

    try {
        $result = $bd->query($sql);
    } catch (Exception $e) {
        return print json_encode(["err"=>$e->getMessage(),"sql"=>$sql]);
    }    

    // $result = $bd->query("SELECT * FROM sqlite_schema");
    // $result = $bd->query("SELECT * FROM PRAGMA_TABLE_INFO(ayuntamientos)");

    /// Como no parece poderse acceder a la información de table_info vamos a procesar el select
    $items=[];
    while ($row=$result->fetchArray(SQLITE3_ASSOC)) {
        $columns=process_schema($row);
        $row['columns']=$columns;
        array_push($items,$row);    
    }
    header("Content-Type: application/json");    
    return print json_encode(["items"=>$items,"itemsCount"=>count($items)]);
}

/// Recibe un registro con un descriptor de tabla
function process_schema($row) {
    $columns=[];
    $sql=str_replace("\n","",$row['sql']);
    preg_match('#^.*?\((.+)\)$#',$sql,$create);
    $parts=explode(',',$create[1]);
    foreach($parts as $f) {
        $f=trim($f);
        list($field,$type) = explode(' ',$f,2);  // cortar solo 1 nivel
        $columns[$field]=$type;
    }
    return $columns;
}

function get_schema($bd,$table) {
    $sql="SELECT * FROM sqlite_master where name='{$table}'";
    $result = $bd->query($sql);
    $row=$result->fetchArray(SQLITE3_ASSOC);
    return process_schema($row);    
}

function rdb_post_table($database,$table) {

    $bd=rdb_open($database);
    $data=getBody();

    $table=$bd->escapeString($table);
    $sql="create table {$table} (";  /// If not exists !!!!

    $fields=[];
    $values=[];
    foreach($data as $k=>$v) {
        $k=$bd->escapeString($k);
        $v=$bd->escapeString($v);
        $sql .=" {$k} {$v},";
    }
	$sql = trim($sql, ',');
    $sql .=")";

    try {
        $bd->exec($sql);
    } catch (Exception $e) {
        return print json_encode(["err"=>$e->getMessage(),"sql"=>$sql]);
    }    

    return print json_encode(["ok"=>1,"sql"=>$sql]);
}

function rdb_put_table($database,$table) {
    $bd=rdb_open($database);
    $data=getBody();

    $table=$bd->escapeString($table);
    $sql="alter table {$table} ";

    $fields=[];
    $values=[];
    foreach($data as $k=>$v) {
        $k=$bd->escapeString($k);
        $v=$bd->escapeString($v);
        $sql .=" add {$k} {$v},";
    }
	$sql = trim($sql, ',');

    try {
        $bd->exec($sql);
    } catch (Exception $e) {
        return print json_encode(["err"=>$e->getMessage(),"sql"=>$sql]);
    }    

    return print json_encode(["ok"=>1,"sql"=>$sql]);
}

/// Crear - Nuevo

function rdb_insert($database,$table) {

    $bd=rdb_open($database);
    $data=getBody();
    $schema=get_schema($bd,$table);
    $sql="INSERT INTO {$table}( ";
    
    $fields=[];
    $values=[];
    foreach($data as $k=>$v) {
        array_push($fields,$bd->escapeString($k));
        array_push($values,$bd->escapeString($v));
    }
    $sql .=implode(',',$fields);
    $sql .=") values(";
    $sql .=implode(',',array_map(function($s) { return "'{$s}'";}, $values));
    $sql .=")";

    //// !!! Proteger de inyección de código

    // $sql = 'INSERT INTO table_name(c1,c2)
    //     VALUES(:c1, :c2);'
    // $stmt->execute();
    // $stmt->bindValue(':c1', value1);
    // $stmt->bindValue(':c2', value2);
    // (_id, graduacion) VALUES ('Mahou Clásica ', '5.4%')";

    try {
        $bd->exec($sql);
    } catch (Exception $e) {
        return print json_encode(["err"=>$e->getMessage(),"sql"=>$sql,"fields"=>$fields,"values"=>$values,"data"=>$data,"schema"=>$schema]);
    }    

    return print json_encode(["ok"=>1,"sql"=>$sql,"fields"=>$fields,"values"=>$values,"data"=>$data]);
}

/// EDITA UN DOCUMENTO

// INSERT INTO artists DEFAULT VALUES;

function rdb_update($database,$table,$docid) {
    $bd=rdb_open($database);
    $data=getBody();

    $table=$bd->escapeString($table);
    $sql="UPDATE {$table} set ";

    foreach($data as $k=>$v) {
        $k=$bd->escapeString($k);
        $v=$bd->escapeString($v);
        $sql .=" {$k}='{$v}',";
    }

	$sql = trim($sql, ',');

    $docid=$bd->escapeString($docid);
    $sql.=" WHERE id={$docid}";

    try {
        $res=$bd->exec($sql);
    } catch (Exception $e) {
        return print json_encode(["err"=>$e->getMessage(),"sql"=>$sql]);
    }    

    return print json_encode(["ok"=>1,"sql"=>$sql,"res"=>$res]);
}

// function patch($id) {
    /// No está desarrollo
    // $set=>[A=>B]
    // A=>B
// }

function rdb_delete($database,$table,$docid) {
    $bd=rdb_open($database);
    $table=$bd->escapeString($table);
    $docid=$bd->escapeString($docid);

    $sql="DELETE FROM {$table} WHERE id={$docid}";
    try {
        $res=$bd->exec($sql);
    } catch (Exception $e) {
        return print json_encode(["err"=>$e->getMessage(),"sql"=>$sql]);
    }    
    return print json_encode(["ok"=>1,"res"=>$res]);
}

/// !!! Pasamos los ficheros a _id
// function get_files($dir){
//     return print "Operacion no implementada";
// }
