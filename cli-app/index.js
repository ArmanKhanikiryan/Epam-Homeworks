import os from 'os';

const username = os.userInfo().username;

console.log(`Welcome to the File Manager, ${username}!`);

const handleInput = (input) => {
    const command = input.trim();
    switch (command) {
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