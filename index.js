const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const CLIENT_PORT = process.env.CLIENT_PORT || 3000;

const app = express();
app.use(
 cors({
  origin: `http://localhost:${CLIENT_PORT}`,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
 })
);

app.use(express.json());

const db = new sqlite3.Database("softserve.db", (err) => {
 if (err) {
  console.error(err.message);
 }
 console.log("Connected to the database.");
});

// CREATE
app.post("/products", async (req, res) => {
 const { name, price } = req.body;
 if (!name || !price) {
  return res.status(400).json({ error: "Invalid data format" });
 }

 const sql = `INSERT INTO products (name, price) VALUES (?, ?)`;
 try {
  const result = await db.run(sql, [name, price]);
  res.status(201).json({
   message: "Product added successfully.",
   productId: result.lastID,
  });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

// READ all
app.get("/products", async (req, res) => {
 const sql = `SELECT * FROM products`;
 try {
  const rows = await db.all(sql);
  res.json(rows);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

// READ once
app.get("/products/:id", async (req, res) => {
 const id = req.params.id;
 const sql = `SELECT * FROM products WHERE id = ?`;
 try {
  const row = await db.get(sql, id);
  if (!row) {
   return res.status(404).json({ error: "Product not found" });
  }
  res.json(row);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

// UPDATE
app.patch("/products/:id", async (req, res) => {
 const id = req.params.id;
 const selectSqlGet = "SELECT name, price FROM products WHERE id = ?";
 try {
  const row = await db.get(selectSqlGet, [id]);
  if (!row) {
   return res.status(404).json({ error: "Product not found" });
  }

  const name = req.body.name || row.name;
  const price = req.body.price || row.price;
  const sqlWrite = `UPDATE products SET name = ?, price = ? WHERE id = ?`;

  await db.run(sqlWrite, [name, price, id]);
  res.json({
   message: "Product updated successfully.",
  });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

// DELETE
app.delete("/products/:id", async (req, res) => {
 const id = req.params.id;
 const sql = `DELETE FROM products WHERE id = ?`;
 try {
  const result = await db.run(sql, id);
  if (result.changes === 0) {
   return res.status(404).json({ error: "Product not found" });
  }
  res.json({
   message: "Product deleted successfully.",
  });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
});

app.listen(PORT, () => {
 console.log(`Server running at http://localhost:${PORT}`);
});
