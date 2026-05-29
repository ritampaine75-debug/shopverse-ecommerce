const Search = {
  async search(query, filters = {}) {
    const snap = await db.ref('products').once('value');
    if (!snap.val()) return [];
    let results = Object.entries(snap.val()).map(([id, p]) => ({ id, ...p }));
    const q = query.toLowerCase();
    if (q) results = results.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
    if (filters.category) results = results.filter(p => p.category === filters.category);
    if (filters.minPrice) results = results.filter(p => (p.salePrice || p.price) >= filters.minPrice);
    if (filters.maxPrice) results = results.filter(p => (p.salePrice || p.price) <= filters.maxPrice);
    if (filters.rating) results = results.filter(p => (p.rating || 0) >= filters.rating);
    if (filters.brand) results = results.filter(p => p.brand === filters.brand);
    if (filters.inStock) results = results.filter(p => p.stock > 0);
    return results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },

  async getSuggestions(query) {
    if (query.length < 2) return [];
    const snap = await db.ref('products').limitToFirst(100).once('value');
    if (!snap.val()) return [];
    const q = query.toLowerCase();
    return Object.entries(snap.val())
      .filter(([, p]) => p.name?.toLowerCase().includes(q))
      .slice(0, 6)
      .map(([id, p]) => ({ id, name: p.name, price: p.salePrice || p.price, image: p.images?.[0] || p.image }));
  }
};
