const { all, get } = require("../models/db");

const dashboard = async (req, res, next) => {
  try {
    const store = await get("SELECT id, name FROM stores WHERE owner_id = ?", [req.user.id]);
    if (!store) return res.status(404).json({ error: "Store not found for owner" });

    const avg = await get(
      "SELECT AVG(rating) as avg_rating FROM ratings WHERE store_id = ?",
      [store.id]
    );

    const raters = await all(
      `SELECT u.id as user_id, u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    return res.json({
      store: { id: store.id, name: store.name },
      avg_rating: avg && avg.avg_rating ? Number(avg.avg_rating).toFixed(2) : null,
      raters,
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { dashboard };
