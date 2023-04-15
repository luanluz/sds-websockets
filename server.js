const express = require('express')
const http = require('http')
const { Server: serverSocket } = require('socket.io')
const { log } = require('./utils')

const PORT = 3000
const messageEvent = 'message'
const userEvent = 'user'
const users = []

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

    socket.on(userEvent, user => {
        const loggedUser = {id: socket.id, username: user}

        users.push(loggedUser)
        socket.emit(userEvent, loggedUser)
    })

    socket.on(messageEvent, message => {
        const currentUser = users.find(user => user.id === socket.id)

        io.emit(messageEvent, {sender: currentUser, message, sentAt: new Date().toLocaleTimeString()})
    })

    socket.on('disconnect', () => {
        const disconnectedUser = users.find(user => user.id === socket.id) ?? {}
        const userPosition = users.indexOf(disconnectedUser)

        users.splice(userPosition, 1)
        log(`${disconnectedUser.username ?? 'user'} disconnected`)
    })
})

// start server
server.listen(PORT, () => log(`server listening on port: ${PORT}`))
