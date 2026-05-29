const Products = {
  renderCard(p) {
    return `
      <div class="product-card fade-in" onclick="window.location.href='product.html?id=${p.id}'">
        <img class="image" src="${p.images?.[0] || p.image || 'https://via.placeholder.com/300'}" alt="${p.name}" loading="lazy">
        <div class="info">
          <h3>${p.name}</h3>
          ${p.rating ? `<div class="rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))}</div>` : ''}
          <div class="price">${App.formatPrice(p.salePrice || p.price)} ${p.salePrice ? `<span class="old">${App.formatPrice(p.price)}</span>` : ''}</div>
          ${p.discount ? `<span class="badge badge-danger">-${p.discount}%</span>` : ''}
          <div class="actions">
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();Cart.add('${p.id}')"><i class="fas fa-shopping-cart"></i></button>
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();Wishlist.toggle('${p.id}')"><i class="fas fa-heart"></i></button>
          </div>
        </div>
      </div>`;
  },

  async getProduct(id) {
    const snap = await db.ref(`products/${id}`).once('value');
    return snap.exists() ? { id, ...snap.val() } : null;
  },

  async getRelated(product, limit = 4) {
    const snap = await db.ref('products').orderByChild('category').equalTo(product.category).limitToFirst(limit + 1).once('value');
    if (!snap.val()) return [];
    return Object.entries(snap.val()).filter(([id]) => id !== product.id).slice(0, limit).map(([id, p]) => ({ id, ...p }));
  },

  async getFeatured(limit = 8) {
    const snap = await db.ref('products').orderByChild('featured').equalTo(true).limitToFirst(limit).once('value');
    if (!snap.val()) return [];
    return Object.entries(snap.val()).map(([id, p]) => ({ id, ...p }));
  }
};
