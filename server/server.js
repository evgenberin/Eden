import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ===== Serve frontend =====
app.use(express.static(path.join(__dirname, ".."))); // phục vụ tất cả file ở root repo

// ===== API Proxy =====
const API_BASE_URL = "https://6891f14a447ff4f11fbe7065.mockapi.io/users";

// ✅ Middleware chặn truy cập không hợp lệ (Render + GitHub Pages)
const whitelist = [
  "https://eden-batw.onrender.com/",
  "https://evgenberin.github.io/",  // GitHub Pages
  "https://khachsanedenplaza.com/",
  "https://www.khachsanedenplaza.com/"
];

// Ping
app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/api", (req, res, next) => {
  const referer = req.headers.referer || "";

  if (!whitelist.some(domain => referer.startsWith(domain))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
});

// ✅ GET all users
app.get("/api/users", async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      return res.status(response.status).json({ error: "API GET lỗi" });
    }

    const users = await response.json();

    // Giữ đủ field cần cho frontend
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      status: u.status,
      sort: u.sort,
      bookingcode: u.bookingcode,
      linkqr: u.linkqr,
      amount: u.amount
    }));

    res.json(safeUsers);
  } catch (error) {
    console.error("❌ Lỗi khi GET API:", error);
    res.status(500).json({ error: "Lỗi khi gọi API" });
  }
});

// ✅ GET single user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: "API GET user lỗi" });
    }

    const user = await response.json();
    res.json(user);
  } catch (error) {
    console.error("❌ Lỗi khi GET user API:", error);
    res.status(500).json({ error: "Lỗi khi gọi API user" });
  }
});

// ✅ PUT update user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "API PUT lỗi" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Lỗi khi PUT API:", error);
    res.status(500).json({ error: "Lỗi khi update API" });
  }
});

// ===== Serve index.html cho mọi route khác =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

