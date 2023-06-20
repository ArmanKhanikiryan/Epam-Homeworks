import url from "url";
import path from "path";
import fsPromise from "fs/promises";
import http from "http";
import parserFunction from "../clusters/cluster.js";

const server = http.createServer(async (req, res) => {
    const pathToConvert = '../clusters/converted';
    if (req.method === 'GET' && req.url === '/files'){
        const files = (await fsPromise.readdir(pathToConvert))
            .filter(file => path.extname(file) === '.json');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Get Request Succeeded', data: files }))

    }else if (req.method === 'POST' && req.url === '/exports') {
        // let requestBody = ''
        // req.on('data', (chunk) => {
        //     requestBody += chunk;
        // });
        // req.on('end', () => {
        //     let {dirPath} = JSON.parse(requestBody);
        //     dirPath = '../' + dirPath;
        //     console.log(dirPath);
        //     parserFunction(dirPath)
        //     (async () => {
        //         try {
        //             res.writeHead(201, { 'Content-Type': 'application/json' });
        //             res.end(JSON.stringify({ message: 'Post Request Succeeded' }))
        //         }catch(err){
        //             res.writeHead(400, { 'Content-Type': 'application/json' });
        //             res.end(JSON.stringify({ message: 'Bad Request' }))
        //         }
        //     })()
        // });
    }else if(req.method === 'GET' && req.url.startsWith('/files/')) {
        const reqUrl = url.parse(req.url, true);
        const filename = reqUrl.pathname.substring('/files/:'.length);
        const ext = path.extname(filename)
        if (ext !== '.json'){
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Wrong File Type' }))
        }
        const fullPath = path.join(pathToConvert, filename)
        try {
            const result = await fsPromise.readFile(fullPath)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Get Request Succeeded', data: result }))
        }catch (e) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'File Not Found' }))
        }

    }else if (req.method === 'DELETE' && req.url.startsWith('/files/')){
        const parsedUrl = url.parse(req.url, true);
        const filename = parsedUrl.pathname.substring('/files/:'.length);
        const ext = path.extname(filename)
        if (ext !== '.json'){
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Wrong File Type' }))
        }
        const fullPath = path.join('./', filename)
        console.log(fullPath)
        try{
            await fsPromise.rm(fullPath)
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Deleted' }))
        }catch(e){
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'File Not Found' }))
        }
    }else{
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }))
    }
})
server.listen(9999)
