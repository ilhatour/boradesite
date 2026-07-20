// Bora de Site — gerador estático (Node ESM, zero deps)
// Lê data/*.json → escreve index.html + sitemap.xml + robots.txt
// NÃO editar os .html na mão (este script reescreve por cima).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const SITE = read('data/site.json');
const PLANOS = read('data/planos.json');

const GA4 = SITE.ga4 || '';
const URL = SITE.url;
const WA = SITE.contato.whatsapp_num;
const JOTFORM = SITE.contato.jotform;
const LASTMOD = '2026-07-20';

// ---------- helpers ----------
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const wa = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
const WA_DEFAULT = wa('Olá! Vim pelo site e quero criar um site com a Bora de Site.');

// lâmpada — motivo da marca (contorno branco, bulbo amarelo, raios, filamento)
const bulb = (cls = '') => `<svg class="bulb ${cls}" viewBox="0 0 64 90" aria-hidden="true">
  <g class="bulb__rays" stroke="currentColor" stroke-width="3.4" stroke-linecap="round">
    <line x1="32" y1="2" x2="32" y2="11"/>
    <line x1="12" y1="10" x2="17" y2="18"/>
    <line x1="52" y1="10" x2="47" y2="18"/>
    <line x1="3" y1="28" x2="12" y2="31"/>
    <line x1="61" y1="28" x2="52" y2="31"/>
  </g>
  <path class="bulb__glass" d="M32 15c-11.6 0-19 8.6-19 19 0 8 4.8 12.5 7.6 16.2 2 2.6 2.9 4.4 3.2 7.3h16.4c.3-2.9 1.2-4.7 3.2-7.3C46.2 46.5 51 42 51 34c0-10.4-7.4-19-19-19Z" fill="var(--cta)" stroke="#fff" stroke-width="3.2" stroke-linejoin="round"/>
  <path class="bulb__fila" d="M31 52V44M35 52v-8M27 40q3-6 5 0 2 6 5 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round">
    <line x1="24" y1="63" x2="40" y2="63"/>
    <line x1="25" y1="69" x2="39" y2="69"/>
    <line x1="27" y1="75" x2="37" y2="75"/>
  </g>
</svg>`;

// onda divisória — fica DENTRO da seção (topo, absolute), fill = cor da seção de cima.
// path com overshoot -6px + overflow visible = zero filete de 1px (aprendizado VDB).
const wave = (fillAbove, flip = false) => `<div class="wave" aria-hidden="true"><svg viewBox="0 0 1440 64" preserveAspectRatio="none"${flip ? ' style="transform:scaleX(-1)"' : ''}><path fill="${fillAbove}" d="M0 -6h1440v26c-186 30-424 44-722 30C428 36 186 58 0 46Z"/></svg></div>`;

const ICONS = {
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.7 0 2-1.3 1.2-2.2-.8-.9-.5-2.2.8-2.2H16a5 5 0 0 0 5-5c0-4.4-4-6.6-9-6.6Z"/><circle cx="7.5" cy="11.5" r="1.3"/><circle cx="12" cy="8" r="1.3"/><circle cx="16.5" cy="11.5" r="1.3"/>',
  file: '<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/>',
  google: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',
  check: '<path d="M5 12l4 4 10-11"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  bolt: '<path d="M13 3 5 13h5l-1 8 8-11h-5l1-7Z"/>'
};
const ic = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

const waLogo = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.44 9.44 0 0 1 14.66-11.7 9.38 9.38 0 0 1 2.77 6.68c0 5.2-4.24 9.44-9.44 9.44Zm8.03-17.47A11.36 11.36 0 0 0 12.04.7C5.8.7.72 5.78.72 12.02c0 2 .52 3.95 1.52 5.67L.62 23.3l5.75-1.51a11.3 11.3 0 0 0 5.67 1.44h.01c6.24 0 11.32-5.08 11.32-11.32 0-3.03-1.18-5.87-3.29-8Z"/></svg>`;
const igLogo = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>`;

// ---------- shell ----------
function head(title, desc, canonical, jsonld = []) {
  const ga = GA4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4}');</script>` : '';
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Bora de Site">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${URL}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#414F79">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/img/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/styles.css">
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
${ga}
</head>
<body>
<script>document.documentElement.classList.add('js')</script>
<a class="skip" href="#main">Pular para o conteúdo</a>
${header()}
<main id="main">`;
}

const foot = () => `</main>
${footer()}
${floatBtns()}
<script src="/assets/js/main.js" defer></script>
</body></html>`;

function header() {
  const links = SITE.nav.map(n => `<a href="${n.href}">${esc(n.label)}</a>`).join('');
  return `<header class="hd" id="hd">
  <div class="hd__in wrap">
    <a class="brand" href="/" aria-label="Bora de Site — início">
      <img class="brand__mark" src="/assets/img/logo-circle-t.png" alt="" width="40" height="40">
      <span class="brand__wm">Bora de Site</span>
    </a>
    <nav class="hd__nav" aria-label="Principal">${links}</nav>
    <a class="btn btn--cta hd__cta" href="${WA_DEFAULT}" data-wa>${waLogo}<span>Falar no WhatsApp</span></a>
    <button class="hd__burger" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
  <div class="hd__mobile" hidden>
    ${SITE.nav.map(n => `<a href="${n.href}">${esc(n.label)}</a>`).join('')}
    <a class="btn btn--cta" href="${WA_DEFAULT}" data-wa>${waLogo}<span>Falar no WhatsApp</span></a>
  </div>
</header>`;
}

function footer() {
  return `<footer class="ft">
  <div class="wrap ft__in">
    <div class="ft__brand">
      <img src="/assets/img/logo-circle-t.png" alt="" width="52" height="52">
      <div>
        <strong>Bora de Site</strong>
        <p>Presença de gente grande pro seu negócio.</p>
      </div>
    </div>
    <nav class="ft__nav" aria-label="Rodapé">
      ${SITE.nav.map(n => `<a href="${n.href}">${esc(n.label)}</a>`).join('')}
    </nav>
    <div class="ft__contact">
      <a href="${WA_DEFAULT}" data-wa>${waLogo}<span>${esc(SITE.contato.whatsapp_display)}</span></a>
      <a href="mailto:${SITE.contato.email}">✉ ${esc(SITE.contato.email)}</a>
      <a href="${SITE.contato.instagram_url}" rel="noopener">${igLogo}<span>@${esc(SITE.contato.instagram)}</span></a>
    </div>
  </div>
  <div class="wrap ft__legal">
    <span>© 2026 Bora de Site · Criação de sites profissionais</span>
    <span>Feito pra converter.</span>
  </div>
</footer>`;
}

function floatBtns() {
  return `<div class="floats" id="floats">
  <a class="float float--wa" href="${WA_DEFAULT}" data-wa aria-label="Falar no WhatsApp">${waLogo}</a>
  <a class="float float--ig" href="${SITE.contato.instagram_url}" rel="noopener" aria-label="Instagram">${igLogo}</a>
</div>`;
}

// ---------- HOME sections ----------
function heroSec() {
  return `<section class="hero">
  <div class="wrap hero__in">
    <p class="eyebrow eyebrow--y">${ic('bolt')} Criação de sites que convertem</p>
    <h1 class="hero__h1">Presença de <span class="hl">gente grande</span> pro seu negócio.</h1>
    <p class="hero__sub">Sites que vendem, ranqueiam no Google e geram autoridade — no ar em <strong>7 dias</strong>, sem burocracia. Você investe uma vez; o site trabalha por você o tempo todo.</p>
    <div class="hero__cta">
      <a class="btn btn--cta btn--lg" href="${JOTFORM}" rel="noopener">Começar meu site ${ic('arrow')}</a>
      <a class="btn btn--ghost btn--lg" href="${WA_DEFAULT}" data-wa>${waLogo}<span>Falar no WhatsApp</span></a>
    </div>
    <ul class="hero__trust">
      <li>${ic('check')} 6 sites no ar</li>
      <li>${ic('check')} Método validado</li>
      <li>${ic('check')} Prévia antes de fechar</li>
    </ul>
  </div>
  ${bulb('hero__bulb')}
</section>`;
}

function porqueSec() {
  const vantagens = [
    'Autoridade — sua empresa levada a sério.',
    'Um link só pra enviar pra qualquer cliente.',
    'Achado no Google por quem já quer comprar.',
    'À frente de quem só pensa em Instagram.',
    'Um portfólio pronto pra apresentar.',
    'Mais vendas, mais leads no WhatsApp.'
  ];
  return `<section class="sec sec--white" id="porque">
  ${wave('var(--navy-d)')}
  <div class="wrap">
    <div class="sec__head reveal">
      <p class="eyebrow">Por que um site</p>
      <h2>Todo mundo pensa no Instagram.<br>Poucos têm um bom site.</h2>
      <p class="lead">Rede social você aluga — o alcance muda toda semana. <strong>O site é seu.</strong> É o feijão com arroz que a maioria esquece: concentra suas informações, gera autoridade e é encontrado por quem está pronto pra comprar.</p>
    </div>
    <ul class="vant">
      ${vantagens.map(v => `<li class="vant__item reveal">${ic('check', 'vant__ic')}<span>${esc(v)}</span></li>`).join('')}
    </ul>
  </div>
</section>`;
}

function comoSec() {
  const steps = [
    ['palette', 'Identidade visual', 'Definimos sua paleta e entregamos 3 opções feitas pra sua marca.'],
    ['file', 'Briefing → Site', 'Você preenche o briefing; a gente constrói o site com a cara do seu negócio.'],
    ['google', 'Ficha do Google', 'Criamos seu Perfil da Empresa — seu lugar no maior buscador do mundo.'],
    ['list', 'Cadastro de serviços no Google', 'Tudo que você faz, cadastrado e achável dentro do Google.'],
    ['search', 'SEO completo', 'Você já entra ranqueando nas principais buscas do seu nicho.']
  ];
  return `<section class="sec sec--soft" id="como">
  ${wave('var(--white)', true)}
  <div class="wrap">
    <div class="sec__head reveal">
      <p class="eyebrow">Como funciona</p>
      <h2>Seu site no ar em 7 dias</h2>
      <p class="lead">Um processo, não um improviso. Cinco passos até você aparecer no Google com autoridade.</p>
    </div>
    <ol class="trail">
      ${steps.map(([icon, t, d], i) => `<li class="trail__step reveal" style="--i:${i}">
        <span class="trail__node">${ic(icon)}</span>
        <div class="trail__body">
          <span class="trail__k">Passo ${i + 1}</span>
          <h3>${esc(t)}</h3>
          <p>${esc(d)}</p>
        </div>
      </li>`).join('')}
      <li class="trail__step trail__step--end reveal" style="--i:${steps.length}">
        <span class="trail__node trail__node--bulb">${bulb('trail__bulb')}</span>
        <div class="trail__body">
          <span class="trail__k trail__k--y">Pronto</span>
          <h3>Site no ar, vendendo por você</h3>
          <p>Com WhatsApp, SEO e ficha do Google — do jeito das grandes empresas.</p>
        </div>
      </li>
    </ol>
  </div>
</section>`;
}

function planosSec() {
  const badge = { full: 'Mais escolhido' };
  const cards = PLANOS.planos.map(p => `<article class="plan ${p.slug === 'full' ? 'plan--feat' : ''} reveal">
    ${badge[p.slug] ? `<span class="plan__badge">${badge[p.slug]}</span>` : ''}
    <h3 class="plan__name">${esc(p.nome)}</h3>
    <p class="plan__price">${esc(p.preco_display)}</p>
    <p class="plan__resumo">${esc(p.resumo)}</p>
    <ul class="plan__list">
      ${p.inclui.map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}
    </ul>
    ${p.destaque ? `<p class="plan__note">${bulbMini()}<span>${esc(p.destaque)}</span></p>` : ''}
    <a class="btn ${p.slug === 'full' ? 'btn--cta' : 'btn--dark'} plan__cta" href="${wa('Olá! Tenho interesse no plano ' + p.nome + ' (' + p.preco_display + '). Pode me explicar?')}" data-wa>Quero o ${esc(p.nome)}</a>
  </article>`).join('');
  const r = PLANOS.recorrencia, a = PLANOS.addon_google;
  return `<section class="sec sec--white" id="planos">
  ${wave('var(--bg)')}
  <div class="wrap">
    <div class="sec__head reveal">
      <p class="eyebrow">Planos</p>
      <h2>Escolha o tamanho da sua presença</h2>
      <p class="lead">Preço claro, sem enrolação. Todo plano sai no ar em 7 dias, com ficha do Google e SEO inclusos.</p>
    </div>
    <div class="plans">${cards}</div>
    <div class="extras">
      <div class="extra reveal">
        <p class="extra__k">Depois do lançamento</p>
        <h3>${esc(r.nome)}</h3>
        <p class="extra__price">${esc(r.preco_display)}</p>
        <ul class="plan__list">
          ${r.inclui.map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}
        </ul>
      </div>
      <div class="extra reveal">
        <p class="extra__k">Complemento único</p>
        <h3>${esc(a.nome)}</h3>
        <p class="extra__price">${esc(a.preco_display)}</p>
        <p class="extra__desc">${esc(a.descricao)}</p>
      </div>
    </div>
  </div>
</section>`;
}

// mini-lâmpada pro selo de nota do plano
const bulbMini = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" class="ic"><path d="M12 3a6.5 6.5 0 0 0-4 11.6c.8.7 1.3 1.4 1.5 2.4h5c.2-1 .7-1.7 1.5-2.4A6.5 6.5 0 0 0 12 3Z"/><path d="M10 20h4"/></svg>`;

function portfolioSec() {
  const cards = PLANOS.portfolio.map(s => `<a class="pf" href="${s.url}" rel="noopener">
    <img class="pf__shot" src="/assets/img/portfolio/${s.img}" alt="Site ${esc(s.nome)} — ${esc(s.nicho)}" width="1000" height="625" loading="lazy">
    <span class="pf__body">
      <span class="pf__nicho">${esc(s.nicho)}</span>
      <strong class="pf__nome">${esc(s.nome)}</strong>
      <span class="pf__url">${esc(s.url.replace('https://', ''))} ${ic('arrow')}</span>
    </span>
  </a>`).join('');
  return `<section class="sec sec--soft" id="portfolio">
  ${wave('var(--white)', true)}
  <div class="wrap">
    <div class="sec__head sec__head--row reveal">
      <div>
        <p class="eyebrow">Portfólio</p>
        <h2>Sites que já estão no ar</h2>
        <p class="lead">Do turismo ao SaaS — a mesma régua de qualidade em cada projeto. Dá uma olhada.</p>
      </div>
      <div class="pfs__navbtns" aria-hidden="true">
        <button class="pfs__btn" data-dir="-1" aria-label="Anterior">${ic('arrow', 'ic--flip')}</button>
        <button class="pfs__btn" data-dir="1" aria-label="Próximo">${ic('arrow')}</button>
      </div>
    </div>
  </div>
  <div class="pfs reveal" id="pfs">${cards}</div>
</section>`;
}

function garantiaSec() {
  return `<section class="sec sec--white" id="garantia">
  ${wave('var(--bg)')}
  <div class="wrap garantia">
    <div class="garantia__card reveal">
      <p class="eyebrow eyebrow--y">Garantia</p>
      <h2>Você vê antes de pagar</h2>
      <p class="lead">A gente cria uma prévia do seu site antes de você fechar. <strong>Gostou do design? Fecha. Não gostou? Não paga nada</strong> e o contrato é cancelado. Sem risco, sem surpresa.</p>
      <p class="garantia__note">Não é sobre um site "revolucionário" — é um template validado no mercado, incorporado ao Google (ficha + paleta + SEO). O que faz o seu negócio crescer.</p>
    </div>
  </div>
</section>`;
}

function formSec() {
  const nichos = ['Turismo', 'Serviços locais', 'Saúde e bem-estar', 'Loja / e-commerce', 'Marca pessoal', 'Outro'];
  return `<section class="sec sec--soft" id="contato">
  ${wave('var(--white)', true)}
  <div class="wrap cform__grid">
    <div class="cform__copy reveal">
      <p class="eyebrow">Contato</p>
      <h2>Conta rápido sobre o seu negócio</h2>
      <p class="lead">Preenche aqui que a mensagem chega pronta no nosso WhatsApp — a gente já entra na conversa sabendo como te ajudar.</p>
      <ul class="hero__trust cform__trust">
        <li>${ic('check')} Resposta rápida</li>
        <li>${ic('check')} Sem compromisso</li>
        <li>${ic('check')} Prévia grátis do design</li>
      </ul>
    </div>
    <form class="cform reveal" id="cform" data-wa-num="${WA}">
      <div class="cform__row">
        <label>Seu nome<input type="text" name="nome" required autocomplete="name" placeholder="Como você se chama?"></label>
        <label>Cargo na empresa<input type="text" name="cargo" placeholder="Dono, gerente, sócio…"></label>
      </div>
      <div class="cform__row">
        <label>Nome da empresa<input type="text" name="empresa" required autocomplete="organization" placeholder="Sua empresa"></label>
        <label>Instagram da empresa<input type="text" name="instagram" placeholder="@suaempresa"></label>
      </div>
      <div class="cform__row">
        <label>WhatsApp / telefone<input type="tel" name="fone" required autocomplete="tel" placeholder="(21) 9 9999-9999"></label>
        <label>Nicho de atuação<select name="nicho">${nichos.map(n => `<option>${n}</option>`).join('')}</select></label>
      </div>
      <button class="btn btn--cta btn--lg cform__send" type="submit">${waLogo}<span>Enviar pro WhatsApp</span></button>
      <p class="cform__note">Abre o seu WhatsApp com a mensagem pronta — é só apertar enviar.</p>
    </form>
  </div>
</section>`;
}

function contatoSec() {
  return `<section class="sec sec--navy cta-final" id="bora">
  ${wave('var(--bg)')}
  <div class="wrap cta-final__in">
    ${bulb('cta-final__bulb')}
    <h2>É só olhar pros lados: toda grande empresa tem um site.<br><span class="hl">Só falta você.</span></h2>
    <p class="cta-final__slogan">E aí? <strong>Bora de Site!?</strong></p>
    <div class="hero__cta">
      <a class="btn btn--cta btn--lg" href="${JOTFORM}" rel="noopener">Começar meu site ${ic('arrow')}</a>
      <a class="btn btn--ghost btn--lg" href="${WA_DEFAULT}" data-wa>${waLogo}<span>Falar no WhatsApp</span></a>
    </div>
    <p class="cta-final__foot">${esc(SITE.contato.email)} · @${esc(SITE.contato.instagram)}</p>
  </div>
</section>`;
}

// ---------- pages ----------
function buildHome() {
  const title = 'Bora de Site | Criação de Sites Profissionais que Convertem';
  const desc = 'Criamos sites que vendem, ranqueiam no Google e geram autoridade para pequenos negócios — no ar em 7 dias. Planos a partir de R$ 3.000. Presença de gente grande pro seu negócio.';
  const jsonld = [
    {
      '@context': 'https://schema.org', '@type': 'Organization',
      name: 'Bora de Site', url: URL, logo: `${URL}/assets/img/favicon-512.png`,
      description: desc,
      email: SITE.contato.email,
      sameAs: [SITE.contato.instagram_url],
      contactPoint: { '@type': 'ContactPoint', contactType: 'sales', telephone: '+55' + WA.slice(2), availableLanguage: 'Portuguese' }
    },
    {
      '@context': 'https://schema.org', '@type': 'Service',
      serviceType: 'Criação de sites profissionais', provider: { '@type': 'Organization', name: 'Bora de Site', url: URL },
      areaServed: 'BR', description: desc,
      offers: PLANOS.planos.map(p => ({ '@type': 'Offer', name: 'Plano ' + p.nome, price: p.preco, priceCurrency: 'BRL', url: URL + '/#planos' }))
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [
        ['Em quanto tempo o site fica pronto?', 'Entregamos o site no ar em 7 dias, com ficha do Google e SEO inclusos.'],
        ['Quanto custa um site na Bora de Site?', 'Os planos são: Master por R$ 3.000, Super Site por R$ 4.000 (inclui blog) e Site 360° por R$ 5.000 (inclui landing page de alta conversão).'],
        ['Consigo ver o site antes de pagar?', 'Sim. Criamos uma prévia do seu site antes da contratação. Se você não gostar do design, não paga nada e o contrato é cancelado.'],
        ['O site já vem otimizado para o Google?', 'Sim. Antes de entregar, fazemos um trabalho completo de SEO e criamos sua ficha do Google (Perfil da Empresa) com os serviços cadastrados.']
      ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
    }
  ];
  return head(title, desc, URL + '/', jsonld)
    + heroSec() + porqueSec() + comoSec() + planosSec() + portfolioSec() + garantiaSec() + formSec() + contatoSec()
    + foot();
}

// ---------- páginas internas ----------
const BLOG = read('data/blog.json');

function subhero(eyebrow, h1, lead) {
  return `<section class="subhero">
  <div class="wrap">
    <p class="eyebrow eyebrow--y">${esc(eyebrow)}</p>
    <h1>${esc(h1)}</h1>
    ${lead ? `<p class="subhero__lead">${esc(lead)}</p>` : ''}
  </div>
</section>`;
}

const crumbs = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: URL + url }))
});

const faqLd = (faqs) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
});

function faqBlock(faqs) {
  return `<div class="faq">${faqs.map(([q, a]) => `<details class="faq__item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
}

const ctaBand = () => `<div class="prose__cta">
  <a class="btn btn--cta btn--lg" href="${JOTFORM}" rel="noopener">Começar meu site ${ic('arrow')}</a>
  <a class="btn btn--dark btn--lg" href="${WA_DEFAULT}" data-wa>${waLogo}<span>Falar no WhatsApp</span></a>
</div>`;

function buildCriacao() {
  const title = 'Criação de Sites Profissionais em 7 Dias | Bora de Site';
  const desc = 'Empresa de criação de sites para pequenos e médios negócios: site de 5 seções focado em conversão, ficha do Google e SEO inclusos, no ar em 7 dias. Prévia grátis do design.';
  const faqs = [
    ['Como funciona o processo de criação do site?', 'Em 5 passos: definimos sua identidade visual (3 opções de paleta), você preenche o briefing, criamos o site, montamos sua ficha do Google com os serviços cadastrados e fazemos o SEO completo antes de entregar. Tudo em 7 dias.'],
    ['Preciso entender de tecnologia?', 'Não. Você só preenche o briefing com as informações da sua empresa. A parte técnica — construção, hospedagem, domínio, Google — é toda por nossa conta.'],
    ['Posso ver o site antes de pagar?', 'Sim. Criamos uma prévia do design antes de você fechar. Gostou? Fecha. Não gostou? Não paga nada.'],
    ['Consigo alterar o site depois de pronto?', 'O site é entregue em HTML, sem painel de edição. Alterações são feitas pela nossa equipe — na consultoria mensal (R$ 500/mês) você tem 4 horas de ajustes por mês, com solicitações via formulário.'],
    ['Vocês cuidam da hospedagem e do domínio?', 'Podemos cuidar de tudo em contrato, com transferência garantida pra você em até 30 dias caso solicite. Ou você contrata por conta própria (~R$ 500/ano em média) e nos entrega os acessos.']
  ];
  const jsonld = [crumbs([['Início', '/'], ['Criação de sites', '/criacao-de-sites.html']]), faqLd(faqs)];
  const body = `${subhero('Criação de sites', 'Criação de sites profissionais, sem burocracia', 'Site de verdade, focado em conversão — no ar em 7 dias, com ficha do Google e SEO inclusos.')}
<section class="sec sec--white">
  ${wave('var(--navy-d)')}
  <div class="wrap prose">
    <h2>Um site que faz o pequeno negócio parecer gente grande</h2>
    <p>A Bora de Site cria sites objetivos para pequenos e médios negócios: turismo, serviços locais, lojas e marcas pessoais. Nada de projeto arrastado — a estrutura é validada no mercado: <strong>5 seções que convertem</strong>, até 5 produtos ou serviços em destaque, botão de WhatsApp e uma ação principal clara.</p>
    <h2>O que está incluso em todo projeto</h2>
    <ul>
      <li><strong>Identidade visual:</strong> definimos a paleta com você — entregamos 3 opções.</li>
      <li><strong>Site completo:</strong> home de 5 seções + páginas dos seus produtos ou serviços.</li>
      <li><strong>Ficha do Google:</strong> criamos seu Perfil da Empresa e cadastramos seus serviços.</li>
      <li><strong>SEO:</strong> seu site já sai ranqueando nas buscas do seu nicho.</li>
      <li><strong>Prazo:</strong> 7 dias, da assinatura à entrega.</li>
    </ul>
    <p>Prestador de serviços? Destacamos seus principais serviços. Lojista? Trabalhamos por categorias do que você vende.</p>
    <h2>Garantia: você vê antes de pagar</h2>
    <p>Criamos uma prévia do seu site antes da contratação. Se você não gostar do design, não paga nada e o contrato é cancelado. Transparência total sobre o que você vai receber.</p>
    ${ctaBand()}
    <h2>Perguntas frequentes</h2>
    ${faqBlock(faqs)}
    <p class="prose__links">Veja também: <a href="/quanto-custa-um-site.html">quanto custa um site profissional</a> · <a href="/#portfolio">nosso portfólio</a> · <a href="/blog.html">blog</a></p>
  </div>
</section>`;
  return head(title, desc, URL + '/criacao-de-sites.html', jsonld) + body + foot();
}

function buildQuantoCusta() {
  const title = 'Quanto Custa um Site Profissional? Preços claros | Bora de Site';
  const desc = 'Quanto custa criar um site profissional? Na Bora de Site os preços são públicos: planos de R$ 3.000 a R$ 5.000, com ficha do Google e SEO inclusos, entrega em 7 dias.';
  const faqs = [
    ['Quanto custa um site profissional na Bora de Site?', 'R$ 3.000 (Master), R$ 4.000 (Super Site, com blog) ou R$ 5.000 (Site 360°, com landing page de alta conversão). Todos incluem ficha do Google e SEO, entregues em 7 dias.'],
    ['O que está incluso no preço?', 'Paleta de cores, site completo de 5 seções, ficha do Google com serviços cadastrados e trabalho completo de SEO. Nos planos maiores, blog com 3 postagens e landing page.'],
    ['Quanto custam hospedagem e domínio?', 'Ficam por conta do cliente — em média R$ 500 por ano. Se preferir, cuidamos de tudo em contrato, com transferência garantida em até 30 dias caso você solicite.'],
    ['Existe mensalidade?', 'Não é obrigatória. Quem quiser acompanhamento contrata a consultoria por R$ 500/mês: 2 postagens no blog, 4 horas de ajustes (até 1 solicitação por semana), 1 postagem no Google e análise de desempenho quinzenal.'],
    ['E se eu não gostar do resultado?', 'Você vê uma prévia do design antes de fechar. Não gostou? Não paga nada.']
  ];
  const jsonld = [
    crumbs([['Início', '/'], ['Quanto custa um site', '/quanto-custa-um-site.html']]),
    faqLd(faqs),
    {
      '@context': 'https://schema.org', '@type': 'Service',
      serviceType: 'Criação de site profissional', provider: { '@type': 'Organization', name: 'Bora de Site', url: URL },
      areaServed: 'BR',
      offers: {
        '@type': 'AggregateOffer', priceCurrency: 'BRL',
        lowPrice: 3000, highPrice: 5000, offerCount: PLANOS.planos.length,
        offers: PLANOS.planos.map(p => ({ '@type': 'Offer', name: 'Plano ' + p.nome, price: p.preco, priceCurrency: 'BRL' }))
      }
    }
  ];
  const planosRows = PLANOS.planos.map(p => `<tr><td><strong>${esc(p.nome)}</strong></td><td class="num">${esc(p.preco_display)}</td><td>${p.inclui.map(esc).join(' · ')}</td></tr>`).join('');
  const body = `${subhero('Preços', 'Quanto custa um site profissional?', 'Aqui o preço é público — como a gente acha que deveria ser em todo lugar.')}
<section class="sec sec--white">
  ${wave('var(--navy-d)')}
  <div class="wrap prose">
    <p>Se você já pesquisou <strong>quanto custa criar um site</strong>, sabe que quase ninguém publica preço. Na Bora de Site o valor é claro desde o começo: são três planos fechados, com tudo incluso e entrega em <strong>7 dias</strong>.</p>
    <h2>Tabela de preços</h2>
    <div class="prose__tablewrap"><table class="ptable">
      <thead><tr><th>Plano</th><th>Preço</th><th>O que inclui</th></tr></thead>
      <tbody>${planosRows}</tbody>
    </table></div>
    <h2>Custos que rodam por fora</h2>
    <ul>
      <li><strong>Hospedagem + domínio:</strong> por conta do cliente, em média R$ 500/ano. Podemos cuidar de tudo em contrato.</li>
      <li><strong>Consultoria mensal (opcional):</strong> R$ 500/mês — 2 posts no blog, 4h de ajustes (até 1 solicitação/semana), 1 post no Google e análise quinzenal.</li>
      <li><strong>Ferramentas de medição do Google (opcional):</strong> R$ 1.000 únicos — rastreamento completo do tráfego pra relatórios mais assertivos.</li>
    </ul>
    <h2>Por que não é "site de R$ 300"?</h2>
    <p>Porque o barato que não aparece no Google sai caro. Aqui o site nasce com <strong>SEO completo</strong> e <strong>ficha do Google</strong> — as duas coisas que fazem alguém realmente te encontrar. É preço justo pra um site que entrega resultado, não um cartão de visitas parado.</p>
    ${ctaBand()}
    <h2>Perguntas frequentes sobre preço</h2>
    ${faqBlock(faqs)}
    <p class="prose__links">Veja também: <a href="/criacao-de-sites.html">como funciona a criação do site</a> · <a href="/#planos">planos em detalhe</a></p>
  </div>
</section>`;
  return head(title, desc, URL + '/quanto-custa-um-site.html', jsonld) + body + foot();
}

// ---------- blog ----------
function renderBlocks(blocks) {
  return blocks.map(b => {
    if (typeof b === 'string') return `<p>${esc(b)}</p>`;
    if (b.h2) return `<h2>${esc(b.h2)}</h2>`;
    if (b.lista) return `<ul>${b.lista.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (b.html) return b.html; // trusted — escrito por nós
    return '';
  }).join('\n');
}

function buildBlogIndex() {
  const title = 'Blog | Bora de Site — presença digital pra pequenos negócios';
  const desc = 'Conteúdo direto ao ponto sobre sites, Google e presença digital pra pequenos e médios negócios.';
  const cards = BLOG.posts.map(p => `<a class="bpost reveal" href="/blog/${p.slug}.html">
    <span class="pf__nicho">${esc(p.categoria)}</span>
    <strong class="bpost__t">${esc(p.titulo)}</strong>
    <span class="bpost__r">${esc(p.resumo)}</span>
    <span class="pf__url">Ler artigo ${ic('arrow')}</span>
  </a>`).join('');
  const jsonld = [crumbs([['Início', '/'], ['Blog', '/blog.html']]), {
    '@context': 'https://schema.org', '@type': 'Blog', name: 'Blog da Bora de Site', url: URL + '/blog.html',
    blogPost: BLOG.posts.map(p => ({ '@type': 'BlogPosting', headline: p.titulo, datePublished: p.data, url: `${URL}/blog/${p.slug}.html` }))
  }];
  const body = `${subhero('Blog', 'Presença digital, sem enrolação', 'O que sua empresa precisa saber sobre site, Google e conversão.')}
<section class="sec sec--white">
  ${wave('var(--navy-d)')}
  <div class="wrap"><div class="bposts">${cards}</div></div>
</section>`;
  return head(title, desc, URL + '/blog.html', jsonld) + body + foot();
}

function buildPost(p) {
  const canonical = `${URL}/blog/${p.slug}.html`;
  const jsonld = [
    crumbs([['Início', '/'], ['Blog', '/blog.html'], [p.titulo, `/blog/${p.slug}.html`]]),
    {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: p.titulo, description: p.resumo, datePublished: p.data, dateModified: p.data,
      author: { '@type': 'Organization', name: 'Equipe Bora de Site' },
      publisher: { '@type': 'Organization', name: 'Bora de Site', url: URL },
      mainEntityOfPage: canonical
    }
  ];
  const outros = BLOG.posts.filter(x => x.slug !== p.slug).map(x =>
    `<a class="bpost bpost--mini" href="/blog/${x.slug}.html"><strong class="bpost__t">${esc(x.titulo)}</strong><span class="pf__url">Ler ${ic('arrow')}</span></a>`).join('');
  const body = `${subhero(p.categoria, p.titulo, '')}
<section class="sec sec--white">
  ${wave('var(--navy-d)')}
  <div class="wrap prose prose--post">
    <p class="post__meta">Equipe Bora de Site · ${p.data.split('-').reverse().join('/')}</p>
    ${renderBlocks(p.conteudo)}
    ${ctaBand()}
    <h2>Continue lendo</h2>
    <div class="bposts bposts--mini">${outros}</div>
  </div>
</section>`;
  return head(p.seo_title || p.titulo, p.seo_desc || p.resumo, canonical, jsonld) + body + foot();
}

// ---------- sitemap / robots ----------
function sitemap() {
  const urls = [
    URL + '/',
    URL + '/criacao-de-sites.html',
    URL + '/quanto-custa-um-site.html',
    URL + '/blog.html',
    ...BLOG.posts.map(p => `${URL}/blog/${p.slug}.html`)
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${LASTMOD}</lastmod><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>`;
}
const robots = () => `User-agent: *\nAllow: /\n\nSitemap: ${URL}/sitemap.xml\n`;

// ---------- write ----------
import { mkdirSync } from 'node:fs';
mkdirSync(join(ROOT, 'blog'), { recursive: true });
writeFileSync(join(ROOT, 'index.html'), buildHome());
writeFileSync(join(ROOT, 'criacao-de-sites.html'), buildCriacao());
writeFileSync(join(ROOT, 'quanto-custa-um-site.html'), buildQuantoCusta());
writeFileSync(join(ROOT, 'blog.html'), buildBlogIndex());
for (const p of BLOG.posts) writeFileSync(join(ROOT, 'blog', `${p.slug}.html`), buildPost(p));
writeFileSync(join(ROOT, 'sitemap.xml'), sitemap());
writeFileSync(join(ROOT, 'robots.txt'), robots());
console.log(`✓ Bora de Site gerado: home + 2 páginas SEO + blog (${BLOG.posts.length} posts) + sitemap (${4 + BLOG.posts.length} URLs) + robots`);
