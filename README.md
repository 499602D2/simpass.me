### simpass.me: simple password management and generation locally


### Security

All passwords are generated entirely on-device, with nothing sent back to the server.

Password generation is performed with the excellent [crypto-random-string](https://github.com/sindresorhus/crypto-random-string) module, which provides a simple interface for generating cryptographically secure random strings with the help of Javascript's `crypto` module.

### Minification

The domain serves extremely minified versions of the files found in this repository. The served `bundle.js` file has been minified with https://jscompress.com: you can verify that they are equal by performing a direct comparison, or trusting the hashes listed here. Hash of the served JS file can be found in the footer of the page, and is calculated for each request.


### To-do

- include checksum of bundle.js in footer: calculate in backend -> inject

- add a tiny settings menu
  - remember preferences
  - light/dark theme toggle
  - hide generator output
