<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
header('Access-Control-Allow-Credentials: true');

$userId = null;
if (isset($_COOKIE['glpi_70a0f13dd8971b6c5952053cb97fe86b_rememberme'])) {
    $cookieValue = $_COOKIE['glpi_70a0f13dd8971b6c5952053cb97fe86b_rememberme'];
    $data = json_decode(urldecode($cookieValue), true);
    $userId = isset($data[0]) ? (int)$data[0] : null;
}

echo json_encode(['user_id' => $userId]);
?>
