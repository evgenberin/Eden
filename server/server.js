// server/server.js
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

// ✅ Middleware chặn truy cập không hợp lệ
app.use("/api", (req, res, next) => {
  const referer = req.headers.referer || "";
  if (!referer.startsWith("https://eden-teyz.onrender.com")) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// ✅ GET users (chỉ trả dữ liệu an toàn)
app.get("/api/users", async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL);
    const users = await response.json();

    // Ẩn các field nhạy cảm, chỉ trả về frontend phần cần hiển thị
    const safeUsers = users.map(u => ({
      bookingcode: u.bookingcode,
      linkqr: u.linkqr,
      amount: u.amount
    }));

    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi gọi API" });
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
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi update API" });
  }
});

// ===== Serve index.html cho mọi route khác =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


