const express = require('express')
const axios = require('axios');
const app = express();


const cron = require('node-cron');
const google = require('googleapis').google;
const xml2js = require('xml2js');

const measureExecutionTime = require('./lib/executionTime');
const processHalt = require('./lib/processHalt');


const auth = new google.auth.GoogleAuth({
    keyFile: './key.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });



  
  function parseHalts(xmlString, spreadsheetId) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(xmlString, (err, result) => {
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

        const mostRecentHalt = halts[0];  // assuming that the first item is the most recent
       
        processHalt(mostRecentHalt)
        
      }
    });
  });
}
// Usage example
measureExecutionTime

let successfulFetches = 0;

cron.schedule('*/3 * * * * *', async() => {
    const response = await axios.get("http://www.nasdaqtrader.com/rss.aspx?feed=tradehalts");
    console.log('Running task...');
    
   
    await parseHalts(response.data)
    
  
    
    successfulFetches++
    console.log("---------------SuccessfulFetches: "  + successfulFetches)
});
  
app.listen("5001", () => {
    console.log("App running on 5000")
})

