const Wishlist = {
  async toggle(productId) {
    const user = auth.currentUser;
    if (!user) { App.showToast('Please login', 'error'); window.location.href = 'login.html'; return; }
    try {
      const ref = db.ref(`wishlist/${user.uid}/${productId}`);
      const snap = await ref.once('value');
      if (snap.exists()) { await ref.remove(); App.showToast('Removed from wishlist', 'info'); }
      else { await ref.set({ productId, addedAt: Date.now() }); App.showToast('Added to wishlist!', 'success'); }
      App.loadWishlistCount();
      if (typeof loadWishlist === 'function') loadWishlist();
    } catch { App.showToast('Failed to update wishlist', 'error'); }
  },

  async remove(productId) {
    const user = auth.currentUser;
    if (!user) return;
    await db.ref(`wishlist/${user.uid}/${productId}`).remove();
    App.loadWishlistCount();
    if (typeof loadWishlist === 'function') loadWishlist();
  },

  async getWishlist() {
    const user = auth.currentUser;
    if (!user) return [];
    const snap = await db.ref(`wishlist/${user.uid}`).once('value');
    if (!snap.val()) return [];
    const items = [];
    for (const [key, item] of Object.entries(snap.val())) {
      const prodSnap = await db.ref(`products/${item.productId}`).once('value');
      if (prodSnap.exists()) items.push({ key, ...item, product: { id: item.productId, ...prodSnap.val() } });
    }
    return items;
  }
};
