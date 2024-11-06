const mysql2 = require("mysql2");

const db = mysql2.createConnection({
  host: "localhost",
  user: "wpr",
  password: "fit2024",
  database: "wpr1901040174",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

module.exports = db;
