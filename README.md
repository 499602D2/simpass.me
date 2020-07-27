# simpass.me: simple password management and generation locally


### Security

All passwords are generated entirely on-device, with nothing sent back to the server.

Password generation is performed with the excellent [crypto-random-string](https://github.com/sindresorhus/crypto-random-string) module, which provides a simple interface for generating cryptographically secure random strings with the help of Javascript's `crypto` module.

### What is bundle.js?

`bundle.js` has been generated with [browserify](https://github.com/browserify/browserify). `scripts.js` is the "base file", which browserify turns into a servable bundle. This file is then minified.

### Minification

The domain serves extremely minified versions of the files found in this repository. The served `bundle.js` file has been minified with https://jscompress.com. Hash of the served JS file (`bundle.min.js`) can be found in the footer of the page, and is recalculated on each request: you can verify that they are equal by either trusting the backend and that hashes listed here are valid, or performing a direct comparison yourself.

Current bundle.min.js MD5 checksum: `dd27d05df1cc3b0c8d4cceef7b988014`
