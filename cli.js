const Redis = require('./redis');
const readline = require('readline')

const redis = new Redis();
redis.startSnapshotInterval(15);


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Welcome To My Redis CLI!!!!");
console.log("Available Commands are: SET , GET , DEL ");

rl.on('line',(input)=>{
   
   const [command, ...args] = input.split(' ');
   
   switch(command.toUpperCase()){
    case 'SET':
      redis.set(args[0], args[1], args[2]);
      console.log('OK');
      break;
    case 'GET':
      console.log(redis.get(args[0]));
      break;
    case 'DEL':
      redis.del(args[0]);
      console.log('OK');
      break;
   }



});
