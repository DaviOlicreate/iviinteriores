/**
 * Ivi Interiores — recebe os leads do site e grava na planilha.
 *
 * A planilha já está criada na sua conta:
 *   https://docs.google.com/spreadsheets/d/138BhVPMkqVvJjwAvzV1cy_jrRU-5GVJZZJmZCRseThE/edit
 *
 * COMO INSTALAR (uma vez só):
 *  1. Abra a planilha do link acima.
 *  2. Extensões > Apps Script. Apague o que estiver lá e cole este arquivo inteiro.
 *  3. Salve (ícone de disquete).
 *  4. Implantar > Nova implantação > engrenagem > App da Web.
 *       Executar como:      Eu (sua conta)
 *       Quem pode acessar:  Qualquer pessoa      <-- ESSENCIAL
 *  5. Implantar > Autorizar acesso > sua conta > Avançado >
 *     "Acessar <projeto> (não seguro)" > Permitir.
 *     O aviso aparece porque o script é seu e não passou por revisão do Google.
 *  6. Copie a URL que termina em /exec e cole em CONFIG.formEndpoint,
 *     no index.html — ou me mande que eu colo.
 *
 * AO EDITAR ESTE SCRIPT depois: Implantar > Gerenciar implantações >
 * editar (lápis) > Versão: Nova versão > Implantar. Sem isso a URL
 * continua servindo a versão antiga.
 */

var ABA = 'Leads';

var COLUNAS = [
  'Data/hora',
  'Nome',
  'WhatsApp',
  'Ambiente',
  'Prazo',
  'Mensagem',
  'Origem',
  'Status'
];

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);

    pegarAba_().appendRow([
      new Date(),
      dados.nome     || '',
      dados.telefone || '',
      dados.ambiente || '',
      dados.prazo    || '',
      dados.mensagem || '',
      dados.origem   || 'site-ivi',
      'Novo'
    ]);

    return json_({ ok: true });

  } catch (err) {
    registrarErro_(err, e);
    return json_({ ok: false, erro: String(err) });
  }
}

/** Abrir a URL no navegador responde isto — serve para conferir se está no ar. */
function doGet() {
  return json_({ ok: true, servico: 'Ivi Interiores — recebedor de leads' });
}

function pegarAba_() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA);

  if (!aba) {
    // A planilha nasceu de um CSV, então a primeira aba tem outro nome.
    // Renomeia a existente em vez de deixar uma segunda aba solta.
    var abas = planilha.getSheets();
    aba = (abas.length === 1) ? abas[0].setName(ABA) : planilha.insertSheet(ABA);
  }

  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS);
    formatarCabecalho_(aba);
  } else if (aba.getRange(1, 1).getFontWeight() !== 'bold') {
    formatarCabecalho_(aba);
  }

  return aba;
}

function formatarCabecalho_(aba) {
  var cabecalho = aba.getRange(1, 1, 1, COLUNAS.length);
  cabecalho.setFontWeight('bold');
  cabecalho.setBackground('#241E1A');
  cabecalho.setFontColor('#F1EFEA');
  aba.setFrozenRows(1);
  aba.setColumnWidth(1, 150); // Data/hora
  aba.setColumnWidth(2, 180); // Nome
  aba.setColumnWidth(3, 140); // WhatsApp
  aba.setColumnWidth(6, 320); // Mensagem
}

/** Guarda a falha numa aba separada, para nenhum lead sumir sem deixar rastro. */
function registrarErro_(err, e) {
  try {
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var erros = planilha.getSheetByName('Erros') || planilha.insertSheet('Erros');
    erros.appendRow([
      new Date(),
      String(err),
      (e && e.postData) ? e.postData.contents : ''
    ]);
  } catch (ignorado) {}
}

function json_(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * OPCIONAL: aviso por e-mail a cada lead novo.
 * Para ligar: troque o e-mail e chame avisar_(dados) dentro do doPost,
 * logo depois do appendRow.
 */
function avisar_(dados) {
  MailApp.sendEmail({
    to: 'contato.davioliveira42@gmail.com',
    subject: 'Novo lead do site: ' + (dados.nome || 'sem nome'),
    body:
      'Nome: '     + (dados.nome     || '-') + '\n' +
      'WhatsApp: ' + (dados.telefone || '-') + '\n' +
      'Ambiente: ' + (dados.ambiente || '-') + '\n' +
      'Prazo: '    + (dados.prazo    || '-') + '\n' +
      'Mensagem: ' + (dados.mensagem || '-')
  });
}
