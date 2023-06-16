const dotenv = require('dotenv')
dotenv.config()

const http = require('http');
const socketio = require('socket.io');

const express = require('express')
const axios = require('axios');
const app = express();
const { HttpProxyAgent } = require('http-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const moment = require('moment-timezone');
const cron = require('node-cron');
const google = require('googleapis').google;
const xml2js = require('xml2js');
const csvWriter = require('./lib/csvWriter')
const { parse, stringify } = require('csv');
const processHalt = require('./lib/processHalt');
const csvReader = require('./lib/csvReader');
//trading timezone!
moment.tz.setDefault('America/New_York');

//frontend Event listener expects the following data: [[(4)...['METBV'(issueSymbol), 'resume/halt', 'LUDP'(reason)]] [] [] []]
const WEBAPP_SOURCE = process.env.WEBAPP_SOURCE || '';
const httpServer = new http.Server(app);
const io = new socketio.Server(httpServer, {
  cors: {
    origin: [...WEBAPP_SOURCE.split(","), "http://localhost:3000"],
    methods: "*"
  }
});


const auth = new google.auth.GoogleAuth({
    keyFile: './key.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  let successfulFetches = 0;

const proxyHost = [
  '54.157.104.81',
  '100.24.26.238', 
  '54.91.9.246', 
  '54.82.32.101', 
  '3.91.100.155',
  '34.226.202.156',
  '34.207.208.167'
 ]; // replace with your proxy server IP
const proxyPort = '3128'; // replace with your proxy server port, 3128 is the default Squid port

 //to compare trading resume
 //left this in memory since the stop times are short.
let currentlyHalted = { 
    issueSymbol:null,
    issueName: null,
    resumeTime:'',
 }

  
  function parseHalts(xmlString, spreadsheetId) {
  try {
    return new Promise( (resolve, reject) => {
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(xmlString, async (err, result) => {
      if (err) {
        reject(err);
      } else {
        const currentTime = new Date();
       
        const halts = result.rss.channel.item.map(item => ([
          item['ndaq:HaltTime'],
          item['ndaq:IssueSymbol'],
          item['ndaq:IssueName'],
          item['ndaq:ResumptionDate'],
          item['ndaq:ResumptionQuoteTime'],
          item['ndaq:ResumptionTradeTime'],
          item['ndaq:ReasonCode'],
          moment().format('YYYY-MM-DD HH:mm:ss'),  // adding the current time to each row
        ]));

        const storedHalt = result.rss.channel.item.map(item => ([
          item['ndaq:HaltTime'],
          item['ndaq:IssueSymbol'],
          item['ndaq:IssueName'],
          item['ndaq:ResumptionDate'],
          item['ndaq:ResumptionQuoteTime'],
          item['ndaq:ResumptionTradeTime'],
        
        ]));

        const mostRecentHalt = halts[0];  // assuming that the first item is the most recent
      
        const storedData = await csvReader()
        //parses the most current incoming data to compare against the stored csv string
        //if the data is different then a webhook will be triggered notifying the frontend
        const string = mostRecentHalt[0] + mostRecentHalt[1] + mostRecentHalt[5] ;
        const record = [string.replace(/\s/g, " ")];
        const currentData = record.join(',');
        
        if(currentData !== storedData) {
          
           if(mostRecentHalt[5].length > 3) {
            processHalt(mostRecentHalt, "TRADING RESUMED")
           
            axios.post("https://webhook.site/70774275-2c4b-498e-a304-d81fd5454fd0",{data: {
            message: "TRADING RESUMED",
            haltTime:mostRecentHalt[0],
            issueSymbol:mostRecentHalt[1],
            issueName:mostRecentHalt[2],
            resumeDate:mostRecentHalt[3],
            resumeQuoteTime:mostRecentHalt[4],
            resumeTime: mostRecentHalt[5],
            serverTime: moment().format('YYYY-MM-DD HH:mm:ss')
          }})
          }

          processHalt(mostRecentHalt, "TRADING STOPPED")
          axios.post("https://webhook.site/70774275-2c4b-498e-a304-d81fd5454fd0",{data: {
            message: "TRADING STOPPED",
            haltTime:mostRecentHalt[0],
            issueSymbol:mostRecentHalt[1],
            issueName:mostRecentHalt[2],
            resumeDate:mostRecentHalt[3],
            resumeQuoteTime:mostRecentHalt[4],
            resumeTime: mostRecentHalt[5],
            serverTime: moment().format('YYYY-MM-DD HH:mm:ss')
          }})
        }



        csvWriter(storedHalt[0])
        
       
        
        
        
       
        
        


        // const csv2 = await convertArrayToCSV(storedHalt[0])
        // console.log(csv2)
        // if(csv !== csv2) {
        //   console.log("NEW HALT!!")
        // }
        
      }
    });
  });
}catch(err) {
  console.log(err)
}
}
// Usage example




cron.schedule('*/10 * * * * *', async() => {

  successfulFetches = successfulFetches % proxyHost.length;  // wrap around to the beginning of the array
  
  const httpProxy = new HttpProxyAgent(`http://${proxyHost[successfulFetches]}:${proxyPort}`);
  const httpsProxy = new HttpsProxyAgent(`http://${proxyHost[successfulFetches]}:${proxyPort}`);
  
  
  
  // const response = await axios.get("https://api.ipify.org?format=json", {
   const response = await axios.get("http://www.nasdaqtrader.com/rss.aspx?feed=tradehalts", {
    httpAgent: httpProxy,
    httpsAgent: httpsProxy
}).catch(err => console.log(err))
    
    successfulFetches++
    await parseHalts(response.data)
  
    console.log("---------------SuccessfulFetches: "  + successfulFetches)
});
  
app.listen("5001", () => {
    console.log("App running on 5000")
})

