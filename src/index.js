const http = require('http')
const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users.js')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

//Server Start
const port = process.env.PORT || 3000

const pubDir = path.join(__dirname, '../public')
const templates = path.join(__dirname, '../templates/views')

app.use(express.static(pubDir))
 
let count = 0

//Socket Broadcasts:
//socket.emit()         ~~~~    server  ->  Specific client
//io.emit()             ~~~~    client/server ->all clients
//socket.broadcast.emit()~~~    client -> all other clients
//io.to.emit()          ~~~~    client(inRoom) -> all clients(in room)

io.on('connection', (socket) => {
    console.log('new websocket connection')
    //introduction


    socket.on('increment' , (callback) => {
        count++
        io.emit('countUpdated', count)
        callback()
    })

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})
        
        if (error) {
            return callback(error)
        }
        
        socket.join(user.room)

        socket.emit('sendMessage', generateMessage(`Welcome to Room: ${user.room}!`))
        socket.broadcast.to(user.room).emit('sendMessage', generateMessage('System:', `${user.username} has joined room ${user.room}!`))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage' , (message, callback) => {
        const user = getUser(socket.id)
        //console.log(user.room)
        const filter = new Filter()
        if ( filter.isProfane(message) ) {
            return callback('profanity is not allowed')
        }
        //socket.emit('sendMessage', generateMessage(message))
        io.to(user.room).emit('sendMessage', generateMessage(user.username, message))
        callback('message sent')
    })

    socket.on('sendLocation' , (url, callback) => {
        const user = getUser(socket.id)
        io.to(getUser(socket.id).room).emit('locationMessage', generateLocationMessage(user.username, url))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('sendMessage', generateMessage('System:', `${user.username} has left the room.`))
        }
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        
    })
})

server.listen(port, () => {
    console.log('Chat running. port: ' , port)
})
