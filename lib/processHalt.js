const google = require("googleapis").google;
const sheets = google.sheets({ version: "v4" });
const auth = new google.auth.GoogleAuth({
  keyFile: "./key.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

let counter = 0;

async function processHalt(mostRecentHalt, type) {
  const mutatedHalt = [type, ...mostRecentHalt];

  try {
    const client = await auth.getClient();

    // Increment counter
    counter++;

    const requests = [
      // Insert a new row at the top
      {
        insertRange: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          shiftDimension: "ROWS",
        },
      },
      // Set the values in the new row
      {
        updateCells: {
          start: {
            sheetId: 0,
            rowIndex: 0,
            columnIndex: 0,
          },
          rows: [
            {
              values: mutatedHalt.map((item) => ({
                userEnteredValue: { stringValue: item.toString() },
              })),
            },
          ],
          fields: "userEnteredValue",
        },
      },
    ];

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: "1u_GYd79WiaMhFdg3-2RkgILg_v6AOv8d6S6DzHrcQZU",
      auth: client,
      requestBody: {
        requests,
      },
    });

    console.log("Written halt to Google Sheets successfully.");
    return response;
  } catch (err) {
    console.error("An error occurred:", err);
  }
}

module.exports = processHalt;
