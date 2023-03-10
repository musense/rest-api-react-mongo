const express = require("express");
const cors = require("cors");
const tagRouter = require("./router/tagRouter");
const editorRouter = require("./router/editorRouter");
const userRouter = require("./router/userRouter");
require("dotenv").config();
require("./mongoose");
const session = require("express-session");
const fs = require("fs");
const https = require("https");
// const io = require('socket.io')

const app = express();
// const PORT = 4200
const PORT = process.env.PORT || 4200;
// const CorsOrgin
// const corsOrgin = process.env.CORS_STR || "http://localhost:3000";
// const ssl
const ssl = https.createServer(
  {
    key: fs.readFileSync("/etc/letsencrypt/live/bd.kashinobi.com/privkey.pem", {
      encoding: "utf8",
    }),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/bd.kashinobi.com/fullchain.pem",
      { encoding: "utf8" }
    ),
  },
  app
);

const corsOptions = {
  origin: ["https://www.kashinobi.com", "https://bp.kashinobi.com"],
  optionsSuccessStatus: 200, //
  credentials: true,
  // methods: ["GET", "POST", "PUT", "DELETE"],
  //some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json());
app.use(cors(corsOptions));

//set session attribute
app.use(
  session({
    secret: process.env.SESSIONSECRETKEY,
    // secret: crypto.randomUUID(),
    name: "sid", // optional
    cookie: {
      secure: true, //if set true only excute on https
      // path: userRouter,
      // maxAge: new Date(253402300000000), // Approximately Friday, 31 Dec 9999 23:59:59 GMT
      httpOnly: true,
      domain: ".kashinobi.com",
      expires: 1800000,
    },
    maxAge: 1800000, // Approximately Friday, 31 Dec 9999 23:59:59 GMT
    saveUninitialized: false,
    resave: false, //avoid server race condition
    // store: MongoStore.create({ mongoUrl: process.env.CON_STR }),
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Origin",
    "https://www.kashinobi.com",
    "https://bp.dashboard.kashinobi.com"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

//set session verify
const verifyUser = (req, res, next) => {
  if (req.session.isVerified) {
    next();
  } else {
    return res.status(404).json({ message: "Please login first" });
  }
};

app.use(userRouter);
app.use(editorRouter, verifyUser);
app.use(tagRouter, verifyUser);

// server.listen(4200)
ssl.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

// io.listen(server);
