import fs from 'fs';
import { promises as fsPromises } from 'fs';
import csv from 'csv-parser';
import path from 'path';

async function parserFunction(newDirPath) {
    const pathToConvert = './converted';
    const csvDirectory = path.resolve(newDirPath);

    if (!csvDirectory) {
        console.error('Invalid Directory Input');
        process.exit(1);
    }

    try {
        await fsPromises.access(csvDirectory);
    } catch (err) {
        console.error('Directory does not exist');
        process.exit(1);
    }

    try {
        await fsPromises.mkdir(pathToConvert);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            console.error('Error creating the "converted" directory:', err);
            process.exit(1);
        }
    }

    try {
        const files = await fsPromises.readdir(csvDirectory);
        const csvFiles = files.filter((file) => path.extname(file) === '.csv');

        if (!csvFiles.length) {
            console.log('There are no .csv files in the directory');
            process.exit(1);
        }

        for (const csvFile of csvFiles) {
            const csvFilePath = path.join(csvDirectory, csvFile);
            const jsonData = await parseCSVFile(csvFilePath);
            const jsonFilePath = path.join(pathToConvert, `${path.parse(csvFile).name}.json`);
            await writeJSONFile(jsonFilePath, jsonData);
        }

        console.log('Parsing completed');
    } catch (err) {
        console.error('Error during parsing:', err);
        process.exit(1);
    }
}

async function parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
        const jsonData = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
              jsonData.push(data);
          })
          .on('end', () => {
              resolve(jsonData);
          })
          .on('error', (err) => {
              reject(err);
          });
    });
}

async function writeJSONFile(filePath, jsonData) {
    return fsPromises.writeFile(filePath, JSON.stringify(jsonData, null, 2));
}

if (process.argv.length < 3) {
    console.error('Invalid arguments. Usage: node parser.js <directory>');
    process.exit(1);
}

const directory = process.argv[2];
parserFunction(directory).then(r => console.log(r));
