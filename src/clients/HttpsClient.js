import {REQUEST_METHODS} from '../constants/Web';

const ioClient = require('socket.io-client');
const https = require('https');
const qString = require('querystring');

const getNextRequestId = id => id + 1;

class HttpsClient {
  socket = null;

  globalRequestId = 1;

  headers = {
    'User-Agent'   : 'request',
    'Content-Type' : 'application/x-www-form-urlencoded',
    Accept         : 'application/json'
  };

  constructor (config) {
    this.apiToken = config.token;
    this.apiHost = config.tradingApiHost;
    this.apiPort = config.tradingApiPort;
  }

  authenticate () {
    this.socket = ioClient('https://'.concat(this.apiHost, ':', this.apiPort), {
      query : qString.stringify({
        access_token : this.apiToken
      })
    });

    this.socket.on('connect', () => {
      this.headers.Authorization = `Bearer ${this.socket.id}${this.apiToken}`;
    });

    this.socket.on('connect_error', error => {
      throw new Error(`Socket.IO session connect error: ${error}`);
    });

    this.socket.on('error', error => {
      throw new Error(`'Socket.IO session error: '${error}`);
    });

    this.socket.on('disconnect', () => {
      process.exit(-1);
    });
  }

  processRequest (options, onEndFunction) {
    this.globalRequestId = getNextRequestId(this.globalRequestId);
    options.headers = this.headers;

    return new Promise((resolve, reject) => {
      let data = '';
      const request = https.request(options, response => {
        response.on('data', chunk => {
          data = data.concat(chunk);
        });
        response.on('end', () => {
          resolve(onEndFunction(data));
        });
        response.on('error', error => {
          reject(new Error(`Request #${this.globalRequestId} execution error: ${error}`));
        });
      }).on('error', error => {
        reject(new Error(`Request #${this.globalRequestId} execution error: ${error}`));
      });

      if (options.method !== REQUEST_METHODS.GET) {
        request.write(options.parameters);
      }
      request.end();
    });
  }
}

export default HttpsClient;
