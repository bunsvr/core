import App from "../..";
import { serve } from "bun";

// Create a new app
const app = new App();

// Use a middleware
app.use(async (ctx, next) => {
    const url = ctx.request.url;

    // Set response to parsed url parts
    ctx.response.body = "Protocol: " + url.protocol + "\n";
    ctx.response.body += "Domain: " + url.domain + "\n";
    ctx.response.body += "Port: " + url.port + "\n";
    ctx.response.body += "Path: " + url.path + "\n";
    ctx.response.body += "Hash: " + url.fragment + "\n";

    // Loop through URL query
    ctx.response.body += "Query:\n";
    for (const [key, val] of url.query) 
        ctx.response.body += "\t" + key + ": " + val + "\n";
    
    // Call next middleware
    await next();
});

// Serve using bun
serve(app);