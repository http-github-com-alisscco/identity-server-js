const { ipcMain } = require('electron');
const debug = require('debug')('app.ipc');
const { error, ok, body } = require("./../services/express-util")('app.ipc');

class IPCResponse {
  constructor ({ event, channel, params }) {
    this.event = event;
    this.params = params;

    this.json = (obj) => {
      obj.params = this.params;
      this.event.sender.send(channel, JSON.stringify(obj));
      return this;
    };

    this.status = (code) => {
      this.statusCode = code;
      return this;
    };

    this.send = (fileBuffer) => {
      this.event.sender.send(channel, fileBuffer.toString('utf8'));
      return this;
    };
  }
};

const request = ({ method, path, callback }) => {
  const channel = `${method} ${path}`;
  ipcMain.on(channel, (event, args) => {
    debug(channel, args);
    const req = Object.assign({}, args);
    req.body = body(req);
    const res = new IPCResponse({ event, channel, params: req.params });
    const next = () => {};
    callback(req, res, next);
  });
};

module.exports = {

  get: (path, callback) => {
    request({ method: 'GET', path, callback });
  },
  
  post: (path, callback) => {
    request({ method: 'POST', path, callback });
  },

  delete: (path, callback) => {
    request({ method: 'DELETE', path, callback });
  },

  listen: () => {
    // Empty method for compatibility with Express only
  },
};