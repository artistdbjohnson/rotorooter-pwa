(function () {
  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-set-theme') === theme ? 'true' : 'false');
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#10090c' : '#C8102E');
  }

  applyTheme(currentTheme());

  document.addEventListener('click', function (e) {
    var themeBtn = e.target.closest('[data-set-theme]');
    if (themeBtn) {
      var theme = themeBtn.getAttribute('data-set-theme') === 'dark' ? 'dark' : 'light';
      try { localStorage.setItem('rr-theme', theme); } catch (err) {}
      applyTheme(theme);
    }
  });

  var menuBtn = document.querySelector('.menu-btn');
  var navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? 'Close' : 'Menu';
      navLinks.classList.toggle('is-open', open);
    }
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  var bg = document.getElementById('heroBg');
  if (bg) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var hero = bg.closest('.hero') || bg;

    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var tx = 0;
    var ty = 0;
    var x = 0;
    var y = 0;
    var raf = 0;
    var tabVisible = document.visibilityState === 'visible';
    var onscreen = true;
    var lastTransform = '';
    var listening = false;

    function motionAllowed() {
      return !reduceMotion.matches && tabVisible && onscreen;
    }

    function apply(px, py) {
      var next = 'scale(1.08) translate3d(' + px + 'px, ' + py + 'px, 0)';
      if (next === lastTransform) return;
      lastTransform = next;
      bg.style.transform = next;
    }

    function stopLoop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      bg.style.willChange = '';
    }

    function tick() {
      raf = 0;
      if (!motionAllowed()) {
        stopLoop();
        return;
      }

      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;

      var px = Math.round(x * 100) / 100;
      var py = Math.round(y * 100) / 100;
      apply(px, py);

      if (Math.abs(tx - x) < 0.05 && Math.abs(ty - y) < 0.05) {
        x = tx;
        y = ty;
        apply(Math.round(x * 100) / 100, Math.round(y * 100) / 100);
        stopLoop();
        return;
      }

      raf = requestAnimationFrame(tick);
    }

    function kick() {
      if (!motionAllowed() || raf) return;
      bg.style.willChange = 'transform';
      raf = requestAnimationFrame(tick);
    }

    function onMove(e) {
      if (!motionAllowed()) return;
      tx = ((e.clientX - cx) / cx) * 20;
      ty = ((e.clientY - cy) / cy) * 20;
      kick();
    }

    function onResize() {
      cx = window.innerWidth / 2;
      cy = window.innerHeight / 2;
    }

    function onVisibility() {
      tabVisible = document.visibilityState === 'visible';
      if (!tabVisible) stopLoop();
    }

    function bindMove() {
      if (listening || !motionAllowed()) return;
      window.addEventListener('mousemove', onMove, { passive: true });
      listening = true;
    }

    function unbindMove() {
      if (!listening) return;
      window.removeEventListener('mousemove', onMove);
      listening = false;
    }

    function syncMotionPreference() {
      if (reduceMotion.matches) {
        unbindMove();
        stopLoop();
        tx = 0;
        ty = 0;
        x = 0;
        y = 0;
        apply(0, 0);
        return;
      }
      bindMove();
    }

    function onMq(mq, fn) {
      if (mq.addEventListener) mq.addEventListener('change', fn);
      else mq.addListener(fn);
    }

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    onMq(reduceMotion, syncMotionPreference);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        onscreen = entries.some(function (entry) { return entry.isIntersecting; });
        if (!onscreen) stopLoop();
      }, { threshold: 0 });
      io.observe(hero);
    }

    syncMotionPreference();
  }

  var pay = document.getElementById('pay');
  var done = document.getElementById('done');
  if (pay && done) {
    pay.addEventListener('submit', function (e) {
      e.preventDefault();
      pay.hidden = true;
      done.hidden = false;
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
})();
