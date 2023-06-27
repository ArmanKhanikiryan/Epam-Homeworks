// import http from "http";
// import path from "path";
// import fsPromise from "fs/promises";
// import url from "url";
// import { UrlWithParsedQuery } from "url";
// import { IncomingMessage, ServerResponse } from "http";
//
// const server = http.createServer(async (req: IncomingMessage, res:ServerResponse):Promise<void> => {
//   const pathToConvert = '../clusters/converted';
//   if (req !== undefined && req.url !== undefined){
//     if (req.method === 'GET' && req.url === '/files'){
//       const files:string[] = (await fsPromise.readdir(pathToConvert))
//         .filter((file) => path.extname(file) === '.json');
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ message: 'Get Request Succeeded', data: files }))
//     }else if (req.method === 'POST' && req.url === '/exports') {
//       let requestBody = ''
//       req.on('data', (chunk) => {
//           requestBody += chunk;
//       });
//       req.on('end', () => {
//           let {dirPath} = JSON.parse(requestBody);
//           dirPath = '../' + dirPath;
//           console.log(dirPath);
//           (async () => {
//               try {
//                   res.writeHead(201, { 'Content-Type': 'application/json' });
//                   res.end(JSON.stringify({ message: 'Post Request Succeeded' }))
//               }catch(err){
//                   res.writeHead(400, { 'Content-Type': 'application/json' });
//                   res.end(JSON.stringify({ message: 'Bad Request' }))
//               }
//           })()
//       });
//     }else if(req.method === 'GET' && req.url.startsWith('/files/')) {
//       const reqUrl:UrlWithParsedQuery = url.parse(req.url, true);
//       const filename:string = reqUrl.pathname!.substring('/files/:'.length);
//       const ext:string = path.extname(filename)
//       if (ext !== '.json'){
//         res.writeHead(400, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ message: 'Wrong File Type' }))
//       }
//       const fullPath:string = path.join(pathToConvert, filename)
//       try {
//         const result:Buffer = await fsPromise.readFile(fullPath)
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ message: 'Get Request Succeeded', data: result }))
//       }catch (e) {
//         res.writeHead(404, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ message: 'File Not Found' }))
//       }
//
//     }else if (req.method === 'DELETE' && req.url.startsWith('/files/')){
//       const parsedUrl:UrlWithParsedQuery = url.parse(req.url, true);
//       const filename:string = parsedUrl.pathname!.substring('/files/:'.length);
//       const ext:string = path.extname(filename)
//       if (ext !== '.json'){
//         res.writeHead(400, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ message: 'Wrong File Type' }))
//       }
//       const fullPath:string = path.join('./', filename)
//       console.log(fullPath)
//       try{
//         await fsPromise.rm(fullPath)
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ message: 'Deleted' }))
//       }catch(e){
//         res.writeHead(404, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify({ message: 'File Not Found' }))
//       }
//     }else{
//       res.writeHead(404, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ message: 'Not Found' }))
//     }
//   }
// })
// server.listen(9999)
//
//
//
//
//
//
//
//
