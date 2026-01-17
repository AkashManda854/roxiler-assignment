const { all, get, run } = require("../models/db");

const listStores = async (req, res, next) => {
  try {
    const name = req.query.name || "";
    const address = req.query.address || "";
    const sortBy = ["name", "address"].includes(req.query.sortBy) ? req.query.sortBy : "name";
    const sortOrder = req.query.sortOrder === "desc" ? "DESC" : "ASC";

    const sql = `
      SELECT s.id, s.name, s.address,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
      WHERE s.name LIKE ? AND s.address LIKE ?
      GROUP BY s.id
      ORDER BY ${sortBy} ${sortOrder}
    `;
    const stores = await all(sql, [req.user.id, `%${name}%`, `%${address}%`]);
    return res.json({ stores });
  } catch (err) {
    return next(err);
  }
};

const submitRating = async (req, res, next) => {
  try {
    const { store_id, rating } = req.body;
    const store = await get("SELECT id FROM stores WHERE id = ?", [store_id]);
    if (!store) return res.status(404).json({ error: "Store not found" });

    const existing = await get(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [req.user.id, store_id]
    );
    if (existing) return res.status(409).json({ error: "Rating already exists" });

    const result = await run(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
      [req.user.id, store_id, rating]
    );

    const newRating = await get("SELECT * FROM ratings WHERE id = ?", [result.id]);
    return res.status(201).json({ rating: newRating });
  } catch (err) {
    return next(err);
  }
};

const updateRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const storeId = req.params.storeId;

    const existing = await get(
      "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
      [req.user.id, storeId]
    );
    if (!existing) return res.status(404).json({ error: "Rating not found" });

    await run("UPDATE ratings SET rating = ? WHERE id = ?", [rating, existing.id]);
    const updated = await get("SELECT * FROM ratings WHERE id = ?", [existing.id]);
    return res.json({ rating: updated });
  } catch (err) {
    return next(err);
  }
};

module.exports = { listStores, submitRating, updateRating };
