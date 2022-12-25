import App from "../../..";
import { serve } from "bun";

// Create a new app
const app = new App();

// Use a middleware
app.use(async (ctx, next) => {
    const url = new URL(ctx.request.url);
    const res = ctx.response;

    // Set response to parsed url parts
    res.body = "Protocol: " + url.protocol + "\n";
    res.body += "Domain: " + url.hostname + "\n";
    res.body += "Port: " + url.port + "\n";
    res.body += "Path: " + url.pathname + "\n";
    res.body += "Hash: " + url.hash + "\n";

    // Loop through URL query
    res.body += "Query:\n";
    for (const [key, val] of url.searchParams.entries()) 
        res.body += "\t" + key + ": " + val + "\n";
    
    // Call next middleware
    await next();
});

// Serve using bun
serve(app);