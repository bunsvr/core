import { App } from "../../..";

// Create a new app
const app = new App();

// Sample ws message handler
app.websocket = {
    message(ws, message) {
        console.log(message);
        ws.send("Recieved");
    }
}

// Response when ws upgrade failed
const upgradeFailed = new Response("Upgrade failed", { status: 400 });

// Try upgrading to ws (app.use returns the current app)
export default app.use(async (request, server) => 
    server.upgrade(request) || upgradeFailed
);