<?php
class PluginChamadorespostaTicket extends Ticket {

    function getLink($withtype = 0, $options = []) {
        global $DB;

        // Conta apenas as respostas (followups)
        $iterator = $DB->request([
            'COUNT' => 'id',
            'FROM'  => 'glpi_ticketfollowups',
            'WHERE' => ['tickets_id' => $this->fields['id']]
        ]);
        $row = $iterator->next();
        $count = $row['COUNT'] ?? 0;

        // Se houver respostas, adiciona o número antes do título
        $title = $this->fields['name'];
        if ($count > 0) {
            $title = "[".$count."] ".$title;
        }

        // Troca temporariamente o título para exibir no link
        $saved_name = $this->fields['name'];
        $this->fields['name'] = $title;

        $link = parent::getLink($withtype, $options);

        // Restaura o nome original (não altera no banco)
        $this->fields['name'] = $saved_name;

        return $link;
    }
}
