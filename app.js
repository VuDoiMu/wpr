import express from "express";
import path from "path";
import mysql2 from "mysql2";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAllUsers, getAllUsersNoPassword, getUserByEmailNoPassword, getUserByIDNoPassword, getUserById, handleLogin, handleRegister } from "./model/User/User.js";
import { LOGIN_RESULT, BOUNDARY } from "./utils/enums.js";
import session from 'express-session';
import { composeEmail, getEmailByID, getInboxByUserId, getOutboxByUserId } from "./model/Email/Email.js";
import multer from "multer";
import fs from "fs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const upload = multer({ dest: 'upload', filename: () => { return "img.jpg" } })
app.set("view engine", "ejs");

export const db = mysql2.createConnection({
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


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json())
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

const authCheck = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/signin')
    } else {
        next()
    }
}
// Set up routes
app.get("/", (req, res) => {
    res.render("home");
});

app.get("/signin", (req, res) => {
    res.render("signin")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/inbox", authCheck, async (req, res) => {
    const inboxEmails = await getInboxByUserId(req.session.userId)

    res.render("inbox", { inboxItems: inboxEmails })
})

app.get("/compose", authCheck, async (req, res) => {
    const userList = await getAllUsersNoPassword(req.session.userId)
    const autofillData = {
        userList: userList.data,
        receiver: "",
        subject: "(no subject)",
    }
    res.render('compose', { autofillData: autofillData })
})

app.get("/compose/:userID1/:userID2/:subject", authCheck, async (req, res) => {
    const { userID1, userID2, subject } = req.params
    let receiver = userID1

    if (receiver == req.session.userId) {
        receiver = userID2
    }
    const userList = await getAllUsersNoPassword(req.session.userId)
    const index = userList.data.findIndex(user => user.id == receiver);
    if (index !== -1) {
        userList.data.splice(0, 0, userList.data.splice(index, 1)[0]);
    }
    const autofillData = {
        userList: userList.data,
        receiver: "",
        subject: subject ? `Re:${subject}` : "(no subject)",
    }

    res.render("compose", { autofillData: autofillData })
})

app.get("/emailDetail/:id", authCheck, async (req, res) => {
    const emailDetail = await getEmailByID(req.params.id)
    res.render('emailDetail', { data: emailDetail.data })
})

app.get("/outbox", authCheck, async (req, res) => {
    const outboxEmails = await getOutboxByUserId(req.session.userId)

    res.render("outbox", { outboxItems: outboxEmails })
})

app.post("/login", async (req, res) => {
    const loginResult = await handleLogin(req.body.email, req.body.password)

    if (loginResult.status === LOGIN_RESULT.SUCCESS) {
        req.session.userId = loginResult.data.id;
        res.json(loginResult);
    } else {
        res.json(loginResult)
    }
})

app.post("/register", async (req, res) => {
    const registerResult = await handleRegister(req.body.userName, req.body.email, req.body.password)
    res.json(registerResult)
})

app.post("/compose", authCheck, upload.single("attachment"), async (req, res) => {
    console.log(req.body);
    console.log(req.file);

    const renameFile = () => {
        const extension = path.extname(req.file.originalname);
        const newName = req.file.filename + extension

        fs.rename(req.file.path, path.join(req.file.destination, newName),
            (err) => {
                if (err) {
                    console.error(err);
                }
            });

        return path.join(req.file.destination, newName)
    }

    let subject = req.body.subject ? (req.body.subject) : "(no subject)"
    let body = req.body.body ? (req.body.body) : null
    let attachment = req.file ? renameFile() : null
    const receiver = await getUserByEmailNoPassword(req.body.receiver);

    const sendEmail = await composeEmail(req.session.userId, receiver.data.id, subject, body, attachment);

    res.json(sendEmail);
});

app.get("/downloadAttachment/:emailID", authCheck, async (req, res) => {
    const emailData = await getEmailByID(req.params.emailID);
    const attachmentPath = emailData.data.attachment;

    fs.readFile(attachmentPath, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error downloading file');
        } else {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', 'attachment; filename=' + attachmentPath);
            res.send(data);
        }

    });
})

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Web is running on port ${PORT}`);
});