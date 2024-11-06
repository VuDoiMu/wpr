const express = require("express");
const path = require("path");
const mysql2 = require("mysql2");
const { fileURLToPath } = require("url");
const { dirname } = require("path");
const {
  getAllUsers,
  getAllUsersNoPassword,
  getUserByEmailNoPassword,
  getUserByIDNoPassword,
  getUserById,
  handleLogin,
  handleRegister,
} = require("./model/User/User.js");
const { LOGIN_RESULT } = require("./utils/enums.js");
const {
  composeEmail,
  getEmailByID,
  getInboxByUserId,
  getOutboxByUserId,
} = require("./model/Email/Email.js");
const multer = require("multer");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const db = require("./database.js");

const app = express();
const upload = multer({
  dest: "upload",
  filename: () => {
    return "img.jpg";
  },
});
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(
  cookieParser({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

const authCheck = (req, res, next) => {
  const userId = req.cookies.userId;
  console.log(req.cookies);
  if (!userId) {
    res.redirect("/signin");
  } else {
    next();
  }
};

app.get("/", authCheck, (req, res) => {
  res.redirect("/inbox");
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/inbox", authCheck, async (req, res) => {
  const inboxEmails = await getInboxByUserId(req.cookies.userId);

  res.render("inbox", { inboxItems: inboxEmails });
});

app.get("/compose", authCheck, async (req, res) => {
  const userList = await getAllUsersNoPassword(req.cookies.userId);
  const autofillData = {
    userList: userList.data,
    receiver: "",
    subject: "(no subject)",
  };
  res.render("compose", { autofillData: autofillData });
});

app.get("/compose/:userID1/:userID2/:subject", authCheck, async (req, res) => {
  const { userID1, userID2, subject } = req.params;
  let receiver = userID1;

  if (receiver == req.cookies.userId) {
    receiver = userID2;
  }
  const userList = await getAllUsersNoPassword(req.cookies.userId);
  const index = userList.data.findIndex((user) => user.id == receiver);
  if (index !== -1) {
    userList.data.splice(0, 0, userList.data.splice(index, 1)[0]);
  }
  const autofillData = {
    userList: userList.data,
    receiver: "",
    subject: subject ? `Re:${subject}` : "(no subject)",
  };

  res.render("compose", { autofillData: autofillData });
});

app.get("/emailDetail/:id", authCheck, async (req, res) => {
  const emailDetail = await getEmailByID(req.params.id);
  res.render("emailDetail", { data: emailDetail.data });
});

app.get("/outbox", authCheck, async (req, res) => {
  const outboxEmails = await getOutboxByUserId(req.cookies.userId);

  res.render("outbox", { outboxItems: outboxEmails });
});

app.post("/login", async (req, res) => {
  const loginResult = await handleLogin(req.body.email, req.body.password);
  if (loginResult.status === LOGIN_RESULT.SUCCESS) {
    res.cookie("userId", loginResult.data.id);
    res.json(loginResult);
  } else {
    res.json(loginResult);
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/signin");
});

app.post("/register", async (req, res) => {
  console.log("REGISTERING: ", req.body);
  const registerResult = await handleRegister(
    req.body.userName,
    req.body.email,
    req.body.password
  );
  res.json(registerResult);
});

app.post(
  "/compose",
  authCheck,
  upload.single("attachment"),
  async (req, res) => {
    console.log(req.body);
    console.log(req.file);

    const renameFile = () => {
      const extension = path.extname(req.file.originalname);
      const newName = req.file.filename + extension;

      fs.rename(
        req.file.path,
        path.join(req.file.destination, newName),
        (err) => {
          if (err) {
            console.error(err);
          }
        }
      );

      return path.join(req.file.destination, newName);
    };

    let subject = req.body.subject ? req.body.subject : "(no subject)";
    let body = req.body.body ? req.body.body : null;
    let attachment = req.file ? renameFile() : null;
    const receiver = await getUserByEmailNoPassword(req.body.receiver);

    const sendEmail = await composeEmail(
      req.cookies.userId,
      receiver.data.id,
      subject,
      body,
      attachment
    );

    res.json(sendEmail);
  }
);

app.get("/downloadAttachment/:emailID", authCheck, async (req, res) => {
  const emailData = await getEmailByID(req.params.emailID);
  const attachmentPath = emailData.data.attachment;

  fs.readFile(attachmentPath, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error downloading file");
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + attachmentPath
      );
      res.send(data);
    }
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Web is running on port ${PORT}`);
});
