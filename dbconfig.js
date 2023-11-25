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
  `DROP TABLE IF EXISTS users`,
  `DROP TABLE IF EXISTS emails`,
  `CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS emails (id INT PRIMARY KEY AUTO_INCREMENT,sender_id INT NOT NULL,receiver_id INT NOT NULL,message TEXT NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `INSERT INTO users (name, email) VALUES ('User 1', 'a@a.com'), ('User 2', 'b@b.com'), ('User 3', 'c@c.com')`,
  `INSERT INTO emails (sender_id, receiver_id, message) VALUES (1, 2, 'Hello, User 2!'), (2, 1, 'Hi, User 1!'), (1, 2, 'How are you?'), (2, 1, 'I am doing well, thanks!'), (1, 3, 'Hello, User 3!'), (3, 1, 'Hi, User 1!'), (1, 3, 'How are you?'), (3, 1, 'I am doing well, thanks!');`,
];

initSQL.forEach((sql) => {
  console.log(sql);
  db.query(sql, (err) => {
    if (err) {
      console.error("Error init:", err);
      db.end();
    }
  });
});

export default db