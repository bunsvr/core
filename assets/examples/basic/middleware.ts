import { App } from "../../..";

// Create a new app
export default new App<string>()
    // Set data
    .use(async request => 
        void (request.data = "Hello!"))
    // Response
    .use(async request => 
        new Response(request.data));