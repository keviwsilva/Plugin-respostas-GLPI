<?php

function plugin_ticketfollowups_install() {
    // Aqui você pode criar tabelas no banco se precisar
    return true;
}


function plugin_ticketfollowups_getTicketName($item) {
    if ($item instanceof Ticket) {
        return PluginTicketfollowupsTicket::showTicketWithFollowups($item);
    }
    return $item->getName();
}

