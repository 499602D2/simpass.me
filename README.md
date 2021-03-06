# simpass.me: simple password generation locally

~~The application is currently hosted at https://simpass.me.~~

![preview](site.png)

### Security

All passwords are generated entirely on-device, with nothing sent back to the server.

Password generation is performed with the excellent [crypto-random-string](https://github.com/sindresorhus/crypto-random-string) module, which provides a simple interface for generating cryptographically secure random strings with the help of Javascript's `crypto` module.

### What is bundle.js?

`bundle.js` has been generated with [browserify](https://github.com/browserify/browserify). `scripts.js` is the "base file", which browserify turns into a servable bundle, which is then shaken with [common-shakeify](https://github.com/browserify/common-shakeify) to remove unused code. The full command is `browserify -p common-shakeify`. This file is then minified.

The full process can be copied by simply running the `pre-deploy.py` script: this generates a .zip archive of the contents, which can be simply thrown into AWS EB, assuming a config has been setup first. This can be done by running `application.py` manually once.

### Minification

The domain serves extremely minified versions of the files found in this repository. The served `bundle.js` file has been minified with [babel-minify](https://github.com/babel/minify/tree/master/packages/babel-minify). Hash of the served JS file (`bundle.min.js`) can be found in the footer of the page, and is recalculated on each request: you can verify that they are equal by either trusting the backend and that the hashes listed here are valid, or performing a direct comparison of the checksums yourself.

Current bundle.min.js MD5 checksum: `454ce512b504c80d4f0334e0386959e8`
