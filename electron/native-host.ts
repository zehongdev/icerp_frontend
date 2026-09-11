// import readline from 'readline'
// import fs from 'fs'

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//     terminal: false
// });

// function sendMessage(message: any) {
//     const json = JSON.stringify(message);
//     const length = Buffer.byteLength(json, 'utf8');
//     const header = Buffer.alloc(4);
//     header.writeUInt32LE(length, 0);
//     process.stdout.write(header);
//     process.stdout.write(json);
// }

// rl.on('line', (input) => {
//     const data = JSON.parse(input);
//     console.log("Received data:", data)
//     sendMessage({
//         success: true,
//         received: data
//     });
// });

// process.stdin.on("data", (chunk) => {
//     const size = chunk.readUInt32LE(0);
//     const json = chunk.slice(4, 4 + size).toString('utf8');

//     const message = JSON.parse(json);
//     console.log("Received message:", message);
// });