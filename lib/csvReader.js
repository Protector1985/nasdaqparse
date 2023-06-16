const fs = require('fs');

function csvReader() {
  return new Promise((resolve, reject) => {
    fs.readFile('./out.csv', 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(data);
    });
  });
}



  module.exports = csvReader;