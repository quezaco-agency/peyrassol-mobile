/**
 * Peyrassol — barre de démo « PC / Mobile » (à ne pas reprendre dans le thème)
 *
 * Sur ordinateur, « Mobile » affiche la page dans un cadre de téléphone (iframe
 * de 390 px : les media queries de mobile.css s'y appliquent normalement).
 * Sur téléphone, « PC » élargit le viewport à 1440 px pour montrer le desktop.
 * Le choix est mémorisé d'une page à l'autre.
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);

  // Page « Menu mobile » (?menu) : le menu s'ouvre dès le chargement
  if (params.has('menu')) {
    var burger = document.querySelector('.burger');
    if (burger && getComputedStyle(burger).display !== 'none') burger.click();
  }

  // Dans le cadre du téléphone : pas de barre
  if (window.self !== window.top) return;

  var STORAGE_KEY = 'peyrassol-vue';
  var PHONE_WIDTH = 390;
  var DESKTOP_WIDTH = 1440;
  var smallScreen = window.matchMedia('(max-width: 767px)').matches;
  var viewport = document.querySelector('meta[name="viewport"]');
  var initialViewport = viewport ? viewport.getAttribute('content') : '';
  var frame = null;

  function readChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function saveChoice(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) { /* navigation privée : choix non mémorisé */ }
  }

  // --- Barre ---------------------------------------------------------------

  var PAGES = [
    { label: 'Accueil', href: 'index.html' },
    { label: 'Menu mobile', href: 'index.html?menu=1', menu: true },
    { label: 'Nos vins', href: 'nos-vins.html' },
    { label: 'Restaurants', href: 'restaurants.html' },
    { label: 'Design system', href: 'design-system.html' }
  ];
  var currentFile = window.location.pathname.split('/').pop() || 'index.html';

  var pageLinks = PAGES.map(function (page) {
    var current = page.menu
      ? params.has('menu')
      : !params.has('menu') && page.href === currentFile;
    return '<a class="demo-bar__btn"' + (page.menu ? ' data-menu' : '') +
      ' href="' + page.href + '"' + (current ? ' aria-current="page"' : '') + '>' +
      page.label + '</a>';
  }).join('');

  var bar = document.createElement('div');
  bar.className = 'demo-bar';
  bar.innerHTML =
    '<nav class="demo-bar__group" aria-label="Pages de la démo">' + pageLinks + '</nav>' +
    '<span class="demo-bar__label">Aperçu</span>' +
    '<div class="demo-bar__group" role="group" aria-label="Version affichée">' +
    '<button type="button" class="demo-bar__btn" data-vue="pc">PC</button>' +
    '<button type="button" class="demo-bar__btn" data-vue="mobile">Mobile</button>' +
    '</div>';
  document.body.insertBefore(bar, document.body.firstChild);

  var buttons = bar.querySelectorAll('button.demo-bar__btn');

  // Le menu n'existe qu'en version mobile : on y bascule avant d'y aller
  bar.querySelector('[data-menu]').addEventListener('click', function () {
    saveChoice('mobile');
  });

  // --- Modes ---------------------------------------------------------------

  function showPhoneFrame() {
    if (!frame) {
      frame = document.createElement('div');
      frame.className = 'demo-frame';
      var iframe = document.createElement('iframe');
      iframe.className = 'demo-frame__screen';
      iframe.title = 'Aperçu de la version mobile';
      iframe.width = PHONE_WIDTH;
      iframe.src = window.location.href;
      // La page affichée dans le téléphone devient l'URL de la fenêtre :
      // repasser en « PC » montre la même page
      iframe.addEventListener('load', function () {
        try {
          var loc = iframe.contentWindow.location;
          window.history.replaceState(null, '', loc.pathname + loc.search + loc.hash);
          document.title = iframe.contentDocument.title;
        } catch (e) { /* page d'une autre origine */ }
      });
      frame.appendChild(iframe);
      document.body.appendChild(frame);
    }
    document.documentElement.classList.add('demo-mobile');
  }

  function hidePhoneFrame() {
    document.documentElement.classList.remove('demo-mobile');
    if (frame) {
      frame.remove();
      frame = null;
      // On recharge pour afficher la page suivie dans le téléphone
      window.location.reload();
    }
  }

  function setViewport(content) {
    if (viewport) viewport.setAttribute('content', content);
  }

  function apply(vue) {
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.vue === vue));
    });

    if (smallScreen) {
      setViewport(vue === 'pc' ? 'width=' + DESKTOP_WIDTH : initialViewport);
      document.documentElement.classList.toggle('demo-zoomed', vue === 'pc');
    } else if (vue === 'mobile') {
      showPhoneFrame();
    } else {
      hidePhoneFrame();
    }
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      saveChoice(btn.dataset.vue);
      apply(btn.dataset.vue);
    });
  });

  // Par défaut : la version qui correspond à l'écran
  apply(readChoice() || (smallScreen ? 'mobile' : 'pc'));
})();
