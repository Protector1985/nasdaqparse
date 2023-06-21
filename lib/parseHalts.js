require("dotenv").config();
const axios = require("axios");
const xml2js = require("xml2js");
const csvWriter = require("./csvWriter");

const csvReader = require("./csvReader");
const moment = require("moment");
const returnMessage = require('./returnMessage')




function parseHalts(xmlString, eventEmitter, fs) {
  try {
    return new Promise((resolve, reject) => {
      const parser = new xml2js.Parser({ explicitArray: false });

      // parses the raw data from the nasdaq query.
      parser.parseString(xmlString, async (err, result) => {
        if (err) {
          reject(err);
        } else {
          const currentTime = new Date();
          // result from the callback creates structured data
          const halts = result.rss.channel.item.map((item) => [
            item["ndaq:HaltTime"],
            item["ndaq:IssueSymbol"],
            item["ndaq:IssueName"],
            item["ndaq:ResumptionDate"],
            item["ndaq:ResumptionQuoteTime"],
            item["ndaq:ResumptionTradeTime"],
            item["ndaq:ReasonCode"],
            returnMessage(item["ndaq:ReasonCode"]),
            // adds the server time in EST (trading time) for internal tracking
            moment().format("YYYY-MM-DD HH:mm:ss"), // adding the current time to each row
          ]);

          const mostRecentHalt = halts[0]; // assuming that the first item is the most recent
          const storedData = await csvReader(fs);
          console.log(mostRecentHalt)
          // parses the most current incoming data to compare against the stored csv string
          // if the data is different then a webhook will be triggered notifying the frontend
          const string =
          mostRecentHalt[0] + mostRecentHalt[1] + mostRecentHalt[5];
          const record = [string.replace(/\s/g, " ")];
          const currentData = record.join(",");

          // compares current data against the data stored in out.csv.
          // fires if data changed  = new halt or resume
          if (currentData !== storedData) {
            eventEmitter.emit("halt", [[],[],[],[mostRecentHalt[1], 'halt', mostRecentHalt[6]]])
            eventEmitter.emit("haltData", ["HALT", ...mostRecentHalt])
            
            if (mostRecentHalt[5].length > 3) {
              eventEmitter.emit([[],[],[],[mostRecentHalt[1], 'resume', mostRecentHalt[6],mostRecentHalt[5]]])
              eventEmitter.emit("haltData", ["RESUME", ...mostRecentHalt])
            }
          }

            //* DEV ONLY - adds data to spredsheet in google
            // processHalt(mostRecentHalt, "TRADING STOPPED");

          
          // writes the new halt into CSV for comparison.
          csvWriter(halts[0],fs);
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = parseHalts;
