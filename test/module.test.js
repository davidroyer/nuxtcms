const path = require('path')
const { Nuxt } = require('nuxt-edge')
const request = require('request-promise-native')

const url = path => `http://localhost:3000${path}`
const get = path => request(url(path))

describe('basic', () => {
  let nuxt

  test('start', async () => {
    nuxt = new Nuxt({
      rootDir: path.resolve(__dirname, '..', 'example')
    })
    await nuxt.listen(3000)
  })

  afterAll(async () => {
    await nuxt.close()
  })

  test('render', async () => {
    const html = await get('/test')
    expect(html).toContain('Works!')
  })
})
