import cluster from 'cluster';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { promises as fsPromise } from 'fs';
import csv from 'csv-parser';

interface IFilesPathObject {
  [key: number]: string[]
}
interface IMessage {
  csvFileArray: string[]
  jsonFile: string
}
interface IJsonData {
  count: number,
  duration: string
}
async function parserFunction(dirPath: string): Promise<void> {
  if (cluster.isPrimary) {
    const pathToConvert = './converted';
    const csvDirectory = dirPath;

    if (!csvDirectory) {
      console.error('Invalid Directory Input');
      process.exit(1);
    }

    try {
      await fsPromise.access(csvDirectory);
    } catch (err) {
      console.error('Directory doesn\'t exist');
      process.exit(1);
    }

    try {
      await fsPromise.mkdir(pathToConvert);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error('Error creating the "converted" directory:', err);
        process.exit(1);
      }
    }

    try {
      const files = await fsPromise.readdir(csvDirectory);
      const csvFiles = files.filter(file => path.extname(file) === '.csv');
      let availableCPU = os.cpus().length;
      if (availableCPU > 10) {
        availableCPU = 10;
      }

      if (csvFiles.length === 0) {
        console.log('No .csv files in the directory.');
        process.exit(0);
      }

      const filesForWorkers: IFilesPathObject = {};
      for (let i = 0; i < availableCPU; i++) {
        filesForWorkers[i] = [];
      }

      for (let i = 0; i < files.length; i++) {
        filesForWorkers[i % availableCPU].push(csvFiles[i]);
      }

      let fileCount = 0;
      const startTime = new Date().getTime();

      for (let i = 0; i < availableCPU; i++) {
        const worker = cluster.fork();
        const info = await new Promise<number>((resolve, reject) => {
          worker.on('message', message => {
            if (message === 'ready') {
              const pathsForWorker = filesForWorkers[i].filter(elem => elem);
              worker.send({
                csvFileArray: pathsForWorker,
                jsonFile: 'converted/mock.json'
              });
            } else {
              resolve(message.count);
            }
          });
          worker.on('error', reject);
        });
        fileCount += info;
      }

      cluster.on('exit', () => {
        const endTime = new Date().getTime();
        const duration = endTime - startTime;
        const jsonFilePath = path.join(pathToConvert, 'mock.json');
        const jsonData:IJsonData = {
          count: fileCount,
          duration: `${duration}ms`,
        };
        fs.writeFile(jsonFilePath, JSON.stringify(jsonData), (err) => {
          if (err) {
            console.error(`Error writing to ${jsonFilePath}:`, err);
          } else {
            console.log(`Total records: ${fileCount}`);
            console.log(`Parsing duration: ${duration}ms`);
          }
          process.exit(0);
        });
      });
    } catch (err) {
      console.error('Error reading directory:', err);
      process.exit(1);
    }
  } else {
    process.on('message', (message: IMessage) => {
      const { csvFileArray, jsonFile } = message;
      let count = 0;

      const singleParser = (index: number) => {
        fs.createReadStream(csvFileArray[index])
          .pipe(csv())
          .on('data', () => {
            count++;
          })
          .on('end', () => {
            fs.writeFile(jsonFile, JSON.stringify({ count }), (err) => {
              if (err) {
                console.error(`Error writing to ${jsonFile}:`, err);
              }
              if (index === csvFileArray.length - 1) {
                process.send({ count });
                process.exit(0);
              } else {
                process.send({ count });
              }
            });
          });
      };

      for (let i = 0; i < csvFileArray.length; i++) {
        singleParser(i);
      }
    });
    process.send('ready');
  }
}

 export default parserFunction;
