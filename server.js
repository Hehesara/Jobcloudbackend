const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "#Saranaik0704",
  database: "jobcloud"
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database!");
});

// ✅ Ensure uploads directory exists
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// ✅ Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB limit
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// ✅ Signup route
app.post("/signup", (req, res) => {
  const { fullname, mobile, dob, email, password } = req.body;

  const sql = "INSERT INTO users (fullname, mobile, dob, email, password) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [fullname, mobile, dob, email, password], (err, result) => {
    if (err) {
      console.error("❌ Error during signup:", err);
      res.status(500).send("Error while signing up");
    } else {
      res.send("✅ User registered successfully");
    }
  });
});

// ✅ Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("❌ Error during login:", err);
      res.status(500).send("Error while logging in");
    } else if (results.length > 0) {
      res.send("✅ Login successful");
    } else {
      res.status(401).send("❌ Invalid email or password");
    }
  });
});

// ✅ Application Form Submission Route
app.post('/submit-application', upload.single('resume'), (req, res) => {
  const { fullname, email, phone, cover_letter } = req.body;
  const resumePath = req.file.path;

  const sql = "INSERT INTO applications (fullname, email, phone, cover_letter, resume_path) VALUES (?, ?, ?, ?, ?)";
  
  db.query(sql, [fullname, email, phone, cover_letter, resumePath], (err, result) => {
    if (err) {
      console.error('❌ Error submitting application:', err);
      res.status(500).send('Error submitting application');
    } else {
      res.send('✅ Application submitted successfully');
    }
  });
});

// ✅ Start server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
