import App, { AppContext } from "../../..";
import { serve } from "bun";

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
app.validate = async (ctx: AppContext) => {
    const { method, url, value } = ctx.request;

    // Upgrade to WebSocket when pathname starts with "/ws"
    if (url.path.startsWith("/ws"))
        return ctx.server.upgrade(value) ? null : upgradeFailed;

    // Only allow request method "GET"
    return method === "GET" || methodNotAllowed;
};

// Serve using bun
serve(app);