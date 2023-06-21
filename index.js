require("dotenv").config();
const parseHalts = require("./lib/parseHalts");
const events = require('events');
const eventEmitter = new events.EventEmitter();
const axios = require("axios");
const { HttpProxyAgent } = require("http-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");
const moment = require("moment-timezone");
const cron = require("node-cron");

function nasdaq_fetcher(proxyHostArray, proxy_port, fs ) {

moment.tz.setDefault("America/New_York");
let successfulFetches = 0;

const proxyHost = proxyHostArray

const proxyPort = proxy_port;

// scheduler runs every 10 seconds.
cron.schedule("*/10 * * * * *", async () => {
  try {
    // moving index to select proxy server
    successfulFetches = successfulFetches % proxyHost.length;

    // proxy values for axios
    const httpProxy = new HttpProxyAgent(
      `http://${proxyHost[successfulFetches]}:${proxyPort}`
    );
    const httpsProxy = new HttpsProxyAgent(
      `http://${proxyHost[successfulFetches]}:${proxyPort}`
    );

    // **DEV ONLY below tests if the proxy is utilzing different ips
    // const response = await axios.get("https://api.ipify.org?format=json", {
    // DEV ONLY**

    const response = await axios
      .get("http://www.nasdaqtrader.com/rss.aspx?feed=tradehalts", {
        httpAgent: httpProxy,
        httpsAgent: httpsProxy,
      })
      .catch((err) => console.log(err));
    
    // controls index
    successfulFetches++;

    // processes the XML data from the query
    await parseHalts(response?.data, eventEmitter, fs);
  } catch (err) {
    console.log(err);
  }
});
return eventEmitter
}

module.exports = nasdaq_fetcher


