<?php

function replycounter_update_ticket_name(int $tickets_id): void {
   global $DB;

   $tickets_id = (int)$tickets_id;

   // Conta quantas respostas existem para este ticket
   $sql = "SELECT COUNT(*) AS c
             FROM glpi_itilfollowups
            WHERE itemtype = 'Ticket'
              AND items_id = $tickets_id";
   $res = $DB->query($sql);
   $count = 0;
   if ($res) {
      $row = $DB->fetch_assoc($res);
      $count = (int)$row['c'];
   }

   // Atualiza o título do chamado
   $ticket = new Ticket();
   if ($ticket->getFromDB($tickets_id)) {
      $old = $ticket->fields['name'] ?? '';
      // Remove prefixo antigo [N] se já existir
      $base = preg_replace('/^\\[\\d+\\]\\s*/', '', (string)$old);
      $new  = ($count > 0 ? '['.$count.'] ' : '') . $base;

      if ($new !== $old) {
         $ticket->update([
            'id'   => $tickets_id,
            'name' => $new
         ]);
      }
   }
}

// Executado quando uma resposta é adicionada
function replycounter_on_followup_add($item): void {
   if (!($item instanceof ITILFollowup)) { return; }
   if (($item->fields['itemtype'] ?? '') !== 'Ticket') { return; }

   $tickets_id = (int)($item->fields['items_id'] ?? 0);
   if ($tickets_id > 0) {
      replycounter_update_ticket_name($tickets_id);
   }
}

// Executado quando uma resposta é removida
function replycounter_on_followup_purge($item): void {
   if (!($item instanceof ITILFollowup)) { return; }
   if (($item->fields['itemtype'] ?? '') !== 'Ticket') { return; }

   $tickets_id = (int)($item->fields['items_id'] ?? 0);
   if ($tickets_id > 0) {
      replycounter_update_ticket_name($tickets_id);
   }
}

// Instalação / remoção
function plugin_replycounter_install()   { return true; }
function plugin_replycounter_uninstall() { return true; }
