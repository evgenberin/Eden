import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===== Cấu hình CORS an toàn =====
const whitelist = [
  "https://eden-batw.onrender.com",
  "https://evgenberin.github.io"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());

// ===== Serve frontend từ thư mục public/dist =====
app.use(express.static(path.join(__dirname, "../public"))); // Nên build frontend vào public/dist

// ===== API Proxy (ẩn MockAPI) =====
const API_BASE_URL = "https://6891f14a447ff4f11fbe7065.mockapi.io/users";

// ✅ Middleware lọc Referer để chặn request lạ (optional)
app.use("/api", (req, res, next) => {
  const referer = req.headers.referer || "";
  try {
    const refererOrigin = referer ? new URL(referer).origin : "";
    if (referer && !whitelist.includes(refererOrigin)) {
      return res.status(403).json({ error: "Forbidden" });
    }
  } catch {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// ✅ Helper ẩn MockAPI URL trong lỗi
function handleApiError(res, response, action = "API") {
  console.error(`❌ ${action} lỗi:`, response.status, response.statusText);
  return res.status(response.status).json({ error: `${action} thất bại` });
}

// ✅ GET all users
app.get("/api/users", async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) return handleApiError(res, response, "GET users");

    const users = await response.json();
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
    console.error("❌ Lỗi server khi GET users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET single user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${req.params.id}`);
    if (!response.ok) return handleApiError(res, response, "GET user");

    const user = await response.json();
    // Ẩn mọi field có thể lộ URL nội bộ
    const safeUser = {
      id: user.id,
      name: user.name,
      status: user.status,
      sort: user.sort,
      bookingcode: user.bookingcode,
      linkqr: user.linkqr,
      amount: user.amount
    };

    res.json(safeUser);
  } catch (error) {
    console.error("❌ Lỗi server khi GET user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ PUT update user
app.put("/api/users/:id", async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) return handleApiError(res, response, "Update user");

    const updated = await response.json();
    // Chỉ trả về field cần thiết
    const safeUser = {
      id: updated.id,
      name: updated.name,
      status: updated.status,
      sort: updated.sort,
      bookingcode: updated.bookingcode,
      linkqr: updated.linkqr,
      amount: updated.amount
    };

    res.json(safeUser);
  } catch (error) {
    console.error("❌ Lỗi server khi PUT user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Serve index.html cho mọi route khác (SPA fallback) =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

