import App, { AppContext } from "../..";
import { serve } from "bun";

// Create a new app
const app = new App();

// Use a middleware
app.use(async (ctx, next) => {
    // Set response to a custom object
    ctx.response.body = {
        code: 200,
        data: {
            username: "John",
            id: 123456
        }
    };

    // Call next middleware
    await next();
});

// Custom response
app.response = async (ctx: AppContext) => {
    // Set status code to the value of code property in the response body
    ctx.response.status = ctx.response.body.code;

    // Return the data property in the response body only
    return new Response(JSON.stringify(ctx.response.body.data), ctx.response);
}

// Serve using bun
serve(app);