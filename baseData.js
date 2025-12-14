const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// ====================
// MIDDLEWARES
// ====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ====================
// BASE DE DATOS
// ====================
const db = new sqlite3.Database("Monse.db");

db.run(`
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha TEXT NOT NULL,
  imagen_url TEXT
)
`);

// ====================
// EJS
// ====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "Archives"));

// ====================
// MULTER
// ====================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// ====================
// RUTA GET
// ====================
app.get("/", (req, res) => {
  db.all("SELECT * FROM events ORDER BY fecha DESC", (err, eventos) => {
    if (err) return res.status(500).send(err);

    res.render("Home", { eventos });
  });
});

// ====================
// RUTA POST
// ====================
app.post("/eventos", upload.single("imagen"), (req, res) => {
  const { titulo, descripcion, fecha } = req.body;

  const imagen_url = req.file
    ? `/uploads/${req.file.filename}`
    : null;

  db.run(
    `INSERT INTO events (titulo, descripcion, fecha, imagen_url)
     VALUES (?, ?, ?, ?)`,
    [titulo, descripcion, fecha, imagen_url],
    (err) => {
      if (err) return res.status(500).send(err);
      res.redirect("/");
    }
  );
});

// ====================
// SERVIDOR
// ====================
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
