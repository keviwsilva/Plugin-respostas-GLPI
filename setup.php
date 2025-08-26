<?php

function plugin_init_ticketfollowups() {
    global $PLUGIN_HOOKS;

    $PLUGIN_HOOKS['csrf_compliant']['ticketfollowups'] = true;

    // Hook para alterar a exibição do Ticket
    $PLUGIN_HOOKS['item_get']['ticketfollowups'] = [
        'Ticket' => 'plugin_ticketfollowups_getTicketName'
    ];
}

function plugin_version_ticketfollowups() {
    return [
        'name'           => 'Ticket Followups Counter',
        'version'        => '1.0.0',
        'author'         => 'Kevin Willians',
        'license'        => 'GPLv2+',
        'homepage'       => 'https://github.com/keviwsilva/replycounter',
        'minGlpiVersion' => '10.0.0'
    ];
}

function plugin_ticketfollowups_check_prerequisites() {
    if (version_compare(GLPI_VERSION, '10.0.0', 'lt')) {
        echo "Este plugin requer GLPI >= 10.0.0";
        return false;
    }
    return true;
}

function plugin_ticketfollowups_check_config() {
    return true;
}
