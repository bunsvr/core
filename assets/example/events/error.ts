import { App } from "../../..";
import { serve } from "bun";

// Create a new app
const app = new App();

// Use a middleware
app.use(async () => {
    // Throw an error
    throw new Error("An error occured");
});

// Register an error handler
app.catch = async (err, ctx) => {
    ctx.response.body = err.message;
    ctx.response.status = 500;
}

// Serve using bun
serve(app);