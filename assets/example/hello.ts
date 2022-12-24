import App from "../..";
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

// Serve using bun
serve(app);