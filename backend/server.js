const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
})

io.on('connection', socket => {
    socket.emit('getClientId', socket.id)
    socket.on('typingStateclient', (state) => {
        io.emit('typingStateServer', { state, connected: socket.connected })
    })
    socket.on('messagefromclient', (data) => {
        io.emit('messagefromserver', { data, id: socket.id })
    })
})

http.listen(4000, function () {
    console.log('listening on port 4000')
})