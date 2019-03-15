version-it
==========

Query NPM for the latest version of the package in the current working directory at the current minor version.
Set the patch version to the next available value.

### Local script

##### package.json

```json
{
  "devDependencies": {
    "version-it": "^1.0.0"
  },
  "scripts": {
    "bump": "version-it"
  }
}
```

##### publish script

```shell
$ npm run bump && npm publish
incrementing version
v1.0.1
+ sweet-package@1.0.1
```

### Global script

##### publish script

```shell
$ npm install -g version-it
$ version-it && npm publish
incrementing version
v1.0.2
+ sweet-package@1.0.2
```

## Usage with release tags

If you need to increment on a particular tag, use `version-it tag` to guess which tag to use based on the version in package.json, e.g. "7.0.0-next.0" will return "next". If there is no tag found in the version, "latest" will be returned, which is the default tag. Pass this value into `npm publish`.

```shell
$ version-it && npm publish --tag "$(version-it tag)"
incrementing version
v7.0.0-next.1
+ beta-module@7.0.0-next.1
```

## Read-only command

Use `version-it peek` to print the next available version without actually writing it to the package.json file.

```shell
$ version-it peek
2.3.2
```
