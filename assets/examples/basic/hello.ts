import { App } from "../../..";

// Create a new app and serve using Bun
export default new App()
    // Use a middleware
    .use(async () => new Response("Hello!"));