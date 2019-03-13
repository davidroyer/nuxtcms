# nuxtcms

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Circle CI][circle-ci-src]][circle-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Dependencies][david-dm-src]][david-dm-href]
[![Standard JS][standard-js-src]][standard-js-href]

> CMS for Nuxt.js

[📖 **Release Notes**](./CHANGELOG.md)

## Setup

1. Add `nuxtcms` dependency with `yarn` or `npm` into your project
2. Add `nuxtcms` to `modules` section of `nuxt.config.js`
3. Configure it:

```js
{
  modules: [
    // Simple usage
    'nuxtcms',

    // With options
    ['nuxtcms', { /* module options */ }],
 ]
}
```


## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `npm run dev`

## License

[MIT License](./LICENSE)

Copyright (c) David Royer <droyer01@gmail.com>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/dt/nuxtcms.svg?style=flat-square
[npm-version-href]: https://npmjs.com/package/nuxtcms
[npm-downloads-src]: https://img.shields.io/npm/v/nuxtcms/latest.svg?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/nuxtcms
[circle-ci-src]: https://img.shields.io/circleci/project/github/davidroyer/nuxtcms.svg?style=flat-square
[circle-ci-href]: https://circleci.com/gh/davidroyer/nuxtcms
[codecov-src]: https://img.shields.io/codecov/c/github/davidroyer/nuxtcms.svg?style=flat-square
[codecov-href]: https://codecov.io/gh/davidroyer/nuxtcms
[david-dm-src]: https://david-dm.org/davidroyer/nuxtcms/status.svg?style=flat-square
[david-dm-href]: https://david-dm.org/davidroyer/nuxtcms
[standard-js-src]: https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square
[standard-js-href]: https://standardjs.com
