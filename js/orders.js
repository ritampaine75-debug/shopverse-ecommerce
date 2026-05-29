const Orders = {
  async getUserOrders() {
    const user = auth.currentUser;
    if (!user) return [];
    const snap = await db.ref('orders').orderByChild('userId').equalTo(user.uid).once('value');
    if (!snap.val()) return [];
    return Object.entries(snap.val()).sort(([,a],[,b]) => b.createdAt - a.createdAt).map(([id, o]) => ({ id, ...o }));
  },

  async getOrder(id) {
    const snap = await db.ref(`orders/${id}`).once('value');
    return snap.exists() ? { id, ...snap.val() } : null;
  },

  async cancelOrder(orderId) {
    try {
      await db.ref(`orders/${orderId}/status`).set('cancelled');
      await db.ref(`orders/${orderId}/updatedAt`).set(Date.now());
      App.showToast('Order cancelled', 'info');
      return true;
    } catch { App.showToast('Failed to cancel order', 'error'); return false; }
  },

  statusColor(status) {
    const colors = { pending: '#fdcb6e', processing: '#6c5ce7', shipped: '#00cec9', delivered: '#00b894', cancelled: '#e17055' };
    return colors[status] || '#636e72';
  },

  renderStatusTimeline(status) {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const idx = steps.indexOf(status);
    if (status === 'cancelled') return `<div style="color:#e17055;font-weight:600">Order Cancelled</div>`;
    return steps.map((s, i) => `
      <div style="display:flex;align-items:center;gap:8px;${i <= idx ? 'color:var(--primary);font-weight:600' : 'color:var(--text-secondary)'}">
        <div style="width:24px;height:24px;border-radius:50%;background:${i <= idx ? 'var(--primary)' : 'var(--border)'};display:flex;align-items:center;justify-content:center">
          <i class="fas fa-check" style="color:#fff;font-size:12px"></i>
        </div>
        <span>${s.charAt(0).toUpperCase() + s.slice(1)}</span>
      </div>
    `).join('<div style="width:2px;height:20px;background:var(--border);margin-left:11px"></div>');
  }
};
