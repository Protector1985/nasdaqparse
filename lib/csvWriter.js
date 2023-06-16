const createCsvWriter = require('csv-writer').createObjectCsvWriter;


function csvWriter(mostRecentHalt) {
    
    const csvWriter = createCsvWriter({
      path: 'out.csv',
      header: [
        {id: 'haltTime', title: 'Halt Time'},
        {id: 'issueSymbol', title: 'Issue Symbol'},
        {id: 'issueName', title: 'Issue Name'},
        {id: 'currentTime', title: 'Current Time'}
      ]
    });
  
    const record = {
      haltTime: mostRecentHalt[0],
      issueSymbol: mostRecentHalt[1],
      issueName: mostRecentHalt[2],
      currentTime: mostRecentHalt[3]
    };
  
    csvWriter
      .writeRecords([record])  // Pass array with only one record
      .then(() => console.log('The CSV file was written successfully'));
  }

  module.exports = csvWriter