const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // needed for form submissions
app.use(bodyParser.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",            // your MySQL username
  password: "#Saranaik0704", // your MySQL password
  database: "jobcloud"       // database name
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database!");
});

// ✅ Default route (for testing only)
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

// ✅ Start server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
