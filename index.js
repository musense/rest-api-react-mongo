const express = require('express')
const cors = require('cors');
const tagRouter = require('./router/tagRouter');
require('./mongoose')

// const http = require("http")
const http = require("http");
// const https = require('https')
// const io = require('socket.io')



const app = express()
// const PORT = proccess.env.PORT || 3000
const PORT = 4200
const server = http.createServer(app)
// const ssl = https.createServer(app)

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 //
    //some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(express.json())
app.use(cors(corsOptions))
app.use(tagRouter)
// server.listen(4200)

// io.listen(server);
app.listen(PORT, (a, b, c, d) => {
    console.log(`server started at port ${PORT}`)
})