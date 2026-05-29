const Checkout = {
  async placeOrder(data) {
    const user = auth.currentUser;
    if (!user) { App.showToast('Please login', 'error'); return; }
    try {
      const cartItems = await Cart.getCart();
      if (!cartItems.length) { App.showToast('Cart is empty', 'error'); return; }
      const orderId = db.ref('orders').push().key;
      const total = cartItems.reduce((s, i) => s + (i.product.salePrice || i.product.price) * i.quantity, 0);
      const tax = total * 0.05;
      const shipping = total > 499 ? 0 : 40;
      const discount = data.couponDiscount || 0;
      const order = {
        userId: user.uid,
        items: cartItems.map(i => ({ productId: i.productId, name: i.product.name, price: i.product.salePrice || i.product.price, quantity: i.quantity, image: i.product.images?.[0] || i.product.image || '' })),
        subtotal: total,
        tax, shipping, discount,
        total: total + tax + shipping - discount,
        address: data.address,
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode || '',
        couponDiscount: discount,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await db.ref(`orders/${orderId}`).set(order);
      await db.ref(`users/${user.uid}/addresses`).set(data.address);
      await Cart.clear();
      if (data.couponId) await this.applyCouponUsage(data.couponId, user.uid);
      App.showToast('Order placed successfully!', 'success');
      window.location.href = `order-confirmation.html?id=${orderId}`;
    } catch { App.showToast('Failed to place order', 'error'); }
  },

  async validateCoupon(code) {
    try {
      const snap = await db.ref('coupons').orderByChild('code').equalTo(code.toUpperCase()).once('value');
      if (!snap.val()) return { valid: false, message: 'Invalid coupon code' };
      const [id, coupon] = Object.entries(snap.val())[0];
      if (coupon.expiry && Date.now() > coupon.expiry) return { valid: false, message: 'Coupon expired' };
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
      return { valid: true, coupon: { id, ...coupon } };
    } catch { return { valid: false, message: 'Error validating coupon' }; }
  },

  async applyCouponUsage(couponId, userId) {
    const snap = await db.ref(`coupons/${couponId}/usedBy`).once('value');
    const usedBy = snap.val() || {};
    usedBy[userId] = true;
    await db.ref(`coupons/${couponId}`).update({
      usedCount: Object.keys(usedBy).length,
      usedBy
    });
  }
};
