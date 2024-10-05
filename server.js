const WebSocket = require('ws')
const Redis = require('./redis')

const redis = new Redis();
const wss = new WebSocket.Server({port:8080});

wss.on('connection',(ws) =>{

    console.log("Client Connected");

    ws.on('message',(data)=>{
      
        const {action,channel,message} = JSON.parse(data);

        switch(action){
          case 'subscribe':
                redis.subscribe(ws,channel);
                break;
            case 'unsubscribe':
                redis.unsubscribe(ws,channel);
                break;
            case 'publish':
                redis.publish(channel,message);
                break;
            default :
                console.log("Incorrect Action Chosen",action);
        }

 
    })
    
    ws.on('close',()=>{
        console.log("Client Disconnected");
        redis.disconnect(ws);
    })

})

console.log('WebSocket server is running on ws://localhost:8080');



