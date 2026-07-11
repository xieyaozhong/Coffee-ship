(() => {
  'use strict';

  if (window.__COFFEE_SHIP_ONBOARDING_STABILITY_V1__) return;
  window.__COFFEE_SHIP_ONBOARDING_STABILITY_V1__ = true;

  const SEEN_KEY = 'coffeeShipOnboardingSeenV1';
  let guideTimer = 0;
  let lastFocusedElement = null;

  function storageGet(key) {
    try { return localStorage.getItem(key); }
    catch { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); }
    catch { /* Private browsing or storage restrictions should not block play. */ }
  }

  function gameIsVisible() {
    const gamePanel = document.getElementById('gamePanel');
    return Boolean(gamePanel && !gamePanel.classList.contains('hidden'));
  }

  function ensureGuide() {
    let guide = document.getElementById('csOnboardingGuide');
    if (guide) return guide;

    guide = document.createElement('section');
    guide.id = 'csOnboardingGuide';
    guide.className = 'cs-guide is-hidden';
    guide.setAttribute('aria-hidden', 'true');
    guide.innerHTML = `
      <div class="cs-guide__backdrop" data-guide-close="dismiss"></div>
      <div class="cs-guide__card" role="dialog" aria-modal="true" aria-labelledby="csGuideTitle" aria-describedby="csGuideDescription">
        <header class="cs-guide__header">
          <div>
            <p class="cs-guide__eyebrow">FIRST VOYAGE</p>
            <h2 id="csGuideTitle">新手航線</h2>
          </div>
          <button class="cs-guide__icon-button" type="button" data-guide-close="dismiss" aria-label="關閉新手航線">×</button>
        </header>
        <p id="csGuideDescription" class="cs-guide__intro">先完成這四件事，就能開始 Coffee Ship 的海上生活。</p>
        <ol class="cs-guide__steps">
          <li><span>01</span><div><strong>先和 Momo 說話</strong><small>靠近船員後按「互動」，認識咖啡船上的功能。</small></div></li>
          <li><span>02</span><div><strong>試著釣一條魚</strong><small>探索甲板與海面事件，收集你的第一份漁獲。</small></div></li>
          <li><span>03</span><div><strong>換取珍珠</strong><small>出售漁獲取得珍珠，建立你的船上資源。</small></div></li>
          <li><span>04</span><div><strong>買一杯效果咖啡</strong><small>使用珍珠購買限時能力，再繼續探索海上事件。</small></div></li>
        </ol>
        <div class="cs-guide__controls" aria-label="基本操作">
          <span><b>移動</b> WASD／方向鍵</span>
          <span><b>互動</b> E／手機互動鍵</span>
          <span><b>咖啡</b> C／手機咖啡鍵</span>
          <span><b>留言</b> B／手機留言鍵</span>
        </div>
        <footer class="cs-guide__actions">
          <button type="button" class="cs-guide__secondary" data-guide-close="later">稍後再看</button>
          <button type="button" class="cs-guide__primary" data-guide-close="complete">開始探索</button>
        </footer>
      </div>`;

    document.body.appendChild(guide);
    guide.addEventListener('click', (event) => {
      const trigger = event.target.closest?.('[data-guide-close]');
      if (!trigger) return;
      closeGuide(trigger.dataset.guideClose === 'complete');
    });
    return guide;
  }

  function openGuide(force = false) {
    if (!gameIsVisible()) return;
    if (!force && storageGet(SEEN_KEY) === '1') return;

    const guide = ensureGuide();
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    guide.classList.remove('is-hidden');
    guide.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cs-guide-open');
    window.setTimeout(() => guide.querySelector('.cs-guide__primary')?.focus(), 30);
  }

  function closeGuide(markComplete = false) {
    const guide = document.getElementById('csOnboardingGuide');
    if (!guide) return;
    if (markComplete) storageSet(SEEN_KEY, '1');
    guide.classList.add('is-hidden');
    guide.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cs-guide-open');
    if (lastFocusedElement?.isConnected) lastFocusedElement.focus();
  }

  function ensureHelpButton() {
    const gamePanel = document.getElementById('gamePanel');
    if (!gamePanel || document.getElementById('csGuideButton')) return;

    const button = document.createElement('button');
    button.id = 'csGuideButton';
    button.type = 'button';
    button.className = 'cs-guide-button';
    button.setAttribute('aria-label', '開啟新手航線');
    button.title = '新手航線';
    button.textContent = '?';
    button.addEventListener('click', () => openGuide(true));
    gamePanel.appendChild(button);
  }

  function repairLoginSurface() {
    const creator = document.getElementById('creator');
    if (!creator || creator.classList.contains('hidden')) return;

    const nameInput = document.getElementById('playerName');
    if (nameInput) {
      nameInput.disabled = false;
      nameInput.readOnly = false;
      nameInput.setAttribute('inputmode', 'text');
      nameInput.setAttribute('enterkeyhint', 'go');
    }

    const holder = document.getElementById('loginRoleHolder');
    const loading = holder?.querySelector('.login-role-loading');
    if (!loading) return;

    if (holder.querySelector('.role-code-box')) {
      loading.remove();
      return;
    }

    window.setTimeout(() => {
      if (!loading.isConnected || holder.querySelector('.role-code-box')) return;
      loading.textContent = '特殊角色功能尚未完成載入；你仍可先使用「一般旅人」登船。';
      loading.classList.add('is-fallback');
    }, 3200);
  }

  function scheduleFirstGuide() {
    window.clearTimeout(guideTimer);
    guideTimer = window.setTimeout(() => openGuide(false), 420);
  }

  function refresh() {
    ensureGuide();
    ensureHelpButton();
    repairLoginSurface();
  }

  function init() {
    refresh();
    window.setTimeout(refresh, 600);
    window.setTimeout(refresh, 1800);
    window.setTimeout(refresh, 3600);

    window.addEventListener('coffee-ship:entered', scheduleFirstGuide);
    window.addEventListener('coffee-ship:boarding-complete', scheduleFirstGuide);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !document.getElementById('csOnboardingGuide')?.classList.contains('is-hidden')) {
        event.preventDefault();
        closeGuide(false);
        return;
      }
      if (event.key === '?' && gameIsVisible()) {
        event.preventDefault();
        openGuide(true);
      }
    });

    if (gameIsVisible()) scheduleFirstGuide();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
