jest.setTimeout(60000)
// process.env.PORT = process.env.PORT || 5060

const { Nuxt, Builder } = require('nuxt-edge')
const request = require('request-promise-native')
const getPort = require('get-port')

const config = require('../example/nuxt.config')
// config.dev = false

let nuxt, port

const url = path => `http://localhost:${port}${path}`
const get = path => request(url(path))

describe('basic', () => {
  beforeAll(async () => {
    // eslint-disable-next-line no-console
    console.log('INSIDE beforeAll')

    nuxt = new Nuxt(config)
    await nuxt.ready()
    await new Builder(nuxt).build()
    port = await getPort()

    // eslint-disable-next-line no-console
    console.log('TCL: port', port)
    await nuxt.listen(port)

    // config.dev = false
    // nuxt = new Nuxt(config)
    // await new Builder(nuxt).build()
    // await nuxt.listen(process.env.PORT)
  })

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', async () => {
    const html = await get('/test')
    expect(html).toContain('Works!')
  })
})
