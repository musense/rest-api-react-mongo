const express = require("express");
const cors = require("cors");
const sitemapRouter = require("./router/sitemapRouter");
const tagRouter = require("./router/tagRouter");
const editorRouter = require("./router/editorRouter");
const userRouter = require("./router/userRouter");
const categoryRouter = require("./router/categoryRouter");
require("dotenv").config();
require("./mongoose");
const session = require("express-session");
const fs = require("fs");
const https = require("https");
// const io = require('socket.io')

const app = express();
const PORT = process.env.PORT || 4200;
// const CorsOrgin
// const corsOrgin = process.env.CORS_STR || "http://localhost:3000";
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

function getClientInfo(req) {
  const clientInfo = {
    http_client_ip: req.headers["http_client_ip"] || null,
    http_x_forwarded_for: req.headers["x-forwarded-for"] || null,
    http_x_forwarded: req.headers["x-forwarded"] || null,
    http_x_cluster_client_ip: req.headers["x-cluster-client-ip"] || null,
    http_forwarded_for: req.headers["forwarded-for"] || null,
    http_forwarded: req.headers["forwarded"] || null,
    remote_addr: req.connection.remoteAddress || null,
    http_via: req.headers["via"] || null,
  };

  return clientInfo;
}

function logUserActivity(req, res, next) {
  const method = req.method;

  const allowedMethods = ["PUT", "POST", "PATCH", "DELETE"];

  if (allowedMethods.includes(method)) {
    const clientInfo = getClientInfo(req);
    const logMessage = `${method} request at ${
      req.originalUrl
    } with client info: ${JSON.stringify(
      clientInfo
    )} at ${new Date().toISOString()}\n`;
    fs.appendFile("user_activity_log.txt", logMessage, (err) => {
      if (err) {
        console.error("Error writing to log file:", err);
      }
    });

    next();
  } else {
    next(); // Make sure to call next() for methods not in allowedMethods
  }
}

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

app.use(logUserActivity);
app.use(sitemapRouter);
app.use(userRouter);
app.use(editorRouter, verifyUser);
app.use(tagRouter, verifyUser);
app.use(categoryRouter, verifyUser);

// server.listen(4200)
ssl.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

// io.listen(server);
