const express = require('express')
const cors = require('cors');
const tagRouter = require('./router/tagRouter');
const editorRouter = require('./router/editorRouter');
const userRouter = require('./router/userRouter');
require('dotenv').config();
require('./mongoose')

// const http = require("http")
const http = require("http");
// const https = require('https')
// const io = require('socket.io')



const app = express()
const PORT = process.env.PORT || 4200
// const PORT = 4200
const server = http.createServer(app)
// const ssl = https.createServer(app)

const corsOptions = {
    // origin: 'http://localhost:3000',
    origin: '*',
    optionsSuccessStatus: 200 //
    //some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(express.json())
app.use(cors(corsOptions))
app.use(editorRouter)
app.use(tagRouter)
app.use(userRouter)
// server.listen(4200)

// io.listen(server);
app.listen(PORT, () => {
    console.log(`server started at port ${PORT}`)
})