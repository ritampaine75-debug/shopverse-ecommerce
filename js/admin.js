const Admin = {
  checkAuth() {
    const user = auth.currentUser;
    if (!user || user.email !== 'admin@admin.com') {
      window.location.href = '../login.html';
      return false;
    }
    return true;
  },

  async getStats() {
    const [ordersSnap, productsSnap, usersSnap, reviewsSnap] = await Promise.all([
      db.ref('orders').once('value'),
      db.ref('products').once('value'),
      db.ref('users').once('value'),
      db.ref('reviews').once('value')
    ]);
    const orders = ordersSnap.val();
    const products = productsSnap.val();
    const users = usersSnap.val();
    const reviews = reviewsSnap.val();
    const ordersArr = orders ? Object.values(orders) : [];
    const totalRevenue = ordersArr.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
    return {
      totalRevenue,
      totalOrders: ordersArr.length,
      totalProducts: products ? Object.keys(products).length : 0,
      totalUsers: users ? Object.keys(users).length : 0,
      pendingOrders: ordersArr.filter(o => o.status === 'pending').length,
      deliveredOrders: ordersArr.filter(o => o.status === 'delivered').length,
      ordersArr,
      products: products ? Object.entries(products).map(([id, p]) => ({ id, ...p })) : [],
      users: users ? Object.entries(users).map(([id, u]) => ({ id, ...u })) : [],
      reviews: reviews ? Object.entries(reviews).map(([id, r]) => ({ id, ...r })) : []
    };
  },

  async addProduct(data) {
    const ref = db.ref('products').push();
    await ref.set({ ...data, createdAt: Date.now(), status: 'active' });
    return ref.key;
  },

  async updateProduct(id, data) {
    await db.ref(`products/${id}`).update({ ...data, updatedAt: Date.now() });
  },

  async deleteProduct(id) {
    await db.ref(`products/${id}`).remove();
  },

  async addCategory(data) {
    const ref = db.ref('categories').push();
    await ref.set(data);
    return ref.key;
  },

  async updateCategory(id, data) {
    await db.ref(`categories/${id}`).update(data);
  },

  async deleteCategory(id) {
    await db.ref(`categories/${id}`).remove();
  },

  async addBanner(data) {
    const ref = db.ref('banners').push();
    await ref.set({ ...data, createdAt: Date.now() });
    return ref.key;
  },

  async deleteBanner(id) {
    await db.ref(`banners/${id}`).remove();
  },

  async updateOrderStatus(orderId, status) {
    await db.ref(`orders/${orderId}`).update({ status, updatedAt: Date.now() });
    App.showToast(`Order ${status}`, 'success');
  },

  async blockUser(userId) {
    await db.ref(`users/${userId}/isBlocked`).set(true);
    App.showToast('User blocked', 'info');
  },

  async unblockUser(userId) {
    await db.ref(`users/${userId}/isBlocked`).set(false);
    App.showToast('User unblocked', 'info');
  },

  async deleteUser(userId) {
    await db.ref(`users/${userId}`).remove();
    App.showToast('User deleted', 'info');
  },

  async approveReview(reviewId) {
    await db.ref(`reviews/${reviewId}/approved`).set(true);
    App.showToast('Review approved', 'success');
  },

  async deleteReview(reviewId) {
    await db.ref(`reviews/${reviewId}`).remove();
    App.showToast('Review deleted', 'info');
  },

  async createCoupon(data) {
    const ref = db.ref('coupons').push();
    await ref.set({ ...data, usedCount: 0, createdAt: Date.now() });
    return ref.key;
  },

  async updateCoupon(id, data) {
    await db.ref(`coupons/${id}`).update(data);
  },

  async deleteCoupon(id) {
    await db.ref(`coupons/${id}`).remove();
  },

  async updateSetting(key, value) {
    await db.ref(`settings/${key}`).set(value);
  },

  async uploadImage(file, path = 'products') {
    const ref = storage.ref(`${path}/${Date.now()}_${file.name}`);
    const snap = await ref.put(file);
    return await snap.ref.getDownloadURL();
  },

  async uploadMultipleImages(files, path = 'products') {
    return Promise.all(Array.from(files).map(f => this.uploadImage(f, path)));
  },

  async sendNotification(data) {
    const ref = db.ref('notifications').push();
    await ref.set({ ...data, createdAt: Date.now(), read: false });
  }
};
