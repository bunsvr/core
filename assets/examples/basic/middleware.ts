import { App } from "../../..";
import { serve } from "bun";

// Create a new app
const app = new App<string>();

// Set data
app.use(async request => {
    request.data = "Hello!";
});

// Response
app.use(async request => new Response(request.data));

// Serve using bun
serve(app);

/**
 * Note: The more middleware you add, the worse the performance is.
 * So be careful, friend!
 * In fact, the "hello.ts" examples performance is almost 2x better than this.
 * You can see the code for more details. 
 * I tried but... well that's the current best solution.
 * If you have another faster solution, feel free to create an issue.
 */