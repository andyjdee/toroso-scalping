import {config} from './configuration/fxcm.config';
import HttpsClient from './clients/HttpsClient';

/*
 * Const qString = require('querystring');
 */

const client = new HttpsClient(config);
client.authenticate();

const getInstruments = async () => {
  let response = {};
  const options = {
    path       : '/trading/get_instruments',
    method     : 'GET',
    parameters : ''
  };

  response = await client.processRequest(options, data => {
    const retData = JSON.parse(data);

    return retData;
  });

  return response;
};

getInstruments();
