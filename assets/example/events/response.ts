import { AppContext, response, App } from "../../..";
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
    const res = ctx.response;

    // Set status code to the value of code property in the response body
    // Return the data property in the response body only
    res.status = res.body.code;
    res.body = res.body.data;

    // Default response
    return response(ctx);
}

// Serve using bun
serve(app);