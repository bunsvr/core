import { App } from "../../..";
import { serve } from "bun";

// Create a new app
const app = new App();

// Use a middleware
app.use(async () => new Response("Hello!"));

// Serve using bun
serve(app);