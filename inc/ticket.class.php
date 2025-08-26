<?php

class PluginTicketfollowupsTicket extends Ticket {

    static function showTicketWithFollowups(Ticket $ticket) {
        global $DB;

        // Conta os followups do ticket
        $query = "SELECT COUNT(*) as total 
                  FROM glpi_ticketfollowups 
                  WHERE tickets_id = " . (int)$ticket->getID();
        $result = $DB->query($query);

        $total = 0;
        if ($row = $DB->fetchAssoc($result)) {
            $total = $row['total'];
        }

        // Retorna o título com contador
        $name = $ticket->getName();
        if ($total > 0) {
            $name .= " (" . $total . ")";
        }
        return $name;
    }
}
