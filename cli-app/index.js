import os from 'os';
import fs from 'fs/promises'
import path from 'path'

const username = os.userInfo().username;

console.log(`Welcome to the File Manager, ${username}!`);

const handleInput = (input) => {
    const command = input.trim();
    const prefixCommand = command.split(' ')[0]



    switch(prefixCommand){
        case 'add':{
            const newFileName = command.split(' ')[1]
            if (!newFileName){
                console.log('Missing Filename')
                return;
            }
            const createNewFile = async () => {
                try {
                    await fs.writeFile(newFileName,'')
                    console.log("File Created")
                }catch (e) {
                    console.log('Error, File is not created')
                }
            }
            createNewFile().then()
            return
        }
        case 'rn':{
            const oldFileName = command.split(' ')[1]
            const newFileName = command.split(' ')[2]
            if (!newFileName || !oldFileName){
                console.log('Missing Filename')
                return;
            }
            const rename = async () => {
                try {
                    await fs.rename(oldFileName,newFileName)
                    console.log("File Renamed")
                }catch (e) {
                    console.log('Error, File is not renamed')
                }
            }
            rename().then()
            return;
        }
        case 'cp': {
            const args = command.split(' ');
            const pathToFile = args[1];
            const pathToNewDirectory = args.slice(2).join(' ');
            if (!pathToNewDirectory || !pathToFile) {
                console.log('Missing Path');
                return;
            }
            const fileName = path.basename(pathToFile);
            const destinationPath = path.join(pathToNewDirectory, fileName);
            const copyTo = async () => {
                try {
                    await fs.copyFile(pathToFile, destinationPath);
                    console.log("File Copied");
                } catch (e) {
                    console.log('Error, File is not copied');
                }
            }
            copyTo().then();
            return;
        }
        case 'mv': {
            const args = command.split(' ');
            const oldPath = args[1];
            const newPath = args.slice(2).join(' ');
            if (!newPath || !oldPath) {
                console.log('Missing Path');
                return;
            }
            const fileName = path.basename(oldPath);
            const destinationPath = path.join(newPath, fileName);
            const moveTo = async () => {
                try {
                    await fs.rename(oldPath,destinationPath)
                    console.log("File Moved");
                } catch (e) {
                    console.log('Error, File is not moved');
                }
            }
            moveTo().then();
            return;
        }
        case 'rm': {
            const deletePath = command.split(' ')[1]
            if(!deletePath){
                console.log('Missing Path');
                return;
            }
            const deleteFile = async () => {
                try{
                    await fs.rm(deletePath)
                    console.log('File Deleted')
                }catch (e){
                    console.log('Error, File is not deleted')
                }
            }
            deleteFile().then()
            return;
        }
    }
    switch (command || prefixCommand) {
        case '.exit': {
            console.log(`Thank you, ${username}, goodbye!`);
            process.exit(0);
            break
        }
        case 'os --cpus': {
            const cpuDetails = os.cpus()
            console.log('CPU Info');
            cpuDetails.forEach((elem, index) => {
                console.log(`CPU ${index + 1}:`);
                console.log(`Model: ${elem.model}`);
                console.log(`Clock Rate: ${elem.speed / 1000} GHz`);
            })
            break
        }
        case 'os --homedir': {
            console.log(`Home Directory: ${os.homedir()}`);
            break
        }
        case 'os --platform': {
            console.log(`Platform: ${os.platform()}`);
            break
        }
        case 'os --memory': {
            console.log(`Total Memory: ${os.totalmem()} bytes`);
            break
        }
        case 'os --architecture': {
            console.log(`Architecture: ${os.arch()}`)
            break
        }
        case 'os --username': {
            console.log(`Username: ${username}`)
            break
        }
        case 'os --hostname': {
            console.log(`Hostname: ${os.hostname()}`)
            break
        }
        case 'ls': {
            const currentPath = process.cwd()
            const getFiles = async () => {
                const response  = await fs.readdir(currentPath)
                const dirArr = []
                const filesArr = []
                for (let i = 0; i < response.length; i++) {
                    const filePath = path.join(currentPath, response[i]);
                    const stat = await fs.stat(filePath);
                    if(stat.isDirectory()){
                        dirArr.push([response[i], 'directory'])
                    }else if(stat.isFile()){
                        filesArr.push([response[i], 'file'])
                    }
                }
                filesArr.sort()
                dirArr.sort()
                const res = dirArr.concat(filesArr)
                const indexTitle = 'Index'.toString().padEnd(15);
                const nameTitle = 'Name'.padEnd(20);
                const descTitle = 'Type'.toString().padEnd(20)
                console.log('')
                console.log(`${indexTitle}${nameTitle}${descTitle}`);
                res.forEach((name, index) => {
                    const paddedIndex = index.toString().padEnd(15);
                    const paddedName = name[0].padEnd(20);
                    const paddedDescription = name[1].toString().padEnd(20)
                    console.log(`${paddedIndex}${paddedName}${paddedDescription}`);
                });
            }
            getFiles().then()
            break
        }
        default: {
            console.log('Invalid input. Please enter a valid command.');
        }
    }
};



process.stdin.setEncoding('utf-8');

process.stdin.on('data', (data) => {
    handleInput(data);
});

process.on('SIGINT', () => {
    console.log(`Thank you, ${username}, goodbye!`);
    process.exit(0);
});
console.log('Type a command or use ".exit" to quit.');






