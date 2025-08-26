<?php

function plugin_ticketfollowups_getTicketName($item) {
    if ($item instanceof Ticket) {
        return PluginTicketfollowupsTicket::showTicketWithFollowups($item);
    }
    return $item->getName();
}
