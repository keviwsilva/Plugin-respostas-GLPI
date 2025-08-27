<?php
function plugin_init_customjs() {
    global $PLUGIN_HOOKS;

    $PLUGIN_HOOKS['csrf_compliant']['customjs'] = true;

    // Adiciona JS e CSS em todas as páginas
    $PLUGIN_HOOKS['add_javascript']['customjs'] = ['js/alertas.js'];
    $PLUGIN_HOOKS['add_css']['customjs']        = ['css/style.css'];
}

function plugin_version_customjs() {
    return [
        'name'           => "Custom JS",
        'version'        => '1.0.0',
        'author'         => 'Kevin Willians',
        'license'        => 'GPLv2+',
        'minGlpiVersion' => '10.0.0'
    ];
}

function plugin_customjs_check_prerequisites() {
    if (version_compare(GLPI_VERSION, '10.0.0', 'lt')) {
        echo "Este plugin requer GLPI 10 ou superior";
        return false;
    }
    return true;
}

function plugin_customjs_check_config($verbose = false) {
    return true;
}
