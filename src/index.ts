import { 
    file,
    Server, 
    TLSOptions, 
    ServerWebSocket, 
    WebSocketServeOptions, 
    ServeOptions 
} from "bun";
import { Middleware, AppContext } from "./types";
import createCtx from "./createCtx";
import { formatBody } from "./parsers";

interface App extends TLSOptions, Partial<ServerWebSocket>, Partial<WebSocketServeOptions>, Partial<ServeOptions> {
    serverNames: Record<string, TLSOptions>;
};

class App {
    private mds: Middleware[];
    ico: Response;

    /**
     * Create an app that can be served using Bun
     */
    constructor() {
        this.mds = [];
        // @ts-ignore
        this.port = process.env.PORT || 8080;
        this.ico = new Response();
    }

    /**
     * Add a middleware
     * @param m 
     */
    use(m: Middleware) {
        this.mds.push(m);
    }

    /**
     * Set an icon. 
     * 
     * By default an empty Response is returned for 
     * every favicon request.
     * @param path 
     */
    async icon(path?: string) {
        this.ico = new Response(file(path).readable);
    }

    /**
     * Run a middleware
     * @param index 
     * @param ctx 
     */
    private async runMiddleware(index: number, ctx: AppContext) {
        if (index >= this.mds.length || index < 0)
            return;

        return this.mds[index](
            ctx,
            async () => this.runMiddleware(index + 1, ctx)
        );
    }

    /**
     * Fetch
     * @param request 
     * @param server 
     */
    fetch = async (request: Request, server: Server) => {
        if (request.url.endsWith("favicon.ico"))
            return this.ico;

        // Custom validate
        const response = await this.validate(request, server);
        if (response !== true)
            return response as unknown as Response;

        const ctx = createCtx(request, server);

        // Run middleware and catch errors
        try {
            await this.runMiddleware(0, ctx);
        } catch (e) {
            await this.catch(e, ctx);
        }

        // Custom response
        return this.response(ctx);
    }

    /**
     * Response after running middlewares. Change this to change the response returned
     * @param ctx
     */
    async response(ctx: AppContext) {
        return new Response(formatBody(ctx.response.body), ctx.response);
    }

    /**
     * Error handler. Change this to change how server handles error
     * 
     * Handles errors in middlewares
     * @param err 
     * @param ctx 
     */
    async catch(err: any, ctx: AppContext) {
        console.error(err);
        ctx.response.status = 500;
    }

    /**
     * Validate the request before creating request context
     * 
     * If validate returns a Response object then it is used to response
     * 
     * If validate returns true then start other steps
     * 
     * The validator is run before context creation for better performance when using WebSocket cuz in WebSocket you don't need an AppContext
     * @param request 
     */
    validate(request: Request, server: Server): Promise<boolean | void | null | undefined | Response>;

    // Default implementation returns true
    async validate() {
        return true;
    }
}

export default App;
export * from "./types";