import { App } from "../../..";
import { serve } from "bun";

// Create a new app
const app = new App();

// Use a middleware
app.use(async request => {
    const url = new URL(request.url);
    let res = "";

    // Set response to parsed url parts
    res = "Protocol: " + url.protocol + "\n";
    res += "Domain: " + url.hostname + "\n";
    res += "Port: " + url.port + "\n";
    res += "Path: " + url.pathname + "\n";
    res += "Hash: " + url.hash + "\n";

    // Loop through URL query
    res += "Query:\n";
    for (const [key, val] of url.searchParams.entries()) 
        res += "\t" + key + ": " + val + "\n";
    
    return new Response(res);
});

// Serve using bun
serve(app);