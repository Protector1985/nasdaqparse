const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs')

function csvWriter(mostRecentHalt) {
  const csvWriter = createCsvWriter({
    path: 'out.csv',
  });
  
  if (!Array.isArray(mostRecentHalt) || mostRecentHalt.length < 3) {
    console.log('Invalid input. Please provide an array with at least 3 elements.');
    return;
  }
  
  const string = mostRecentHalt[0] + mostRecentHalt[1] + mostRecentHalt[3] ;
  const record = [string.replace(/\s/g, " ")];
  
  const csvData = record.join(',');
  
  fs.writeFile('out.csv', csvData, (err) => {
    if (err) {
      console.error('Error writing CSV file:', err);
      return;
    }
    return csvData
  });
}

  module.exports = csvWriter