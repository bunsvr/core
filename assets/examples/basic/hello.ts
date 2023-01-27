import { App } from "../../..";

// Create a new app and serve using Bun
export default new App()
    // Use a middleware
    .use(() => new Response("Hello!"));