import fs from'fs/promises'
import path from 'path'


const findDeepestDirectory = async (dirPath, depth = 0) => {
    let maxDepth = depth;
    let maxDepthDir = dirPath;
    try {
        const files = await fs.readdir(dirPath);
        for (let i = 0; i < files.length; i++) {
            const filePath = path.join(dirPath, files[i]);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
                    const subDepth = await findDeepestDirectory(filePath, depth + 1);
                    if (subDepth.maxDepth > maxDepth) {
                        maxDepth = subDepth.maxDepth;
                        maxDepthDir = subDepth.maxDepthDir
                    }
            }
        }
    } catch (error) {
        console.log(`Error reading directory: ${dirPath}`);
        console.log(error);
    }
    return {
        maxDepth,
        maxDepthDir
    };
}

const startDir = '/Users/armankhanikiryan/Desktop/Epam Homeorks/node_modules'
const createFile = async (fileName) => {
    const res = await findDeepestDirectory(startDir)
    const dir = res.maxDepthDir
    try{
        await fs.writeFile(`${dir}/${fileName}`, 'Hello World')
    }catch (e){
        console.log(e)
    }
}
createFile('text.txt')
    .then()