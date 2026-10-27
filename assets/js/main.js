/**
 * Peyrassol — carrousels (slider d'accueil, cartes, bouteilles, potager, labels),
 * défilement automatique et onglets des vins.
 * Le défilement repose sur le scroll-snap CSS : sans JS, tout reste
 * consultable au glisser ; ce script ajoute les points, les flèches et l'autoplay.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Position de défilement qui aligne `item` sur le bord de la piste
  // (mesurée à l'écran : les pistes mobiles sont en position: relative)
  function itemLeft(track, item) {
    var pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    return item.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft - pad;
  }

  function scrollToItem(track, index) {
    var item = track.children[index];
    if (!item) return;
    track.scrollTo({ left: Math.max(0, itemLeft(track, item)), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  // Index de l'élément le plus proche du bord gauche visible
  function currentIndex(track) {
    var best = 0;
    var bestDistance = Infinity;
    Array.prototype.forEach.call(track.children, function (item, i) {
      var distance = Math.abs(itemLeft(track, item) - track.scrollLeft);
      if (distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    });
    return best;
  }

  // Slider d'accueil : un point par image
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('[data-slider-track]');
    var dotsBox = slider.querySelector('[data-slider-dots]');
    if (!track || !dotsBox) return;

    var dots = Array.prototype.map.call(track.children, function (slide, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-slider__dot';
      dot.setAttribute('aria-label', 'Image ' + (i + 1));
      dot.addEventListener('click', function () { scrollToItem(track, i); });
      dotsBox.appendChild(dot);
      return dot;
    });

    function update() {
      var active = currentIndex(track);
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-current', String(i === active));
      });
    }

    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  });

  // Labels : flèches précédent / suivant
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    if (!track) return;

    function step(direction) {
      var last = track.children.length - 1;
      var next = currentIndex(track) + direction;
      if (next < 0) next = last;
      if (next > last) next = 0;
      scrollToItem(track, next);
    }

    var arrows = carousel.querySelectorAll('[data-carousel-prev], [data-carousel-next]');
    carousel.querySelector('[data-carousel-prev]').addEventListener('click', function () { step(-1); });
    carousel.querySelector('[data-carousel-next]').addEventListener('click', function () { step(1); });

    // Flèches désactivées quand tous les labels tiennent à l'écran
    function updateArrows() {
      var scrollable = track.scrollWidth > track.clientWidth + 1;
      arrows.forEach(function (arrow) { arrow.disabled = !scrollable; });
    }

    window.addEventListener('resize', updateArrows);
    window.addEventListener('load', updateArrows);
    updateArrows();
  });

  // Nos vins : un onglet par couleur, chaque panneau est un slider de bouteilles
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
      tabs.forEach(function (other) {
        var selected = other === tab;
        var panel = document.getElementById(other.getAttribute('aria-controls'));
        other.setAttribute('aria-selected', String(selected));
        other.tabIndex = selected ? 0 : -1;
        panel.hidden = !selected;
      });
      var track = document.getElementById(tab.getAttribute('aria-controls')).querySelector('.wine-grid');
      if (track) track.scrollLeft = 0;
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (event.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        select(next, true);
      });
    });

    select(tabs[0], false);
  });

  // Défilement automatique, dès que la piste déborde.
  // - Slider d'accueil : image par image (5 s), les points suivent.
  // - Cartes, bouteilles, potager, labels (mobile) : défilement continu en
  //   boucle. Les éléments sont dupliqués une fois (copies inertes, masquées
  //   hors mobile en CSS) pour que la boucle ne se voie pas.
  // Un geste (doigt, clic, molette) ou le focus clavier mettent en pause,
  // reprise peu après. Pas de pause au simple survol : la souris posée sur
  // l'aperçu mobile de la démo figerait tout. Arrêt hors écran ou dans un
  // onglet masqué.
  var CONTINUOUS = '.discover-grid, .wine-grid, .garden__grid, .labels__track';
  var SPEED = 32; // px par seconde

  function watchVisibility(track, onChange) {
    new IntersectionObserver(function (entries) {
      onChange(entries[0].isIntersecting);
    }, { threshold: 0.3 }).observe(track);
  }

  function pauseOnGesture(zone, pause, resumeLater) {
    zone.addEventListener('pointerdown', pause);
    zone.addEventListener('pointerup', resumeLater);
    zone.addEventListener('pointercancel', resumeLater);
    zone.addEventListener('wheel', function () { pause(); resumeLater(); }, { passive: true });
    zone.addEventListener('focusin', function (event) {
      if (event.target.matches(':focus-visible')) pause();
    });
    zone.addEventListener('focusout', resumeLater);
  }

  // Slider d'accueil : image par image
  document.querySelectorAll('.hero-slider__track').forEach(function (track) {
    var paused = false;
    var visible = false;
    var resume;

    pauseOnGesture(track, function () {
      paused = true;
      clearTimeout(resume);
    }, function () {
      clearTimeout(resume);
      resume = setTimeout(function () { paused = false; }, 6000);
    });
    watchVisibility(track, function (v) { visible = v; });

    setInterval(function () {
      if (paused || !visible) return;
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 4) return;
      if (track.scrollLeft >= max - 4) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollToItem(track, currentIndex(track) + 1);
      }
    }, 5000);
  });

  // Cartes, bouteilles, potager, labels : défilement continu
  document.querySelectorAll(CONTINUOUS).forEach(function (track) {
    var zone = track.closest('[data-carousel]') || track; // flèches des labels comprises
    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) return;

    originals.forEach(function (item) {
      var copy = item.cloneNode(true);
      copy.classList.add('is-clone');
      copy.setAttribute('aria-hidden', 'true');
      copy.inert = true;
      copy.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
      track.appendChild(copy);
    });
    var firstCopy = originals[0].parentNode.children[originals.length];

    var paused = false;
    var visible = false;
    var resume;
    var pos = 0;
    var last = 0;

    // Distance qui ramène la première copie à la place du premier original
    function loopWidth() {
      return firstCopy.getBoundingClientRect().left - originals[0].getBoundingClientRect().left;
    }

    // Les copies sont masquées hors mobile : loopWidth() vaut alors 0
    function playable() {
      if (track.offsetParent === null) return false;
      var loop = loopWidth();
      return loop > 0 && loop > track.clientWidth - 4;
    }

    function setSnap(on) {
      track.style.scrollSnapType = on ? '' : 'none';
    }

    function frame(time) {
      var dt = last ? Math.min(time - last, 64) / 1000 : 0;
      last = time;
      if (!paused && visible && playable()) {
        setSnap(false);
        // Défilement venu d'ailleurs (doigt, onglet, flèche) : on repart de là
        if (Math.abs(track.scrollLeft - pos) > 2) pos = track.scrollLeft;
        pos += SPEED * dt;
        var loop = loopWidth();
        if (pos >= loop) pos -= loop;
        track.scrollLeft = pos;
      }
      window.requestAnimationFrame(frame);
    }

    pauseOnGesture(zone, function () {
      paused = true;
      clearTimeout(resume);
      setSnap(true);
    }, function () {
      clearTimeout(resume);
      resume = setTimeout(function () {
        pos = track.scrollLeft;
        paused = false;
      }, 3000);
    });
    watchVisibility(track, function (v) { visible = v; });

    window.requestAnimationFrame(frame);
  });

  // Bandeau : menus déroulants (Réserver et offrir sous le calendrier, langue)
  // Sous 1280 px, le menu du calendrier est plein écran, comme le menu burger
  var drops = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));
  var fullscreenQuery = window.matchMedia('(max-width: 1279px)');
  var mainNav = document.getElementById('main-nav');
  var burger = document.querySelector('.burger');

  function isFullscreen(drop) {
    return fullscreenQuery.matches && !drop.classList.contains('lang-switch');
  }

  function setDrop(drop, open) {
    drop.classList.toggle('is-open', open);
    drop.querySelector('button').setAttribute('aria-expanded', String(open));
    if (!isFullscreen(drop)) return;
    var navOpen = mainNav && mainNav.classList.contains('is-open');
    document.body.classList.toggle('menu-open', open || navOpen);
  }

  drops.forEach(function (drop) {
    var button = drop.querySelector('button');
    button.addEventListener('click', function () {
      var open = !drop.classList.contains('is-open');
      // Un seul menu plein écran à la fois : le burger se referme
      if (open && isFullscreen(drop) && mainNav && mainNav.classList.contains('is-open')) burger.click();
      drops.forEach(function (other) { setDrop(other, other === drop && open); });
    });
    // Le focus qui quitte le menu (Tab) le referme. En plein écran, un focus resté
    // dans le bandeau (burger) est laissé au clic : refermer dès le mousedown fait
    // réapparaître la barre de démo et décale le bandeau sous le doigt.
    drop.addEventListener('focusout', function (event) {
      var to = event.relatedTarget;
      if (!to || drop.contains(to)) return;
      if (isFullscreen(drop) && to.closest('.site-header')) return;
      setDrop(drop, false);
    });
  });

  document.addEventListener('click', function (event) {
    drops.forEach(function (drop) {
      if (!drop.contains(event.target)) setDrop(drop, false);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    drops.forEach(function (drop) {
      if (!drop.classList.contains('is-open')) return;
      setDrop(drop, false);
      drop.querySelector('button').focus();
    });
  });

  fullscreenQuery.addEventListener('change', function () {
    drops.forEach(function (drop) {
      if (drop.classList.contains('is-open')) setDrop(drop, false);
    });
    document.body.classList.remove('menu-open');
  });
})();
