// "Get the app" banner for phones. It slides open above the header once you scroll past the hero, the way App Store
// banners sit at the top of a page. Android: Get opens Chrome's own install dialog. iPhone: Safari has no install
// dialog for websites, so Get opens a card with the Add to Home Screen steps, right above Safari's buttons.
// Never shown on desktop, inside the installed app, in in-app browsers (Instagram, Facebook...) that can't install,
// or for 14 days after the ✕.
(() => {
  const KEY = 'appbar-closed', QUIET_DAYS = 14;
  const ua = navigator.userAgent;
  const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const phone = matchMedia('(pointer: coarse)').matches && innerWidth < 820;
  const inApp = /FBAN|FBAV|Instagram|Line\/|TikTok|musical_ly|Snapchat|Pinterest|LinkedInApp|GSA\//.test(ua);
  const iOS = /iPhone|iPod/.test(ua);
  const iosSafari = iOS && /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua);
  const iosVersion = +(ua.match(/Version\/(\d+)/) || [])[1] || 0;
  const quiet = () => { try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < QUIET_DAYS * 864e5; } catch { return false; } };
  if (installed || !phone || inApp || quiet()) return;

  let deferred = null;       // Android: Chrome's saved install prompt
  let ready = iosSafari;     // iPhone can always show the steps; Android waits for Chrome to say it can install
  let passedHero = false, shown = false;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; ready = true; maybeShow(); });

  const BEADS = ['turquoise', 'tangerine', 'orchid', 'coral', 'uranium', 'turquoise', 'tangerine', 'orchid'];
  const bar = document.createElement('div');
  bar.className = 'appbar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Get the Chaotic Goods app');
  bar.innerHTML = `<div class="appbar-in">
    <button class="appbar-x" type="button" aria-label="Not now">✕</button>
    <img src="icons/icon-192.png?v=3" alt="" width="46" height="46">
    <div class="appbar-text"><b>Chaotic Goods</b><span>Handmade glass necklaces<br>✿ Free · no app store</span></div>
    <button class="appbar-get" type="button">Get</button>
    <div class="appbar-strand" aria-hidden="true">${BEADS.map(c => `<i style="background: var(--${c})"></i>`).join('')}</div>
  </div>`;
  document.body.append(bar);

  const open = () => {
    document.documentElement.style.setProperty('--appbar', bar.querySelector('.appbar-in').offsetHeight + 'px');
    document.documentElement.classList.add('appbar-open');
  };
  const close = remember => {
    document.documentElement.classList.remove('appbar-open');
    if (remember) try { localStorage.setItem(KEY, String(Date.now())); } catch {}
  };
  function maybeShow() {
    if (shown || !ready || !passedHero) return;
    shown = true;
    open();
  }

  // Show once the hero has scrolled out of view (not on arrival).
  const hero = document.getElementById('hero');
  let ticking = false;
  const check = () => {
    ticking = false;
    if (hero && hero.getBoundingClientRect().bottom < 0) { passedHero = true; removeEventListener('scroll', onScroll); maybeShow(); }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
  if (hero) { addEventListener('scroll', onScroll, { passive: true }); check(); }

  bar.querySelector('.appbar-x').addEventListener('click', () => close(true));
  addEventListener('appinstalled', () => close(true));

  // iPhone steps card. iOS 26's Safari keeps Share under the ••• button; older versions show Share in the bottom bar.
  let sheet = null, scrim = null;
  const SHARE = '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M9 11H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V13a2 2 0 0 0-2-2h-2" fill="none" stroke="#1f6fe5" stroke-width="2.2" stroke-linecap="round"/><path d="M14 3v14M9 8l5-5 5 5" fill="none" stroke="#1f6fe5" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ADD = '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="4" y="4" width="20" height="20" rx="5" fill="none" stroke="#1d1d1f" stroke-width="2.2"/><path d="M14 9v10M9 14h10" stroke="#1d1d1f" stroke-width="2.2" stroke-linecap="round"/></svg>';
  function iosSteps() {
    if (!sheet) {
      const newSafari = iosVersion >= 26;
      const steps = (newSafari
        ? [['Tap <b>•••</b> at the bottom right', '<span class="appsheet-dots" aria-hidden="true">•••</span>'], ['Tap <b>Share</b>', SHARE]]
        : [['Tap <b>Share</b> at the bottom of Safari', SHARE]])
        .concat([['Tap <b>Add to Home Screen</b><small>Keep "Open as Web App" on. Tap "View More" if you don\'t see it.</small>', ADD]]);
      scrim = document.createElement('div');
      scrim.className = 'appsheet-scrim';
      sheet = document.createElement('div');
      sheet.className = 'appsheet' + (newSafari ? ' new-safari' : '');
      sheet.setAttribute('role', 'dialog');
      sheet.setAttribute('aria-label', 'Add Chaotic Goods to your home screen');
      sheet.innerHTML = `<div class="appsheet-head"><img src="icons/icon-192.png?v=3" alt="" width="44" height="44"><b>Take the shop home!</b>
        <button class="appsheet-x" type="button" aria-label="Close">✕</button></div>
        ${steps.map(([t, ic], i) => `<div class="appsheet-step"><span class="n">${i + 1}</span><span>${t}</span>${ic}</div>`).join('')}
        <svg class="appsheet-arrow" viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3v18M6 14l8 8 8-8" fill="none" stroke="#1d1d1f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      document.body.append(scrim, sheet);
      const hide = () => { sheet.classList.remove('on'); scrim.classList.remove('on'); };
      scrim.addEventListener('click', hide);
      sheet.querySelector('.appsheet-x').addEventListener('click', hide);
    }
    requestAnimationFrame(() => { scrim.classList.add('on'); sheet.classList.add('on'); sheet.querySelector('.appsheet-x').focus({ preventScroll: true }); });
  }

  bar.querySelector('.appbar-get').addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      if (outcome === 'accepted') close(true);
    } else if (iosSafari) iosSteps();
  });
})();
