import fs from "node:fs";
import {Transform} from 'stream'


const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error('Error: Missing argument.');
    console.log('Correct Command Example: node index.js input file output file operation');
    process.exit(1);
}
const inputFile = args[0]
const outputFile = args[1]
const operation = args[2]
const handleOperation = (inputFile,outputFile,operation) => {
    if(!inputFile || !outputFile || !operation){
        console.log('Error, Missing Argument')
        process.exit(0)
        return null;
    }
    const readable = fs.createReadStream(inputFile)
    const writable = fs.createWriteStream(outputFile)
    const handleTransform = (chunk, action) => {
        if (action === 'uppercase') {
            return chunk.toString().toUpperCase();
        } else if (action === 'lowercase') {
            return chunk.toString().toLowerCase();
        } else if (action === 'reverse') {
            return chunk.toString().split('').reverse().join('');
        }else if(action === 'trim'){
            return chunk.toString().trim()
        }else if(action === 'title-case'){
            const wordsArr = chunk.toString().split(' ');
            const titleCaseWords = wordsArr.map(word => {
                const firstLetter = word.charAt(0).toUpperCase();
                const restOfWord = word.slice(1).toLowerCase();
                return firstLetter + restOfWord;
            });
            return titleCaseWords.join(' ');
        }
    };
    const operationFlag = ['uppercase', 'lowercase', 'reverse', 'trim', 'title-case'].includes(operation);
    if (!operationFlag){
        console.log('Unknown operation, Error occurred')
        process.exit(0)
    }
    const transform = new Transform({
        transform(chunk, encoding, callback) {
            const transformedChunk = handleTransform(chunk, operation);
            if (transformedChunk){
                callback(null, transformedChunk);
            }
        }
    });
    readable.pipe(transform).pipe(writable)
    readable.on('error', () => console.log('Error in Reading'))
    writable.on('error', () => console.log('Error in Writing'))
    transform.on('error', () => console.log('Error in Transforming'))
    writable.on('finish', () => console.log('File Transformed'));
}
handleOperation(inputFile, outputFile, operation)