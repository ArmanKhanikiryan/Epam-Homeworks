import fs from'fs/promises'
import path from 'path'
import url from 'url'



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
const findNodeModulesDirectory = async () => {
    let currentPath = path.resolve(process.cwd());
    while (currentPath !== '/') {
        const nodeModulesPath = path.join(currentPath, 'node_modules');
        try {
            await fs.access(nodeModulesPath);
            return nodeModulesPath;
        } catch (error) {
            currentPath = path.dirname(currentPath);
        }
    }
    return null;
};
let startDir = await findNodeModulesDirectory();


const createFile = async (fileName) => {
    if(!startDir){
        startDir = process.cwd()
    }
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