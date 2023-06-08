import fs from 'fs/promises';
import path from 'path';
import child_process from 'child_process';

const csvDirectory = process.argv[2];
const pathToConvert = './converted';


const forkWorker = (file) => {
    const worker = child_process.fork('./index.js');
    worker.send({
        csvFile: path.join(csvDirectory, file),
        jsonFile: path.join(pathToConvert, path.parse(file).name + '.json')
    });
    return worker;
}

if (!csvDirectory) {
    console.error('Invalid Directory Input');
    process.exit(1);
}

try {
    await fs.access(csvDirectory);
} catch (err) {
    console.error('Directory doesnt exist');
    process.exit(1);
}

try {
    await fs.mkdir(pathToConvert);
} catch (err) {
    if (err.code !== 'EEXIST') {
        console.error('Error creating the "converted" directory:', err);
        process.exit(1);
    }
}

try {
    const files = await fs.readdir(csvDirectory);
    const csvFiles = files.filter(file => path.extname(file) === '.csv');

    if (csvFiles.length === 0) {
        console.log('No .csv files in the directory.');
        process.exit(0);
    }

    const startTime = new Date().getTime();
    let totalRecords = 0;

    for (let i = 0; i < csvFiles.length; i++) {
        const worker = forkWorker(csvFiles[i]);
        const info = await new Promise((resolve, reject) => {
            worker.on('message', resolve);
            worker.on('error', reject);
        });
        totalRecords += info.count;
        console.log(`File ${i + 1}: ${info.count} records processed.`);

        if (i === csvFiles.length - 1) {
            const endTime = new Date().getTime();
            const duration = endTime - startTime;
            console.log(`Total records: ${totalRecords}`);
            console.log(`Parsing duration: ${duration}ms`);
            process.exit(0);
        }
    }
} catch (err) {
    console.error('Error reading directory:', err);
    process.exit(1);
}


