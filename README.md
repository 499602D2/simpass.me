### simpass.me: simple password management and generation locally


### security

All passwords are generated entirely on-device, with nothing sent back to the server.

Password generation is performed with the excellent [crypto-random-string](https://github.com/sindresorhus/crypto-random-string) module, which provides a simple interface for generating cryptographically secure random strings with the help of Javascript's `crypto` module.

### to-do

- add a tiny settings menu
  - remember preferences
  - light/dark theme toggle
  - hide generator output
