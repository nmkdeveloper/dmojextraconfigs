/**
 * NMK Developer DMOJ-based Extra Configs - Toolbar Popup Logic
 */

const PREFIX = 'nmkdeveloperdmojbasedextraconfigs_';
const KEY_DOMAINS = `${PREFIX}global_domains`;
const DEFAULT_DOMAINS = ['csoj.edu.vn', 'oj.vnoi.info', 'dmoj.ca'];

document.addEventListener('DOMContentLoaded', async () => {
  const currentHostEl = document.getElementById('current-hostname');
  const siteBadgeEl = document.getElementById('site-badge');
  const toggleDockBtn = document.getElementById('toggle-dock-btn');
  const domainListEl = document.getElementById('domain-list');
  const newDomainInput = document.getElementById('new-domain-input');
  const addDomainBtn = document.getElementById('add-domain-btn');
  const toggleEasterEgg = document.getElementById('toggle-easter-egg');
  const resetCurrentBtn = document.getElementById('reset-current-btn');

  let currentHostname = '';
  let activeTabId = null;

  // 1. Get current active tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0] && tabs[0].url) {
      activeTabId = tabs[0].id;
      const url = new URL(tabs[0].url);
      currentHostname = url.hostname;
      currentHostEl.textContent = currentHostname;
    } else {
      currentHostEl.textContent = 'Trang hệ thống';
    }
  } catch {
    currentHostEl.textContent = 'Không khả dụng';
  }

  // 2. Load registered domains
  async function getDomains() {
    const res = await chrome.storage.local.get(KEY_DOMAINS);
    return res[KEY_DOMAINS] || DEFAULT_DOMAINS;
  }

  async function saveDomains(list) {
    await chrome.storage.local.set({ [KEY_DOMAINS]: list });
    renderDomains();
    checkSiteStatus();
  }

  function checkSiteStatus() {
    getDomains().then(domains => {
      const isDMOJ = domains.some(d => currentHostname === d || currentHostname.endsWith('.' + d));
      if (isDMOJ) {
        siteBadgeEl.textContent = 'Đang bật';
        siteBadgeEl.className = 'badge active';
        toggleDockBtn.disabled = false;
      } else {
        siteBadgeEl.textContent = 'Chưa bật';
        siteBadgeEl.className = 'badge inactive';
        toggleDockBtn.disabled = true;
      }
    });
  }

  async function renderDomains() {
    const domains = await getDomains();
    domainListEl.innerHTML = '';
    domains.forEach(d => {
      const li = document.createElement('li');
      li.className = 'domain-item';
      
      const isDefault = DEFAULT_DOMAINS.includes(d);
      li.innerHTML = `
        <span>${d}</span>
        ${isDefault ? '<span style="font-size:10px;color:#6b7280;">(mặc định)</span>' : `<button class="del-domain-btn" data-domain="${d}">×</button>`}
      `;
      domainListEl.appendChild(li);
    });

    domainListEl.querySelectorAll('.del-domain-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const dom = e.target.getAttribute('data-domain');
        const list = await getDomains();
        const updated = list.filter(item => item !== dom);
        await saveDomains(updated);
      });
    });
  }

  // 3. Add domain handler
  addDomainBtn.addEventListener('click', async () => {
    let val = newDomainInput.value.trim().toLowerCase();
    if (!val) return;
    val = val.replace(/^https?:\/\//, '').split('/')[0];
    const list = await getDomains();
    if (!list.includes(val)) {
      list.push(val);
      await saveDomains(list);
      newDomainInput.value = '';
    }
  });

  newDomainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addDomainBtn.click();
  });

  // 4. Toggle dock on active tab
  toggleDockBtn.addEventListener('click', () => {
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'toggle_dock' });
    }
  });

  // 5. Easter egg settings for current site
  if (currentHostname) {
    const eeKey = `${PREFIX}${currentHostname}_easter_egg_enabled`;
    const data = await chrome.storage.local.get(eeKey);
    toggleEasterEgg.checked = data[eeKey] !== false;

    toggleEasterEgg.addEventListener('change', async () => {
      await chrome.storage.local.set({ [eeKey]: toggleEasterEgg.checked });
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: 'reload_settings' });
      }
    });
  }

  // 6. Reset current site settings
  resetCurrentBtn.addEventListener('click', async () => {
    if (!currentHostname) return;
    const confirmReset = confirm(`Bạn có chắc muốn xóa tất cả cài đặt riêng cho ${currentHostname}?`);
    if (!confirmReset) return;

    const sitePrefix = `${PREFIX}${currentHostname}_`;
    const all = await chrome.storage.local.get(null);
    const toRemove = Object.keys(all).filter(k => k.startsWith(sitePrefix));
    if (toRemove.length > 0) {
      await chrome.storage.local.remove(toRemove);
    }
    alert(`Đã đặt lại cài đặt cho ${currentHostname}!`);
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: 'reload_settings' });
    }
  });

  await renderDomains();
  checkSiteStatus();
});
