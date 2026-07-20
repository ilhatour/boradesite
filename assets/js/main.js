// Bora de Site — interações (editado à mão)
(function () {
  'use strict';
  var doc = document;

  // header shrink
  var hd = doc.getElementById('hd');
  var onScroll = function () { if (hd) hd.classList.toggle('is-scroll', window.scrollY > 12); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // menu mobile
  var burger = doc.querySelector('.hd__burger');
  var mobile = doc.querySelector('.hd__mobile');
  if (burger && mobile) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mobile.hidden = open;
    });
    mobile.addEventListener('click', function (e) {
      if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); mobile.hidden = true; }
    });
  }

  // reveal on scroll
  var reveals = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });

    // trilho — desenha a linha quando entra
    var trail = doc.querySelector('.trail');
    if (trail) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { trail.classList.add('is-drawn'); tio.disconnect(); } });
      }, { threshold: 0.25 });
      tio.observe(trail);
    }
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
    var t = doc.querySelector('.trail'); if (t) t.classList.add('is-drawn');
  }

  // whatsapp_click (conversão GA4)
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-wa], a[href*="wa.me"], a[href*="api.whatsapp"]');
    if (!a) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'whatsapp_click', {
        link_url: a.href,
        cta_text: (a.textContent || '').trim().slice(0, 60),
        page_path: location.pathname
      });
    }
  });

  // formulário de contato → abre WhatsApp com a mensagem pronta
  var form = doc.getElementById('cform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var linhas = [
        'Olá! Vim pelo site da Bora de Site 💡',
        'Nome: ' + g('nome'),
        g('cargo') ? 'Cargo: ' + g('cargo') : '',
        'Empresa: ' + g('empresa'),
        g('instagram') ? 'Instagram: ' + g('instagram') : '',
        'WhatsApp/Telefone: ' + g('fone'),
        'Nicho: ' + g('nicho'),
        'Quero saber mais sobre criar meu site!'
      ].filter(Boolean);
      var url = 'https://wa.me/' + form.getAttribute('data-wa-num') + '?text=' + encodeURIComponent(linhas.join('\n'));
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'whatsapp_click', { link_url: url, cta_text: 'form_contato', page_path: location.pathname });
      }
      window.open(url, '_blank', 'noopener');
    });
  }

  // floats idle-hide (some após 2.5s parado, volta em qualquer atividade)
  var floats = doc.getElementById('floats');
  if (floats) {
    var timer;
    var wake = function () {
      floats.classList.remove('is-idle');
      clearTimeout(timer);
      timer = setTimeout(function () { floats.classList.add('is-idle'); }, 2500);
    };
    ['scroll', 'mousemove', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, wake, { passive: true });
    });
    wake();
  }
})();
