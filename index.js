const fs = require("fs");

console.log(1);
setTimeout(() => console.log("2"));
setImmediate(() => console.log("3"));
process.nextTick(() => console.log("4"));
fs.readFile(__filename, () => {
    console.log(2);
    setTimeout(() => console.log("5"));
    setImmediate(() => console.log("6"));
    process.nextTick(() => console.log("7"));
});

setTimeout(() => console.log("8"));
setImmediate(() => {
    console.log("9");
    process.nextTick(() => console.log("11"));
});
setImmediate(() => {
    console.log("12");
});
process.nextTick(() => console.log("10"));