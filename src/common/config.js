import fs from 'fs';
import https from 'https';
const options = {
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt')
};
const app = (callback, port, host, think) => {
  const server = https.createServer(options, callback);
  server.listen(port, host);
  return server;
};
export default {
  create_server: app
};
