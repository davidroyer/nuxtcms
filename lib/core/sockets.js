/* eslint-disable no-console */
import http from 'http'
import fs from 'fs'
import socketIO from 'socket.io'

module.exports = function () {
  if (!this.options.dev) return

  if (this.options.dev) {
    console.log('From io/index.js - In DEV mode')
    const server = http.createServer(this.nuxt.renderer.app)
    const io = socketIO(server)

    // overwrite nuxt.server.listen()
    this.nuxt.server.listen = (port, host) =>
      new Promise(resolve =>
        server.listen(port || 3000, host || 'localhost', resolve)
      )

    // close this server on 'close' event
    this.nuxt.hook('close', () => new Promise(server.close))

    io.on('connection', (socket) => {
      socket.on('get-data', function (fn) {
        // GET DATA THEN...
        // fn(data)
      })

      const data = cmsConent.getCollectionArray('articles')
      socket.emit('file-update', data)
    })
  }
}
