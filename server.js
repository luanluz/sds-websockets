const express = require('express')
const http = require('http')
const { Server: serverSocket } = require('socket.io')
const { log } = require('./utils')

const PORT = 3000
const messageEvent = 'message'

const app = express()
const server = http.createServer(app)
const io = new serverSocket(server)

// set public path
app.use(express.static('public'))

// routes
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

// wait for socket connection
io.on('connect', socket => {
    log(`client ${socket.id} connected from ${socket.client.conn.remoteAddress}`)

    socket.on(messageEvent, message => {
        log(message)
        io.emit(messageEvent, message)
    })
})

// start server
server.listen(PORT, () => log(`server listening on port: ${PORT}`))
