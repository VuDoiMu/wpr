const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const app = express();
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set up routes
// app.use("/", (req, res) => {
//   if (req.body) {
//     console.log(req.body);
//   }
//   res.render("index", ); // This will render the index.ejs file
// });

app.post("/api/login", (req, res) => {
  console.log("here", req.body.zxc)
  res.send('what')
})
// app.use("/users", usersRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const db = mysql.createConnection({
  host: "localhost",
  user: "wpr",
  password: "fit2023",
  database: "wpr2023",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Web is running on port ${PORT}`);
});
