const { log } = require("console");
const mysql = require("mysql2");

const databaseConfig = {
  host: "localhost",
  user: "wpr",
  password: "fit2024",
  port: 3306,
};

const databaseName = "wpr1901040174";
const database = mysql.createConnection(databaseConfig);

// Function to initialize the database and tables
const initDatabase = () => {
  const initSQL = [
    `DROP TABLE IF EXISTS emails`,
    `DROP TABLE IF EXISTS users`,
    `CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS emails (id INT PRIMARY KEY AUTO_INCREMENT, sender_id INT NOT NULL, receiver_id INT NOT NULL, subject VARCHAR(255) NOT NULL, message TEXT, attachment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `INSERT INTO users (name, email, password) VALUES 
      ('User 1', 'a@a.com', '123'),
      ('User 2', 'b@b.com', 'password2'),
      ('User 3', 'c@c.com', 'password3')`,
    `INSERT INTO emails (sender_id, receiver_id, subject, message, attachment) VALUES 
      (1, 2, 'Hello', 'Hello, User 2!', NULL),
      (2, 1, 'Hi', 'Hi, User 1!', NULL),
      (1, 2, 'How are you?', 'How are you?', NULL),
      (2, 1, 'Doing well', 'I am doing well, thanks!', NULL),
      (1, 3, 'Hello', 'Hello, User 3!', NULL),
      (3, 1, 'Hi', 'Hi, User 1!', NULL),
      (1, 3, 'How are you?', 'How are you?', NULL),
      (3, 1, 'Doing well', 'I am doing well, thanks!', NULL);`,
  ];

  let count = 0;
  console.log("Initiating Database...");

  // Run each SQL query in the initSQL array
  initSQL.forEach((sql) => {
    database.query(sql, (err, rows) => {
      if (err) {
        console.error("Error init:", err);
        database.end();
        return;
      }

      count++;
      if (count === initSQL.length) {
        database.end((err) => {
          if (err) throw err;
          console.log("Database initiation finished");
        });

        process.kill(0);
      }
    });
  });
};

// Connect to MySQL server without specifying the database
database.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL server...");

  // Check if the database exists and create it if it doesn't
  database.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (err) => {
    if (err) {
      console.error("Error creating database:", err);
      database.end();
      return;
    }

    console.log(`Database '${databaseName}' ready.`);

    // Switch to the database and initialize tables
    database.changeUser({ database: databaseName }, (err) => {
      if (err) {
        console.error("Error switching database:", err);
        database.end();
        return;
      }
      initDatabase();
    });
  });
});
