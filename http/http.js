import http from "http";
import fsPromise from "fs/promises";
import path from "path";
import url from "url";
import { spawn } from "child_process";

const server = http.createServer(async (req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
    'Access-Control-Max-Age': 2592000,
  };
  const pathToConvert = process.cwd() + '/converted';
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
      'Access-Control-Max-Age': 2592000,
      'Content-Length': '0'
    });
    res.end();
  }
  else if (req.method === 'GET' && req.url === '/files') {
    const files = (await fsPromise.readdir(pathToConvert))
      .filter(file => path.extname(file) === '.json');
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Get Request Succeeded', data: files }))
  }
  else if (req.method === 'POST' && req.url === '/exports') {
    let requestBody = '';
    req.on('data', (chunk) => {
      requestBody += chunk;
    });
    req.on('end', () => {
      let { dirPath } = JSON.parse(requestBody);
      dirPath = '../' + dirPath;
      const parserProcess = spawn('node', ['../child-process/child.js', dirPath]);

      parserProcess.stdout.on('data', (data) => {
        console.log(`Parser output: ${data}`);
      });

      parserProcess.stderr.on('data', (data) => {
        console.error(`Parser error: ${data}`);
        res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: 'Bad Request' }))
      });

      parserProcess.on('close', (code) => {
        console.log(`Parser process exited with code ${code}`);
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: 'Post Request Succeeded' }))
      });
    });
  }
  else if (req.method === 'GET' && req.url.startsWith('/files/')) {
    const reqUrl = url.parse(req.url, true);
    const filename = reqUrl.pathname.substring('/files/:'.length);
    const ext = path.extname(filename);
    if (ext !== '.json') {
      res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify({ message: 'Wrong File Type' }))
    }
    const fullPath = path.join(pathToConvert, filename);
    try {
      const result = await fsPromise.readFile(fullPath);
      res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify({ message: 'Get Request Succeeded', data: result }))
    } catch (e) {
      res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify({ message: 'File Not Found' }))
    }
  }
  else if (req.method === 'DELETE' && req.url.startsWith('/files/')) {
    const parsedUrl = url.parse(req.url, true);
    const filename = parsedUrl.pathname.substring('/files/:'.length);
    const ext = path.extname(filename);
    if (ext !== '.json') {
      res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify({ message: 'Wrong File Type' }))
    }
    const fullPath = path.join(pathToConvert, filename);
    console.log(fullPath)
    try {
      await fsPromise.unlink(fullPath);
      res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify({ message: 'Deleted' }))
    } catch (e) {
      res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
      res.end(JSON.stringify({ message: 'File Not Found' }))
    }
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Not Found' }))
  }
});

const port = 9999;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
