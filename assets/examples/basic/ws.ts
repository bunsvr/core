import { App } from "../../../types";
import { serve } from "bun";

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

// Try upgrading to ws
app.response = async ctx => 
    ctx.server.upgrade(ctx.request) || upgradeFailed;

// Serve using bun
serve(app);