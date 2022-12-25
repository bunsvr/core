import { 
    file,
    Server, 
    TLSOptions, 
    ServerWebSocket, 
    WebSocketServeOptions, 
    ServeOptions,
    env
} from "bun";
import { Middleware, AppContext } from "./types";
import { formatBody } from "./parsers";

/**
 * Default response
 * @param ctx 
 * @returns 
 */
export function response(ctx: AppContext) {
    return new Response(formatBody(ctx.response.body), ctx.response);
};

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
        this.port = env.PORT || 8080;
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
    async icon(path: string) {
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

        const ctx = { 
            request, 
            response: {}, 
            server
        };

        // Custom validate
        const response = await this.validate(ctx);
        if (response)
            return response as unknown as Response;

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
        return response(ctx);
    }

    /**
     * Error handler. Change this to change how server handles error
     * 
     * Handles errors in middlewares
     * @param err 
     * @param ctx 
     */
    catch(err: any, ctx: AppContext): Promise<void>;
    async catch(err: any) {  
        throw err;
    }

    /**
     * Validate the request before running middlewares
     * 
     * If validate returns a Response object or a "truthy" object then it is used to response
     * 
     * If validate returns a "falsy" object then start other steps
     * 
     * The validator is run before context creation for better performance when using WebSocket cuz in WebSocket you don't need an AppContext
     * @param request 
     */
    validate(ctx: AppContext): Promise<boolean | void | null | undefined | Response>;
    async validate() {}
}

export default App;
export * from "./types";