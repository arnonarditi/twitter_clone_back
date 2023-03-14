const logger = require('./logger.service')
const codeService = require('../api/code/code.service')

var gIo = null

function setupSocketAPI(http) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {

        logger.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })

        socket.on('code-set-topic', topic => {
            if (socket.myTopic === topic) return
            if (socket.myTopic) {
                // leaving his prv room--socket still got topic as a key
                socket.leave(socket.myTopic)
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`)

                if (socket.isMentor) socket.isMentor = null
                logger.info('Mentor left his prv room and joining to new room')
            }

            socket.join(topic)
            socket.myTopic = topic
            // NOTE try to Opitimize http req 25/1-->12:32 pm
            // socket.emit('set-socketId', socket.id)
        })

        socket.on('load-code', codeId => {
            // broadcast && specific room, the trigger socket is updated by front exclusively
            socket.broadcast.to(socket.myTopic).emit('load-code', codeId)
        })

        socket.on('check-is-mentor', () => {
            // when mentor has left the page and now back && 
            // isn't get into another code block
            if (socket.isMentor) {
                socket.emit('check-is-mentor', true)
            } else {
                const room = socket.myTopic
                const map = gIo.sockets.adapter.rooms

                if (map.get(room).size === 1) {
                    socket.isMentor = true
                    socket.emit('check-is-mentor', true)
                } else {
                    socket.emit('check-is-mentor', false)
                }
            }
        })
        socket.on('check-is-last', code => {
            const room = socket.myTopic
            const map = gIo.sockets.adapter.rooms
            // when is not the mentor
            if (!socket.isMentor) {
                socket.leave(socket.myTopic)
                socket.myTopic = null
                // if the mentor has changed to another room being the mentor-
                // and stopped the room empty --> zeroing code for next attempts
                if (!map.get(room)) {
                    code.code = 'function func(args){}'
                    codeService.update(code)
                    logger.info(`[room: ${room}] is empty and without mentor---> zeroing code`)
                }
            }
            // the mentor leaving --> check if he's the last one
            else if (map.get(room).size === 1) {
                code.code = 'function func(args){}'
                codeService.update(code)
                logger.info(`[room: ${room}]  is empty from users and mentor left the room---> zeroing code`)
            }
        })
        socket.on('success-msg', () => {
            gIo.to(socket.myTopic).emit('success-msg')
        })
    })
}

// NOTE try to Opitimize http req 25/1-->12:32 pm
// async function customBroadcast({ type, data, socketId }) {
//     const excludedSocket = await _getExcludedSocket(socketId)
//     const room = excludedSocket.myTopic
//     excludedSocket.broadcast.to(room).emit(type, data)
// }
// 
// async function _getExcludedSocket(socketId) {
//     const sockets = await gIo.fetchSockets()
//     const socket = sockets.find(s => s.id === socketId)
//     return socket
// }

module.exports = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // customBroadcast
}
