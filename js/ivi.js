/* =========================================================
   IVI INTERIORES — configuração e rastreamento
   ---------------------------------------------------------
   Este arquivo é carregado por TODAS as páginas do site.
   É o único lugar onde ficam o número do WhatsApp e os IDs
   de rastreamento — mexa só aqui.
   ========================================================= */

/* =========================================================
   1. CONFIGURAÇÃO — edite só aqui
   ========================================================= */
var CONFIG = {
  whatsapp: "556139644392",    // 55 + DDD + número, só dígitos: (61) 3964-4392
  pixelId:  "",                // <-- ID do Pixel da Meta (só os números)
  ga4Id:    "",                // <-- G-XXXXXXXXXX
  formEndpoint: ""             // <-- URL /exec do Apps Script. Vazio = cai no WhatsApp
};

/* =========================================================
   2. PLANO DE EVENTOS
   ---------------------------------------------------------
   padrao: true  -> fbq('track', ...)       evento padrão da Meta
   padrao: false -> fbq('trackCustom', ...) evento personalizado

   A distinção importa: evento personalizado enviado com 'track'
   não é reconhecido pela Meta e não aparece direito no
   Gerenciador de Eventos.

   Para otimizar campanha de lead REAL, use "LeadQualificado"
   (botão da página de obrigado), não "Lead" (envio do formulário).
   ========================================================= */
var EVENTOS = {
  ver_peca:         { meta: "ViewContent",          padrao: true  },
  ampliar_foto:     { meta: "AmpliarFoto",          padrao: false },
  filtrar_catalogo: { meta: "FiltrarCatalogo",      padrao: false },
  clique_whatsapp:  { meta: "Contact",              padrao: true  },
  envio_formulario: { meta: "Lead",                 padrao: true  },
  obrigado:         { meta: "CompleteRegistration", padrao: true  },
  lead_qualificado: { meta: "LeadQualificado",      padrao: false }
};

/* =========================================================
   3. Carregamento das tags (só dispara se os IDs existirem)
   ========================================================= */
window.dataLayer = window.dataLayer || [];

if (CONFIG.pixelId) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CONFIG.pixelId);
  fbq('track', 'PageView');
}

if (CONFIG.ga4Id) {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.ga4Id;
  document.head.appendChild(s);
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', CONFIG.ga4Id);
}

/* =========================================================
   4. Disparo de evento
   ---------------------------------------------------------
   rastrear("clique_whatsapp", { peca:"Cadeira Bella",
                                 ambiente:"jantar",
                                 valor:1295 });
   ========================================================= */
function rastrear(evento, dados) {
  dados = dados || {};

  // Camada de dados (GTM, se um dia entrar)
  dataLayer.push(Object.assign({ event: evento }, dados));

  if (window.fbq) {
    var def = EVENTOS[evento];
    if (def) {
      var params = {};
      if (dados.peca)     { params.content_name = dados.peca; params.content_ids = [dados.id || dados.peca]; params.content_type = 'product'; }
      if (dados.ambiente) params.content_category = dados.ambiente;
      if (dados.valor)    { params.value = dados.valor; params.currency = 'BRL'; }
      if (dados.origem)   params.origem = dados.origem;

      // eventID permite deduplicar caso a API de Conversões entre depois.
      var opcoes = { eventID: evento + '.' + Date.now() + '.' + Math.random().toString(36).slice(2, 8) };

      fbq(def.padrao ? 'track' : 'trackCustom', def.meta, params, opcoes);
    }
  }

  if (window.gtag) gtag('event', evento, dados);
}

/* =========================================================
   5. WhatsApp
   ========================================================= */
function linkZap(texto) {
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(texto);
}

function formatar(v) {
  return "R$ " + v.toLocaleString("pt-BR");
}

/* Expõe no window para os scripts das páginas. */
window.CONFIG   = CONFIG;
window.EVENTOS  = EVENTOS;
window.rastrear = rastrear;
window.linkZap  = linkZap;
window.formatar = formatar;
