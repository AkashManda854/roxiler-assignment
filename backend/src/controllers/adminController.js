const bcrypt = require("bcrypt");
const { all, get, run } = require("../models/db");

const buildFilters = (query, allowedFields) => {
  const clauses = [];
  const params = [];
  allowedFields.forEach((field) => {
    if (query[field]) {
      clauses.push(`${field} LIKE ?`);
      params.push(`%${query[field]}%`);
    }
  });
  return { clauses, params };
};

const buildSort = (query, allowedSort) => {
  const sortBy = allowedSort.includes(query.sortBy) ? query.sortBy : allowedSort[0];
  const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
  return { sortBy, sortOrder };
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hash, address || null, role]
    );
    const user = await get("SELECT id, name, email, address, role FROM users WHERE id = ?", [
      result.id,
    ]);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
};

const dashboard = async (_req, res, next) => {
  try {
    const users = await get("SELECT COUNT(*) as count FROM users");
    const stores = await get("SELECT COUNT(*) as count FROM stores");
    const ratings = await get("SELECT COUNT(*) as count FROM ratings");
    return res.json({ users: users.count, stores: stores.count, ratings: ratings.count });
  } catch (err) {
    return next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { clauses, params } = buildFilters(req.query, ["name", "email", "address", "role"]);
    const { sortBy, sortOrder } = buildSort(req.query, ["name", "email", "role"]);

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const sql = `SELECT id, name, email, address, role FROM users ${where} ORDER BY ${sortBy} ${sortOrder}`;
    const users = await all(sql, params);
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await get("SELECT id, name, email, address, role FROM users WHERE id = ?", [
      req.params.id,
    ]);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "owner") {
      const rating = await get(
        `SELECT AVG(r.rating) as avg_rating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?`,
        [user.id]
      );
      user.store_rating = rating && rating.avg_rating ? Number(rating.avg_rating).toFixed(2) : null;
    }

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
};

const listStores = async (req, res, next) => {
  try {
    const { clauses, params } = buildFilters(req.query, ["name", "email", "address"]);
    const { sortBy, sortOrder } = buildSort(req.query, ["name", "email"]);

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const sql = `
      SELECT s.id, s.name, s.email, s.address,
             COALESCE(AVG(r.rating), 0) as avg_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      ${where}
      GROUP BY s.id
      ORDER BY ${sortBy} ${sortOrder}
    `;
    const stores = await all(sql, params);
    return res.json({ stores });
  } catch (err) {
    return next(err);
  }
};

const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const existing = await get("SELECT id FROM stores WHERE email = ?", [email]);
    if (existing) return res.status(409).json({ error: "Email already in use" });

    if (owner_id) {
      const owner = await get("SELECT id, role FROM users WHERE id = ?", [owner_id]);
      if (!owner || owner.role !== "owner") {
        return res.status(400).json({ error: "owner_id must be a valid owner" });
      }
    }

    const result = await run(
      "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
      [name, email, address || null, owner_id || null]
    );

    const store = await get("SELECT * FROM stores WHERE id = ?", [result.id]);
    return res.status(201).json({ store });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createUser,
  dashboard,
  listUsers,
  getUserById,
  listStores,
  createStore,
};
