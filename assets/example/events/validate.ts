import App from "../../..";
import { Server, serve } from "bun";

// Create a new app
const app = new App();

// Use a middleware
app.use(async (ctx, next) => {
    // Set response to "Hello!";
    ctx.response.body = "Hello!";

    // Call next middleware
    await next();
});

// Sample ws message handler
app.websocket = {
    message(ws, message) {
        console.log(message);
        ws.send("Recieved");
    }
}

// Response when ws upgrade failed
const upgradeFailed = new Response("Upgrade failed", { status: 400 });
const methodNotAllowed = new Response("Method not allowed", { status: 405 });

// Use a validator
app.validate = async (req: Request, server: Server) => {
    const path = new URL(req.url).pathname;

    // Upgrade to WebSocket when pathname starts with "/ws"
    if (path.startsWith("/ws"))
        return server.upgrade(req) ? null : upgradeFailed;

    // Only allow request method "GET"
    return req.method === "GET" || methodNotAllowed;
};

// Serve using bun
serve(app);