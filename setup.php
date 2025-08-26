<?php
function plugin_init_chamadoresposta() {
    global $PLUGIN_HOOKS;

    $PLUGIN_HOOKS['csrf_compliant']['chamadoresposta'] = true;

    // Dizer ao GLPI que nosso Ticket deve estender o original
    $PLUGIN_HOOKS['item_extend']['chamadoresposta'] = ['Ticket' => 'PluginChamadorespostaTicket'];
}

function plugin_version_chamadoresposta() {
    return [
        'name'           => 'Contador de Respostas',
        'version'        => '1.0.0',
        'author'         => 'Kevin Willians',
        'license'        => 'GPLv2+',
        'homepage'       => 'https://seusite.com',
        'minGlpiVersion' => '10.0.0'
    ];
}
