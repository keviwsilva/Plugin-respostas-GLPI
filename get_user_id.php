<?php
// plugins/customjs/get_user_id.php
define('GLPI_ROOT', '../../../../');

// Verificar se a chave existe antes de usar
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$allowed_origin = ($origin && in_array(parse_url($origin, PHP_URL_HOST), ['localhost', '192.168.2.150'])) ? $origin : '*';


$userId = null;

// Verifica se o cookie rememberme existe
if (isset($_COOKIE['glpi_70a0f13dd8971b6c5952053cb97fe86b_rememberme'])) {
    $cookieValue = $_COOKIE['glpi_70a0f13dd8971b6c5952053cb97fe86b_rememberme'];
    
    // Decodifica o valor do cookie
    $decodedValue = urldecode($cookieValue);
    
    // Converte JSON para array
    $data = json_decode($decodedValue, true);
    
    if (json_last_error() === JSON_ERROR_NONE && isset($data[0])) {
        $userId = (int)$data[0];
    }
}

// Resposta JSON
echo json_encode([
    'success' => true,
    'user_id' => $userId,
    'cookie_exists' => isset($_COOKIE['glpi_70a0f13dd8971b6c5952053cb97fe86b_rememberme'])
]);
exit; // Importante: terminar a execução
?>
