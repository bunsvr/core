import { App } from "../../..";

// Create a new app
export default new App<string>()
    // Set data
    .use(req => 
        void (req.data = "Hello!"))
    // Response
    .use(req => 
        new Response(req.data));