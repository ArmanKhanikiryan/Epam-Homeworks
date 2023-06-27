import http from "http";
import path from "path";
import fsPromise from "fs/promises";
import url from "url";
import { UrlWithParsedQuery } from "url";
import { IncomingMessage, ServerResponse } from "http";
import { spawn } from "child_process";

interface ICors {
  'Access-Control-Allow-Origin': string,
  'Access-Control-Allow-Methods': string,
  'Access-Control-Max-Age': number,
}
const pathToConvert = '../clusters/converted';
const headers: ICors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, DELETE',
  'Access-Control-Max-Age': 2592000,
};
const server = http.createServer(async (req: IncomingMessage, res:ServerResponse):Promise<void> => {

  if (req && req.url) {
    if (req.method === 'GET' && req.url === '/files') {
      await getAllFiles(req, res)
    } else if (req.method === 'POST' && req.url === '/exports') {
      await handlePost(req, res)
    } else if (req.method === 'GET' && req.url.startsWith('/files/')) {
      await getFileByFilename(req, res)
    } else if (req.method === 'DELETE' && req.url.startsWith('/files/')) {
      await handleDelete(req, res)
    } else {
      handleError(req, res)
    }
  }
})


async function getAllFiles(req: IncomingMessage, res:ServerResponse):Promise<void> {
  const files:string[] = (await fsPromise.readdir(pathToConvert))
    .filter((file) => path.extname(file) === '.json');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Get Request Succeeded', data: files }))
}

async function handlePost(req: IncomingMessage, res:ServerResponse):Promise<void>{
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

async function getFileByFilename(req: IncomingMessage, res:ServerResponse):Promise<void>{
  const reqUrl:UrlWithParsedQuery = url.parse(req.url!, true);
  const filename:string = reqUrl.pathname!.substring('/files/:'.length);
  const ext:string = path.extname(filename)
  if (ext !== '.json'){
    res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Wrong File Type' }))
  }
  const fullPath:string = path.join(pathToConvert, filename)
  try {
    const result:Buffer = await fsPromise.readFile(fullPath)
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Get Request Succeeded', data: result }))
  }catch (e) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'File Not Found' }))
  }
}

async function handleDelete(req: IncomingMessage, res:ServerResponse):Promise<void>{
  const parsedUrl:UrlWithParsedQuery = url.parse(req.url!, true);
  const filename:string = parsedUrl.pathname!.substring('/files/:'.length);
  const ext:string = path.extname(filename)
  if (ext !== '.json'){
    res.writeHead(400, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Wrong File Type' }))
  }
  const fullPath:string = path.join('./', filename)
  console.log(fullPath)
  try{
    await fsPromise.rm(fullPath)
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'Deleted' }))
  }catch(e){
    res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify({ message: 'File Not Found' }))
  }
}

function handleError(req: IncomingMessage, res:ServerResponse):void{
  res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify({ message: 'Not Found' }))
}

server.listen(9999)
