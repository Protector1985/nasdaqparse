const express = require('express')
const axios = require('axios');
const app = express();
const { HttpProxyAgent } = require('http-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

const cron = require('node-cron');
const google = require('googleapis').google;
const xml2js = require('xml2js');
const csvWriter = require('./lib/csvWriter')
const { parse, stringify } = require('csv');
const processHalt = require('./lib/processHalt');
const csvReader = require('./lib/csvReader');


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



function convertArrayToCSV(data) {
  console.log(data)
  return new Promise((resolve, reject) => {
    stringify(data, (err, csvString) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(csvString);
    });
  });
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
          currentTime.toISOString(),  // adding the current time to each row
        ]));

        const storedHalt = result.rss.channel.item.map(item => ([
          item['ndaq:HaltTime'],
          item['ndaq:IssueSymbol'],
          item['ndaq:IssueName'],
        
        ]));

        const mostRecentHalt = halts[0];  // assuming that the first item is the most recent
        csvWriter(storedHalt[0])
        processHalt(mostRecentHalt)

        const csv = await csvReader()
        
        
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

