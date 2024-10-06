const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Connected to the Server!");

  setInterval(() => {
    ws.send(
      JSON.stringify({
        action: "publish",
        channel: "news",
        message: "Breaking news: Direct From Channel",
      })
    );
  }, 3000);
});

ws.on("close", () => {
  console.log("Disconnected from the server");
});
