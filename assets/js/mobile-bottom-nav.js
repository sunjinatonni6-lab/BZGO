import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

const onAdminPage = /\/admin\//i.test(window.location.pathname);
const prefix = onAdminPage ? '../' : '';
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
const currentHash = window.location.hash;

function makeLink({ href, icon, label, active = false }) {
  return `<a class="mobile-bottom-link${active ? ' is-active' : ''}" href="${href}"${active ? ' aria-current="page"' : ''}>
    <i class="${icon}" aria-hidden="true"></i><span>${label}</span>
  </a>`;
}

function renderBottomNav(role = 'customer') {
  const isAdmin = role === 'admin';
  const items = isAdmin
    ? [
        { href: `${prefix}index.html`, icon: 'fa-solid fa-house', label: 'Home', active: false },
        { href: `${prefix}admin/dashboard.html`, icon: 'fa-solid fa-chart-line', label: 'Dashboard', active: currentPath === 'dashboard.html' },
        { href: `${prefix}admin/products.html`, icon: 'fa-solid fa-box', label: 'Products', active: currentPath === 'products.html' },
        { href: `${prefix}admin/orders.html`, icon: 'fa-solid fa-receipt', label: 'Orders', active: currentPath === 'orders.html' },
        { href: `${prefix}account.html`, icon: 'fa-regular fa-user', label: 'Profile', active: currentPath === 'account.html' }
      ]
    : [
        { href: `${prefix}index.html`, icon: 'fa-solid fa-house', label: 'Home', active: currentPath === 'index.html' && !currentHash },
        { href: `${prefix}index.html#category-section-title`, icon: 'fa-solid fa-grid-2', label: 'Categories', active: currentHash === '#category-section-title' },
        { href: `${prefix}my-orders.html`, icon: 'fa-solid fa-box-open', label: 'My Orders', active: currentPath === 'my-orders.html' },
        { href: `${prefix}cart.html`, icon: 'fa-solid fa-cart-shopping', label: 'Cart', active: currentPath === 'cart.html' },
        { href: `${prefix}account.html`, icon: 'fa-regular fa-user', label: 'Profile', active: currentPath === 'account.html' }
      ];

  let nav = document.getElementById('mobile-bottom-nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.id = 'mobile-bottom-nav';
    nav.className = `mobile-bottom-nav${isAdmin ? ' mobile-bottom-nav-admin' : ' mobile-bottom-nav-customer'}`;
    nav.setAttribute('aria-label', isAdmin ? 'Admin navigation' : 'Customer navigation');
    document.body.appendChild(nav);
  }
  nav.className = `mobile-bottom-nav${isAdmin ? ' mobile-bottom-nav-admin' : ' mobile-bottom-nav-customer'}`;
  nav.setAttribute('aria-label', isAdmin ? 'Admin navigation' : 'Customer navigation');
  nav.innerHTML = items.map(makeLink).join('');
}

if (onAdminPage) {
  renderBottomNav('admin');
} else {
  onAuthStateChanged(auth, async (user) => {
    let role = 'customer';
    if (user) {
      try {
        const profile = await getDoc(doc(db, 'users', user.uid));
        if (profile.exists() && profile.data().role === 'admin') role = 'admin';
      } catch (error) {
        console.warn('Could not determine navigation role:', error);
      }
    }
    renderBottomNav(role);
  });
}
