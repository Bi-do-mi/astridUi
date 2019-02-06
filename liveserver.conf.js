var fs = require("fs");

module.exports = {
  cert: fs.readFileSync("open-ssl/server.crt"),
  key: fs.readFileSync("open-ssl/server.key"),
  passphrase: "12345"
};
