const express = require("express");
const cors = require("cors");
const tagRouter = require("./router/tagRouter");
const editorRouter = require("./router/editorRouter");
const userRouter = require("./router/userRouter");
require("dotenv").config();
require("./mongoose");
const session = require("express-session");

// const https = require('https')
// const io = require('socket.io')

const app = express();
// const PORT = 4200
const PORT = process.env.PORT || 4200;
// const CorsOrgin
const corsOrgin = process.env.CORS_STR || "http://localhost:3000";
// const ssl
// const ssl = https.createServer(app);

const corsOptions = {
  origin: corsOrgin,
  optionsSuccessStatus: 200, //
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
      secure: false, //if set true only excute on https
      // path: userRouter,
      // maxAge: new Date(253402300000000), // Approximately Friday, 31 Dec 9999 23:59:59 GMT
      expires: 1800000,
    },
    maxAge: 1800000, // Approximately Friday, 31 Dec 9999 23:59:59 GMT
    saveUninitialized: false,
    resave: false, //avoid server race condition
    // store: MongoStore.create({ mongoUrl: process.env.CON_STR }),
  })
);

//set session verify
const verifyUser = (req, res, next) => {
  if (req.session.isVerified) {
    next();
  } else {
    return res.status(404).json({ message: "Please login first" });
  }
};

app.use(userRouter);
app.use(verifyUser, editorRouter);
app.use(verifyUser, tagRouter);

// server.listen(4200)
app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

// io.listen(server);
