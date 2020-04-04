const http = require('http')
const url = require('url')

const DEBUG = false

function debug_print(msg) {
    if(DEBUG) debug_print(msg)
}

const proxy = new http.Server()

proxy.on('connection', client_sock => {
    client_sock.on('error', debug_print)
    const server_agent = new http.Agent()
    client_sock.on('data', client_data => {
        const client_request = client_data.toString('ascii')
        debug_print(`${+new Date()}\nc>p ${client_request.replace(/\n/g, '\nc>p ')}`)
        const match = /([^\s]+) ([^\s]+) ([^\s]+)/.exec(client_request)
        // TODO Figure out if this is the right way to handle CONNECT
        if('CONNECT' === match[1]) {
            if(client_sock.writable) {
                client_sock.end(`${match[3]} 200 OK\r\n\r\n`)
            }
            return
        }
        const req_url = url.parse(match[2])
        // Port and host are required to create a connection
        // Gets around a bug(?) in URL module
        // When there's a port but no protocol,
        // the protocol is the hostname
        // the hostname is the port
        const port = null === req_url.port
            ? 'http:' === req_url.protocol
                ? 80
                : 443
            : req_url.port
        const host = req_url.href.startsWith('http')
            ? req_url.hostname
            : req_url.protocol.slice(0, req_url.protocol.length - 1)
        const server_sock = server_agent.createConnection(port, host)
        server_sock.on('error', debug_print)
        // Forward the server's response to the client
        server_sock.on('data', server_data => {
            debug_print(`${+new Date()}\ns>p ${server_data.toString('ascii').replace(/\n/g, '\ns>p ')}`)
            if(client_sock.writable) {
                debug_print(`${+new Date()}\np>c ${server_data.toString('ascii').replace(/\n/g, '\np>c ')}`)
                client_sock.write(server_data)
            }
        })
        const path = url.parse(match[2]).path || '/'
        const server_request = client_request.replace(
            /[A-Z]+ [^ ]+ HTTP\/\d\.\d/,
            `${match[1]} ${path} ${match[3]}`
        ).replace(/Proxy-Connection: .*\r\n/, '')
        // Forward the client's request to the server
        if(server_sock.writable) {
            debug_print(`${+new Date()}\np>s ${server_request.replace(/\n/g, '\np>s ')}`)
            server_sock.write(Buffer.from(server_request))
        }
    })
})

proxy.on('error', debug_print)

proxy.listen(8080, '0.0.0.0')