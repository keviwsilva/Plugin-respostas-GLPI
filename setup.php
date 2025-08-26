<?php
use Glpi\Plugin\Hooks;

define('PLUGIN_REPLYCOUNTER_VERSION', '0.1.0');

function plugin_version_replycounter() {
   return [
      'name'         => 'Reply Counter in Ticket Title',
      'version'      => PLUGIN_REPLYCOUNTER_VERSION,
      'author'       => 'Kevin Willlians',
      'license'      => 'GPLv2+',
      'homepage'     => '',
      // importante para o GLPI 10.x reconhecer compatibilidade
      'requirements' => [
         'glpi' => ['min' => '10.0.0', 'max' => '10.0.99'],
         'php'  => ['min' => '7.4']
      ],
   ];
}

function plugin_init_replycounter() {
   global $PLUGIN_HOOKS;

   // Dispara quando UMA resposta é adicionada ao chamado
   $PLUGIN_HOOKS[Hooks::ITEM_ADD]['replycounter'] = [
      'ITILFollowup' => 'replycounter_on_followup_add'
   ];

   // Opcional: mantém o contador correto se apagarem uma resposta
   $PLUGIN_HOOKS[Hooks::ITEM_PURGE]['replycounter'] = [
      'ITILFollowup' => 'replycounter_on_followup_purge'
   ];
}

function plugin_replycounter_check_prerequisites() { return true; }
function plugin_replycounter_check_config()        { return true; }
