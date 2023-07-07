import http from 'http';
import fsPromise from 'fs/promises';
import path from 'path';
import url from 'url';
import cluster from 'cluster';
import os from 'os';
import csv from 'csv-parser';
import fs from "fs";


const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
  'Access-Control-Max-Age': 2592000,
};

const pathToConvert = './converted';

async function parserFunction(dirPath) {

  if (cluster.isMaster) {
    console.log('log from master');
    if (!dirPath) {
      console.error('Invalid Directory Input');
      process.exit(1);
    }

    try {
      await fsPromise.access(dirPath);
    } catch (err) {
      console.error('Directory does not exist');
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
      const files = await fsPromise.readdir(dirPath);
      const csvFiles = files.filter((file) => path.extname(file) === '.csv');
      const numCPUs = os.cpus().length;
      const workerCount = Math.min(numCPUs, 10, csvFiles.length);

      if (csvFiles.length === 0) {
        console.log('No .csv files in the directory.');
        process.exit(0);
      }

      const filesForWorkers = {};
      for (let i = 0; i < workerCount; i++) {
        filesForWorkers[i] = [];
      }

      for (let i = 0; i < csvFiles.length; i++) {
        filesForWorkers[i % workerCount].push(csvFiles[i]);
      }

      let fileCount = 0;
      const startTime = new Date().getTime();

      for (let i = 0; i < workerCount; i++) {
        const worker = cluster.fork();
        const info = await new Promise((resolve, reject) => {
          worker.on('message', (message) => {
            if (message === 'ready') {
              const pathsForWorker = filesForWorkers[i].filter((elem) => elem);
              worker.send({
                csvFileArray: pathsForWorker,
                jsonFile: 'converted/mock.json',
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
        const jsonData = {
          count: fileCount,
          duration: `${duration}ms`,
        };
        fsPromise.writeFile(jsonFilePath, JSON.stringify(jsonData), (err) => {
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
    console.log('log from child');
    process.on('message', (message) => {
      const { csvFileArray, jsonFile } = message;
      let count = 0;

      const singleParser = (index) => {
        fs
          .createReadStream(csvFileArray[index])
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

async function getFileByFilename(req, res) {
  const reqUrl = url.parse(req.url, true);
  const filename = reqUrl.pathname.substring('/files/'.length);
  const ext = path.extname(filename);

  if (ext !== '.json') {
    res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Wrong File Type' }));
    return;
  }

  const fullPath = path.join(pathToConvert, filename);

  try {
    const result = await fsPromise.readFile(fullPath);
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Get Request Succeeded', data: result }));
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'File Not Found' }));
  }
}

async function getAllFiles(req, res) {
  const files = (await fsPromise.readdir(pathToConvert)).filter(
    (file) => path.extname(file) === '.json'
  );

  res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify({ message: 'Get Request Succeeded', data: files }));
}

function options(req, res) {
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
    'Access-Control-Max-Age': 2592000,
    'Content-Length': '0',
  });
  res.end();
}

function errorCase(req, res) {
  res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify({ message: 'Not Found' }));
}

function post(req, res) {
  let requestBody = '';
  req.on('data', (chunk) => {
    requestBody += chunk;
  });
  req.on('end', () => {
    let { dirPath } = JSON.parse(requestBody);
    dirPath = path.join(process.cwd(), dirPath);
    parserFunction(dirPath).then((r) => r);

    (async () => {
      try {
        res.writeHead(201, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: 'Post Request Succeeded' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: 'Bad Request' }));
      }
    })();
  });
}

async function deleteFile(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const filename = parsedUrl.pathname.substring('/files/'.length);
  const ext = path.extname(filename);

  if (ext !== '.json') {
    res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Wrong File Type' }));
    return;
  }

  const fullPath = path.join(pathToConvert, filename);

  try {
    await fsPromise.unlink(fullPath);
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Deleted' }));
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'File Not Found' }));
  }
}

const server = http.createServer(async (req, res) => {
  switch (true) {
    case req.method === 'OPTIONS':
      options(req, res);
      break;
    case req.method === 'GET' && req.url === '/files':
      await getAllFiles(req, res);
      break;
    case req.method === 'POST' && req.url === '/exports':
      await post(req, res);
      break;
    case req.method === 'GET' && req.url.startsWith('/files/'):
      await getFileByFilename(req, res);
      break;
    case req.method === 'DELETE' && req.url.startsWith('/files/'):
      await deleteFile(req, res);
      break;
    default:
      errorCase(req, res);
  }
});

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  const port = 9999;
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
