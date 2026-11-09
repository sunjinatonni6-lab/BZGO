/* BazarGO Professional Upgrade: progressive enhancements only. */
(() => {
  'use strict';
  const doc = document;
  const path = (window.location.pathname || '').toLowerCase();
  const isAdmin = path.includes('/admin/');
  const isAuthPage = /\/(login|register)\.html$/.test(path);
  const isCheckout = /\/checkout\.html$/.test(path);

  const progress = doc.createElement('div');
  progress.id = 'bazargo-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(progress);

  const toastRegion = doc.createElement('div');
  toastRegion.id = 'bazargo-toast-region';
  toastRegion.setAttribute('aria-live', 'polite');
  toastRegion.setAttribute('aria-atomic', 'false');
  doc.body.appendChild(toastRegion);

  function toast(message, type = 'success') {
    const item = doc.createElement('div');
    item.className = `bazargo-toast${type === 'error' ? ' error' : ''}`;
    const icon = doc.createElement('i');
    icon.className = type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check';
    const text = doc.createElement('span');
    text.textContent = String(message || 'Done');
    item.append(icon, text);
    toastRegion.appendChild(item);
    window.setTimeout(() => item.remove(), 3400);
  }
  window.BazarGoUI = Object.assign(window.BazarGoUI || {}, { toast });

  const backTop = doc.createElement('button');
  backTop.id = 'bazargo-back-top';
  backTop.type = 'button';
  backTop.setAttribute('aria-label', 'Back to top');
  backTop.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
  doc.body.appendChild(backTop);
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  function updateScrollUI() {
    const scrollable = doc.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    backTop.classList.toggle('is-visible', window.scrollY > 420);
  }
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  if (!isAdmin && !isAuthPage && !isCheckout) {
    const nav = doc.createElement('nav');
    nav.className = 'bazargo-mobile-nav';
    nav.setAttribute('aria-label', 'Mobile navigation');
    const items = [
      { label: 'Home', icon: 'fa-house', href: 'index.html', match: /\/index\.html$|\/$/ },
      { label: 'Categories', icon: 'fa-layer-group', href: 'index.html#category-section-title', match: /never-match/ },
      { label: 'Wishlist', icon: 'fa-heart', href: 'index.html#featured', match: /never-match/ },
      { label: 'Orders', icon: 'fa-box-open', href: 'my-orders.html', match: /\/my-orders\.html$/ },
      { label: 'Cart', icon: 'fa-cart-shopping', href: 'cart.html', match: /\/cart\.html$/ }
    ];
    items.forEach((item) => {
      const a = doc.createElement('a');
      a.href = item.href;
      if (item.match.test(path)) a.classList.add('active');
      a.innerHTML = `<i class="fa-solid ${item.icon}" aria-hidden="true"></i><span>${item.label}</span>`;
      if (item.label === 'Categories' || item.label === 'Wishlist') {
        a.addEventListener('click', (event) => {
          if (/\/index\.html$|\/$/.test(path)) {
            event.preventDefault();
            if (item.label === 'Wishlist') {
              const toggle = doc.getElementById('wishlist-filter');
              if (toggle && !toggle.classList.contains('active')) toggle.click();
            }
            const target = item.label === 'Categories' ? doc.getElementById('category-section-title') : doc.getElementById('featured');
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
      nav.appendChild(a);
    });
    doc.body.appendChild(nav);
    doc.body.classList.add('has-bazargo-mobile-nav');
  }

  // Populate native search suggestions from product names as the live Firestore grid changes.
  const search = doc.getElementById('store-search');
  const productGrid = doc.getElementById('product-container');
  if (search && productGrid) {
    const list = doc.createElement('datalist');
    list.id = 'bazargo-product-suggestions';
    search.setAttribute('list', list.id);
    search.setAttribute('autocomplete', 'off');
    doc.body.appendChild(list);
    const refreshSuggestions = () => {
      const names = [...productGrid.querySelectorAll('.card-title')]
        .map((node) => (node.textContent || '').trim()).filter(Boolean);
      list.replaceChildren(...[...new Set(names)].slice(0, 40).map((name) => {
        const option = doc.createElement('option'); option.value = name; return option;
      }));
    };
    refreshSuggestions();
    new MutationObserver(refreshSuggestions).observe(productGrid, { childList: true, subtree: true });
  }

})();
