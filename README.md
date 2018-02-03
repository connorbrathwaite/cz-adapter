# cz-adapter

[![NPM version](https://img.shields.io/npm/v/standard-version.svg)](https://www.npmjs.com/package/@connorbrathwaite/cz-adapter) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/connorbrathwaite/cz-adapter) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

## setup

1. install this adapter
```sh
yarn add -D @connorbrathwaite/cz-adapter
```

2. reference it in your `.cz.json` of your project
```json
{
  "path": "node_modules/cz-adapter/"
}
```

## usage

`git add .`

`git cz` instead of `git commit`

## versioning

projects following the adapter's conventions may produce an automated CHANGELOG.md via commitizen adapter for [standard-version](https://github.com/conventional-changelog/standard-version).
