const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Connected to the Server!");

  ws.send(
    JSON.stringify({
      action: "subscribe",
      channel: "news",
    })
  );
});

ws.on("message", (data) => {
  const { channel, message } = JSON.parse(data);
  console.log(`Received on channel ${channel}: ${message}`);
});

ws.on("close", () => {
  console.log("Disconnected from the server");
});
