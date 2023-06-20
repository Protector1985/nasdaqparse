const fs = require("fs");

function csvReader() {
  return new Promise((resolve, reject) => {
    fs.readFile("./out.csv", "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // removes all white pace and extra lines from string to compare it against current
      resolve(data.trim());
    });
  });
}

module.exports = csvReader;
