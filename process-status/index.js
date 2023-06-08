import child_process from 'child_process';
import fs from 'fs/promises';
import path from 'path';

class Statistics {
    constructor(argumentArr = [],command, timeout = Infinity) {
        this.command = command;
        this.argumentArr = argumentArr;
        this.timeout = timeout;
        this.startTime = null;
        this.duration = null;
        this.success = false;
        this.commandSuccess = false;
        this.error = null;
        const workingDir = path.dirname(process.argv[1]);
        this.logDirectory = path.join(workingDir, 'logs');
    }

    async dataSave() {
        const timestamp = new Date().toISOString();
        const filename = `${timestamp}${this.command}.json`;
        const filePath = path.join(this.logDirectory, filename);

        const statistics = {
            start: this.startTime,
            duration: this.duration,
            success: this.success,
            commandSuccess: this.commandSuccess,
            error: this.error,
        };

        try {
            await fs.mkdir(this.logDirectory, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(statistics, null, 2));
            console.log(`Data Saved ::: ${filePath}`);
        } catch (error) {
            console.error(`Error in Saving ::: ${error}`);
        }
    }

    async commandFunc() {
        try {
            this.startTime = new Date().toISOString();
            const process = child_process.spawn(this.command, this.argumentArr);
            const handleTimout = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Time Out ::; Execution Failed'));
                }, this.timeout);
            });
            await Promise.race([
                Promise.all([
                    new Promise((resolve) => {
                        process.on('exit', (code) => {
                            this.commandSuccess = code === 0;
                            resolve();
                        });
                    }),
                    new Promise((resolve) => {
                        process.stdout.on('data', (data) => {
                            console.log(`stdout: ${data}`);
                        });
                        process.stderr.on('data', (data) => {
                            console.log(`stderr: ${data}`);
                        });
                        process.on('error', (error) => {
                            console.error(`Error Occur ::: ${error}`);
                        });
                        process.on('close', (code) => {
                            console.log(`Closed ::: ${code}`);
                        });
                        resolve();
                    }),
                ]),
                handleTimout,
            ]);

            this.success = true;
            this.duration = new Date() - new Date(this.startTime);
        } catch (error) {
            this.error = error.message;
        } finally {
            await this.dataSave();
        }
    }
}
const sampleStatistics = new Statistics( ['-l'], 'ls', 5000);
sampleStatistics.commandFunc().then();
