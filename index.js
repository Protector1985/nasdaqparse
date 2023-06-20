require("dotenv").config();

const parseHalts = require("./lib/parseHalts");
const http = require("http");
const socketio = require("socket.io");

const express = require("express");
const axios = require("axios");
const app = express();
const { HttpProxyAgent } = require("http-proxy-agent");
const { HttpsProxyAgent } = require("https-proxy-agent");
const moment = require("moment-timezone");
const cron = require("node-cron");
const google = require("googleapis").google;

const cors = require('cors');



// sets trading timezone!
moment.tz.setDefault("America/New_York");

// frontend Event listener expects the following data: [[(4)...['METBV'(issueSymbol), 'resume/halt', 'LUDP'(reason)]] [] [] []]

const WEBAPP_SOURCE = 'https://dev.mometic.com' || "";
const httpServer = new http.Server(app);
app.use(cors({
  origin: ['https://dev.mometic.com', "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"], // specify the methods you want to allow
  credentials: true // allowing credentials, which enables cookies to be sent and received
}));

const io = new socketio.Server(httpServer, {
  cors: {
    origin: 
    [
      'https://dev.mometic.com', 
      "http://localhost:3000"
    ],
    methods: "*",
  },
});


// const connectedClients = new Map();
io.on('connect', socket => {
  socket.emit('welcome', 'Halt server connected!!!');
  
  socket.on('ping', () => {
    socket.emit('pong', 'Socket Alive');
  });

  // sets connected clients map with userId<key>, socketId<value>
  // socket.on('clientInfo', msg => {
  //   connectedClients.set(msg.email, socket.id);
  // });
});


let successfulFetches = 0;

const proxyHost = [
  // process.env.PROXY1,
  '54.174.164.37',
'3.87.0.16',
'54.164.9.245',
'44.212.44.114',
'44.201.245.233',
'34.226.202.156',
'3.82.206.53',
 
];



const proxyPort = '3128';



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
    await parseHalts(response.data, io);
  } catch (err) {
    console.log(err);
  }
});

httpServer.listen("5020", () => {
  console.log("App running on 5020");
});
