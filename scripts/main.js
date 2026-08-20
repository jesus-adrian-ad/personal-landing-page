/* =====================================================================
   Adrián Alcocer — Sitio personal
   El script va al final de <body> sin defer: se ejecuta justo después de
   parsear el DOM, antes del primer pintado, para que los elementos que
   se van a revelar no aparezcan y desaparezcan.
   ===================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------------
     Tema claro / oscuro.

     El tema inicial ya lo aplicó el script inline del <head>, antes del
     primer pintado. Aquí solo se atiende el clic. Mientras no haya
     elección guardada no se toca data-theme, así que la página sigue a
     la preferencia del sistema aunque cambie sobre la marcha.
     ------------------------------------------------------------------- */

  const themeToggle = document.querySelector('.theme-toggle');

  if (themeToggle) {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const current =
        root.getAttribute('data-theme') ||
        (systemPrefersDark.matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';

      // La transición de color solo se activa durante el cambio. Dejarla
      // puesta obligaría al navegador a vigilar cada color de la página.
      if (!prefersReducedMotion) {
        root.classList.add('theme-transition');
        window.setTimeout(() => root.classList.remove('theme-transition'), 400);
      }

      root.setAttribute('data-theme', next);

      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* localStorage bloqueado: el cambio vale para esta sesión */
      }
    });
  }

  /* -------------------------------------------------------------------
     Menú de navegación en móvil y tablet vertical.

     Quién está abierto o cerrado lo dice aria-expanded, y el CSS lee ese
     mismo atributo para decidir el icono: no hay un segundo estado que
     pueda desincronizarse.
     ------------------------------------------------------------------- */

  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    const setMenu = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      navMenu.classList.toggle('is-open', open);
    };

    const isOpen = () => navToggle.getAttribute('aria-expanded') === 'true';

    navToggle.addEventListener('click', () => setMenu(!isOpen()));

    // Al elegir una sección el menú estorba: se cierra solo.
    navMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setMenu(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!isOpen()) return;
      if (event.target.closest('nav')) return;
      setMenu(false);
    });

    // Al pasar a escritorio el panel desaparece por CSS; se limpia el
    // estado para que el botón no quede anunciado como abierto.
    window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /* -------------------------------------------------------------------
     Navbar: sombra al separarse del borde superior.
     ------------------------------------------------------------------- */

  const nav = document.querySelector('nav');

  if (nav) {
    const syncNavShadow = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    syncNavShadow();
    window.addEventListener('scroll', syncNavShadow, { passive: true });
  }

  /* -------------------------------------------------------------------
     Sección activa en el navbar.

     Esto no es decoración: en una página de scroll único te dice dónde
     estás. Por eso se aplica aunque el usuario haya pedido menos
     movimiento — el subrayado aparece, solo que sin animarse.

     El rootMargin recorta el viewport a una banda estrecha en el tercio
     superior, así solo una sección la cruza a la vez.
     ------------------------------------------------------------------- */

  const navLinkById = new Map();

  document.querySelectorAll('nav ul a[href^="#"]').forEach((link) => {
    navLinkById.set(link.getAttribute('href').slice(1), link);
  });

  const sections = Array.from(document.querySelectorAll('main section[id]'))
    .filter((section) => navLinkById.has(section.id));

  if (sections.length && 'IntersectionObserver' in window) {
    const setActive = (link) => {
      navLinkById.forEach((other) => {
        other.classList.remove('is-active');
        other.removeAttribute('aria-current');
      });
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'location');
    };

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const link = navLinkById.get(entry.target.id);
          if (link) setActive(link);
        });
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );

    sections.forEach((section) => spy.observe(section));
  }

  /* -------------------------------------------------------------------
     Revelado al entrar en pantalla.

     La clase .reveal la pone este script, no el HTML: si el JS falla o
     está desactivado, nada se oculta y la página se ve completa. El hero
     no entra aquí — se anima con @keyframes en el CSS porque está sobre
     la línea de flotación y un observador lo haría parpadear.
     ------------------------------------------------------------------- */

  const REVEAL_SELECTOR = [
    '.stack h2', '.stack-card',
    '.experience h2', '.job',
    '.projects h2', '.project',
    '.about h2', '.about-bio', '.about-facts .fact',
    '.contact h2', '.contact-lead', '.contact-list li',
  ].join(', ');

  const items = Array.from(document.querySelectorAll(REVEAL_SELECTOR));

  // Sin soporte o con animaciones reducidas: se deja todo visible tal cual.
  if (!items.length || prefersReducedMotion || !('IntersectionObserver' in window)) {
    return;
  }

  // Escalonado: cada elemento se retrasa según su posición entre los
  // hermanos que también se revelan (las tarjetas del stack, los enlaces
  // de contacto…). Se topa para que el último no se haga esperar.
  const countByParent = new Map();

  items.forEach((el) => {
    el.classList.add('reveal');

    const parent = el.parentElement;
    const index = countByParent.get(parent) ?? 0;
    countByParent.set(parent, index + 1);

    if (index > 0) {
      el.style.setProperty('--reveal-delay', `${Math.min(index * 70, 280)}ms`);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);   // se revela una sola vez
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );

  items.forEach((el) => observer.observe(el));
})();
