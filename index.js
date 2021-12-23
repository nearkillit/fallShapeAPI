const express = require("express");
const router = express.Router();
const cors = require("cors");

const session = require("express-session");
// const cookieSession = require("cookie-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// sequelize
const db = require("./models/index");
const { Op } = require("sequelize");
// herokuのプロキシ回避
let getUser = {};

// express-session
router.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://192.168.160.38:3000",
      "https://fallgame.herokuapp.com",
    ],
  })
);
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: false,
  })
);
// router.use(
//   cookieSession({
//     name: "__session",
//     keys: ["key1"],
//       maxAge: 24 * 60 * 60 * 100,
//       secure: true,
//       sameSite: 'none'
//   })
// );
router.use(passport.initialize());
router.use(passport.session());

// ここでsessionにuserが入る req.userで取れる
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// deserializerはないとエラーになる
passport.deserializeUser(async (id, done) => {
  const userData = await db.users.findOne({ where: { id } });
  done(null, userData.dataValues);
});

passport.use(
  new LocalStrategy(
    {
      passReqToCallBack: true,
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      const userData = await db.users.findOne({ where: { email: username } });
      if (!userData) {
        return done(null, false);
      } else if (username !== userData.email) {
        // Error
        return done(null, false);
      } else if (password !== userData.password) {
        // Error
        return done(null, false);
      } else {
        // Success and return user information.
        getUser = userData.dataValues;
        return done(null, userData.dataValues);
      }
    }
  )
);

router.get("/", async (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

router.get("/failure", (req, res) => {
  res.send("Failure");
});

router.get("/success", (req, res) => {
  console.log(Boolean(req.session));
  console.log(getUser);
  if (req.session) res.send(req.user);
  else res.send(getUser);
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/failure",
    successRedirect: "/success",
    session: true,
  })
);

// 新規登録
router.post("/signup", async (req, res) => {
  try {
    const result = await db.users.create(req.body);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

// ログアウト
router.post("/logout", (req, res) => {
  if (req.session.passport) {
    req.session.passport.user = undefined;
    res.send("logout");
  } else {
    res.send("logouted");
  }
});

// usersのput_atの更新
router.put("/", async (req, res) => {
  try {
    const result = await db.users.update(req.body, {
      where: { id: req.body.id },
    });
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

// shapesの取得
router.get("/shapes", async (req, res) => {
  try {
    const result = await db.shapes.findAll();
    await deletedShapes();
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

// shapesの追加 *reqは実質useridのみ
router.post("/shapes", async (req, res) => {
  try {
    const result = await db.shapes.create(req.body);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

async function deletedShapes() {
  const today = new Date();
  const updateDeleteDate = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  return new Promise(async (resolve, reject) => {
    try {
      await db.shapes.destroy({
        where: {
          updated_at: {
            [Op.lt]: updateDeleteDate,
          },
        },
      });
      resolve("deleted");
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = router;
