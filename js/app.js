const App = {
  init() {
    this.cacheDOM();
    this.bindEvents();
    this.loadTheme();
    this.loadCartCount();
    this.checkAuth();
    this.initLoadingScreen();
  },

  cacheDOM() {
    this.body = document.body;
    this.themeToggle = document.getElementById('themeToggle');
    this.hamburger = document.getElementById('hamburger');
    this.navLinks = document.getElementById('navLinks');
    this.loadingScreen = document.getElementById('loadingScreen');
    this.cartCountEls = document.querySelectorAll('.cart-count');
    this.wishlistCountEls = document.querySelectorAll('.wishlist-count');
  },

  bindEvents() {
    if (this.themeToggle) this.themeToggle.addEventListener('click', () => this.toggleTheme());
    if (this.hamburger) this.hamburger.addEventListener('click', () => this.navLinks?.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (this.navLinks?.classList.contains('open') && !e.target.closest('.navbar')) {
        this.navLinks.classList.remove('open');
      }
    });
  },

  toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (this.themeToggle) this.themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  },

  loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    if (this.themeToggle) this.themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  },

  checkAuth() {
    auth.onAuthStateChanged(user => {
      App.currentUser = user;
      App.updateUI();
      App.loadCartCount();
      App.loadWishlistCount();
      if (typeof Auth !== 'undefined') Auth.onAuthChange(user);
    });
  },

  updateUI() {
    const loginLinks = document.querySelectorAll('.nav-login');
    const userLinks = document.querySelectorAll('.nav-user');
    const userNames = document.querySelectorAll('.user-name');
    const adminLinks = document.querySelectorAll('.nav-admin');
    loginLinks.forEach(el => el.style.display = this.currentUser ? 'none' : '');
    userLinks.forEach(el => el.style.display = this.currentUser ? '' : 'none');
    adminLinks?.forEach(el => el.style.display = this.currentUser && this.currentUser.email === 'admin@admin.com' ? '' : 'none');
    if (this.currentUser && userNames.length) {
      userNames.forEach(el => el.textContent = this.currentUser.displayName || this.currentUser.email);
    }
  },

  async loadCartCount() {
    if (!this.currentUser) { this.cartCountEls.forEach(el => el.textContent = '0'); return; }
    try {
      const snap = await db.ref(`cart/${this.currentUser.uid}`).once('value');
      const data = snap.val();
      const count = data ? Object.keys(data).reduce((sum, id) => sum + (data[id].quantity || 0), 0) : 0;
      this.cartCountEls.forEach(el => el.textContent = count);
    } catch { this.cartCountEls.forEach(el => el.textContent = '0'); }
  },

  async loadWishlistCount() {
    if (!this.currentUser) { this.wishlistCountEls.forEach(el => el.textContent = '0'); return; }
    try {
      const snap = await db.ref(`wishlist/${this.currentUser.uid}`).once('value');
      const data = snap.val();
      const count = data ? Object.keys(data).length : 0;
      this.wishlistCountEls.forEach(el => el.textContent = count);
    } catch { this.wishlistCountEls.forEach(el => el.textContent = '0'); }
  },

  initLoadingScreen() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (this.loadingScreen) this.loadingScreen.classList.add('hidden');
      }, 500);
    });
    setTimeout(() => {
      if (this.loadingScreen) this.loadingScreen.classList.add('hidden');
    }, 3000);
  },

  showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  formatPrice(price) { return '₹' + parseFloat(price).toLocaleString('en-IN'); },

  async getSetting(key) {
    try {
      const snap = await db.ref(`settings/${key}`).once('value');
      return snap.val();
    } catch { return null; }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
