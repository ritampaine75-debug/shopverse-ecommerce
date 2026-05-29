const Profile = {
  async loadProfile() {
    const user = auth.currentUser;
    if (!user) { window.location.href = 'login.html'; return; }
    const snap = await db.ref(`users/${user.uid}`).once('value');
    return snap.val() || {};
  },

  async saveAddress(address) {
    const user = auth.currentUser;
    if (!user) return;
    await db.ref(`users/${user.uid}/addresses`).push(address);
    App.showToast('Address saved!', 'success');
  },

  async getAddresses() {
    const user = auth.currentUser;
    if (!user) return [];
    const snap = await db.ref(`users/${user.uid}/addresses`).once('value');
    if (!snap.val()) return [];
    return Object.entries(snap.val()).map(([id, a]) => ({ id, ...a }));
  }
};
