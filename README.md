# @mntm/vkui-builder [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/maxi-team/vkui-builder/blob/master/LICENSE) [![build](https://github.com/mntm-lib/vkui-builder/actions/workflows/build.yml/badge.svg)](https://github.com/mntm-lib/vkui-builder/actions/workflows/build.yml)

**Docs:** RU | EN

Enhanced component library builder.

## Differences

- ES2018 for esm modules
- node12 for cjs modules
- Unprefixed css
- Minified source
- Faster load

## Prebuilt package

The prebuilt package is published in npm along with the release of the original package using GitHub Actions.

We recommend to use [yarn](https://classic.yarnpkg.com/en/docs/install/) for dependency management:

```shell
yarn add @mntm/vkui
```

## Getting started

Importing styles:

```css
@import '@mntm/vkui/dist/styles/themes.css';
@import '@mntm/vkui/dist/styles/components.css';
```

Individual CommonJS modules exported from `/dist/node`, for example:

```js
const Alert = require('@mntm/vkui/dist/node/components/Alert');
```

## Installation

We recommend to use [yarn](https://classic.yarnpkg.com/en/docs/install/) for dependency management:

```shell
yarn add @mntm/vkui-builder
```

After installing you can build your version locally:

```shell
yarn run vkui-builder
```

## License

@mntm/vkui-builder is [MIT licensed](./LICENSE).
