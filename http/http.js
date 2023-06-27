// import http from "http";
// import fsPromise from "fs/promises";
// import path from "path";
// import url from "url";
// import { spawn } from "child_process";
// import parserFunction from "../clusters/cluster.js";
//
//
// const headers = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
//   'Access-Control-Max-Age': 2592000,
// };
//
// const pathToConvert = process.cwd() + '/converted';
// const server = http.createServer(async (req, res) => {
//   switch(req) {
//     case req.method === 'OPTIONS':
//       options(req, res);
//       break
//     case req.method === 'GET' && req.url === '/files':
//       await getAllFiles(req, res)
//       break
//     case req.method === 'POST' && req.url === '/exports':
//       console.log('Arman');
//       await post(req, res);
//       break
//     case req.method === 'GET' && req.url.startsWith('/files/'):
//       await getFileByFilename(req,res)
//       break
//     case req.method === 'DELETE' && req.url.startsWith('/files/'):
//       await deleteFile(req, res)
//       break
//     default: errorCase(req, res)
//   }
// });
//
//
//
// async function getFileByFilename(req,res) {
//   const reqUrl = url.parse(req.url, true);
//   const filename = reqUrl.pathname.substring('/files/'.length);
//   const ext = path.extname(filename);
//   if (ext !== '.json') {
//     res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
//     res.end(JSON.stringify({ message: 'Wrong File Type' }))
//   }
//   const fullPath = path.join(pathToConvert, filename);
//   console.log(fullPath);
//   try {
//     const result = await fsPromise.readFile(fullPath);
//     res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
//     res.end(JSON.stringify({ message: 'Get Request Succeeded', data: result }))
//   } catch (e) {
//     res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
//     res.end(JSON.stringify({ message: 'File Not Found' }))
//   }
// }
//
//
//
// async function getAllFiles(req,res) {
//   const files = (await fsPromise.readdir(pathToConvert))
//     .filter(file => path.extname(file) === '.json');
//   res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
//   res.end(JSON.stringify({ message: 'Get Request Succeeded', data: files }))
// }
//
//
//
// function options(req, res){
//   res.writeHead(200, {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
//     'Access-Control-Max-Age': 2592000,
//     'Content-Length': '0'
//   });
//   res.end();
// }
//
// function errorCase(req,res){
//   res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
//   res.end(JSON.stringify({ message: 'Not Found' }))
// }
//
// // async function post(req,res){
// //   let requestBody = '';
// //   req.on('data', (chunk) => {
// //     requestBody += chunk;
// //   });
// //   req.on('end', () => {
// //     let { dirPath } = JSON.parse(requestBody);
// //     dirPath = '../' + dirPath;
// //     const parserProcess = spawn('node', ['../child-process/child.js', dirPath]);
// //
// //     parserProcess.stdout.on('data', (data) => {
// //       console.log(`Parser output: ${data}`);
// //     });
// //
// //     parserProcess.stderr.on('data', (data) => {
// //       console.error(`Parser error: ${data}`);
// //       res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
// //       res.end(JSON.stringify({ message: 'Bad Request' }))
// //     });
// //
// //     parserProcess.on('close', (code) => {
// //       console.log(`Parser process exited with code ${code}`);
// //       res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
// //       res.end(JSON.stringify({ message: 'Post Request Succeeded' }))
// //     });
// //   });
// // }
// function post(req,res){
//   let requestBody = ''
//   req.on('data', (chunk) => {
//     requestBody += chunk;
//   });
//   req.on('end', () => {
//     let {dirPath} = JSON.parse(requestBody);
//     dirPath = '../' + dirPath;
//     console.log(dirPath);
//     parserFunction(dirPath).then(r => r);
//
//     (async () => {
//       try {
//         res.writeHead(201, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ message: 'Post Request Succeeded' }))
//       }catch(err){
//         res.writeHead(400, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ message: 'Bad Request' }))
//       }
//     })()
//   });
// }

//
// async function deleteFile(req,res){
//   const parsedUrl = url.parse(req.url, true);
//   const filename = parsedUrl.pathname.substring('/files/'.length);
//   const ext = path.extname(filename);
//   if (ext !== '.json') {
//     res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
//     res.end(JSON.stringify({ message: 'Wrong File Type' }))
//   }
//   const fullPath = path.join(pathToConvert, filename);
//   try {
//     await fsPromise.unlink(fullPath);
//     res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
//     res.end(JSON.stringify({ message: 'Deleted' }))
//   } catch (e) {
//     res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
//     res.end(JSON.stringify({ message: 'File Not Found' }))
//   }
// }
// const port = 9999;
// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`)
// });
import http from "http";
import fsPromise from "fs/promises";
import path from "path";
import url from "url";
import { spawn } from "child_process";
import parserFunction from "../clusters/cluster.js";


const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
  'Access-Control-Max-Age': 2592000,
};

const pathToConvert = process.cwd() + '/converted';
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    options(req, res)
  }
  else if (req.method === 'GET' && req.url === '/files') {
    await getAllFiles(req, res)
  }
  else if (req.method === 'POST' && req.url === '/exports') {
    await post(req, res);
  }
  else if (req.method === 'GET' && req.url.startsWith('/files/')) {
    await getFileByFilename(req,res)
  }
  else if (req.method === 'DELETE' && req.url.startsWith('/files/')) {
    await deleteFile(req, res)
  }
  else {
    errorCase(req, res)
  }
});


console.log('------------------------------> run');

async function getFileByFilename(req,res) {
  const reqUrl = url.parse(req.url, true);
  const filename = reqUrl.pathname.substring('/files/'.length);
  const ext = path.extname(filename);
  if (ext !== '.json') {
    res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Wrong File Type' }))
  }
  const fullPath = path.join(pathToConvert, filename);
  console.log(fullPath);
  try {
    const result = await fsPromise.readFile(fullPath);
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Get Request Succeeded', data: result }))
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'File Not Found' }))
  }
}



async function getAllFiles(req,res) {
  const files = (await fsPromise.readdir(pathToConvert))
    .filter(file => path.extname(file) === '.json');
  res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify({ message: 'Get Request Succeeded', data: files }))
}



function options(req, res){
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
    'Access-Control-Max-Age': 2592000,
    'Content-Length': '0'
  });
  res.end();
}


function post(req,res){
  let requestBody = ''
  req.on('data', (chunk) => {
    requestBody += chunk;
  });
  req.on('end', () => {
    let {dirPath} = JSON.parse(requestBody);
    dirPath = '../' + dirPath;
    console.log(dirPath);
      try {
        parserFunction(dirPath).then()
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: 'Post Request Succeeded' }))
      }catch(err){
        res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: 'Bad Request' }))
      }
  });
}


function errorCase(req,res){
  res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify({ message: 'Not Found' }))
}


async function deleteFile(req,res){
  const parsedUrl = url.parse(req.url, true);
  const filename = parsedUrl.pathname.substring('/files/'.length);
  const ext = path.extname(filename);
  if (ext !== '.json') {
    res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Wrong File Type' }))
  }
  const fullPath = path.join(pathToConvert, filename);
  try {
    await fsPromise.unlink(fullPath);
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Deleted' }))
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'File Not Found' }))
  }
}

const port = 9999;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});