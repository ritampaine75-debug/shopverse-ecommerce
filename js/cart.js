const Cart = {
  async add(productId, quantity = 1) {
    const user = auth.currentUser;
    if (!user) { App.showToast('Please login to add items', 'error'); window.location.href = 'login.html'; return; }
    try {
      const ref = db.ref(`cart/${user.uid}/${productId}`);
      const snap = await ref.once('value');
      if (snap.exists()) await ref.update({ quantity: snap.val().quantity + quantity });
      else await ref.set({ productId, quantity, addedAt: Date.now() });
      App.showToast('Added to cart!', 'success');
      App.loadCartCount();
    } catch { App.showToast('Failed to add to cart', 'error'); }
  },

  async remove(productId) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await db.ref(`cart/${user.uid}/${productId}`).remove();
      App.showToast('Removed from cart', 'info');
      App.loadCartCount();
      if (typeof loadCart === 'function') loadCart();
    } catch { App.showToast('Failed to remove', 'error'); }
  },

  async updateQuantity(productId, quantity) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      if (quantity < 1) return this.remove(productId);
      await db.ref(`cart/${user.uid}/${productId}/quantity`).set(quantity);
      App.loadCartCount();
      if (typeof loadCart === 'function') loadCart();
    } catch { App.showToast('Failed to update', 'error'); }
  },

  async getCart() {
    const user = auth.currentUser;
    if (!user) return [];
    const snap = await db.ref(`cart/${user.uid}`).once('value');
    if (!snap.val()) return [];
    const items = [];
    for (const [key, item] of Object.entries(snap.val())) {
      const prodSnap = await db.ref(`products/${item.productId}`).once('value');
      if (prodSnap.exists()) items.push({ key, ...item, product: { id: item.productId, ...prodSnap.val() } });
    }
    return items;
  },

  async getTotal() {
    const items = await this.getCart();
    return items.reduce((sum, item) => sum + (item.product.salePrice || item.product.price) * item.quantity, 0);
  },

  async clear() {
    const user = auth.currentUser;
    if (!user) return;
    await db.ref(`cart/${user.uid}`).remove();
    App.loadCartCount();
  }
};
