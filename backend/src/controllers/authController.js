const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { get, run } = require("../models/db");

const createToken = (user) => {
  const payload = { id: user.id, role: user.role, name: user.name, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;
    const existing = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, 'user')",
      [name, email, hash, address || null]
    );

    const user = await get("SELECT id, name, email, address, role FROM users WHERE id = ?", [
      result.id,
    ]);
    const token = createToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = createToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    };
    return res.json({ token, user: safeUser });
  } catch (err) {
    return next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await get("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ error: "Current password is incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    await run("UPDATE users SET password = ? WHERE id = ?", [hash, user.id]);
    return res.json({ status: "password_updated" });
  } catch (err) {
    return next(err);
  }
};

module.exports = { signup, login, updatePassword };
