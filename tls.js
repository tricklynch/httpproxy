const tls = require('tls')

const server = tls.createServer()

server.on('newSession', (id, data, cb) => {
    console.log(id.toString())
})

server.listen(3000, () => console.log('listening'))