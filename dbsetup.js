import { log } from "console";
import mysql from "mysql2";

const dbConfig = {
  host: "localhost",
  user: "wpr",
  password: "fit2023",
  database: "wpr2023",
  port: 3306,
};

const db = mysql.createConnection(dbConfig);

const initSQL = [
  `DROP TABLE IF EXISTS emails`,
  `DROP TABLE IF EXISTS users`,
  `CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS emails (id INT PRIMARY KEY AUTO_INCREMENT, sender_id INT NOT NULL, receiver_id INT NOT NULL, subject VARCHAR(255) NOT NULL, message TEXT, attachment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `INSERT INTO users (name, email, password) VALUES 
    ('User 1', 'a@a.com', '123456'),
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
console.log("Initiating Database...")
initSQL.forEach((sql) => {
  db.query(sql, (err, rows) => {
    if (count < initSQL.length) {
      count++
    }
    if (count === initSQL.length) {
      db.end((err) => {
        if (err) throw err;
        console.log('Database initiation finished');
      });

      process.kill(0)
    }

    if (err) {
      console.error("Error init:", err);
      db.end();
    }
  })
});


export default db