import { App } from "../../..";
import { serve } from "bun";

// Create a new app
const app = new App();

// Use a middleware
app.use(async () => new Response("Hello!"));

// Set port and hostname
app.port = 8080;
app.hostname = "127.0.0.1";

// Serve using bun
serve(app);