import fs from "fs";
import csv from "csv-parser";

process.on("message", (message) => {
  const { csvFile, jsonFile } = message;
  console.log(csvFile, 'CSV FILE ')
  let count = 0;
  fs.createReadStream(csvFile)
    .pipe(csv())
    .on("data", (data) => {
      count++;
    })
    .on("end", () => {
      fs.writeFile(jsonFile, JSON.stringify({ count }), (err) => {
        if (err) {
          console.error(`Error writing to ${jsonFile}:`, err);
        }
        process.send({ count });
        process.exit(0);
      });
    });
});
