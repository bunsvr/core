import { 
    file,
    Server, 
    TLSOptions, 
    ServerWebSocket, 
    WebSocketServeOptions, 
    ServeOptions
} from "bun";
import { Middleware, AppContext, ValidateResult } from "./types";
import { formatBody } from "./parsers";

const urlRegex = /^(.*):\/\/[A-Za-z0-9:.]*([\/]{1}.*\/?)$/;

interface Options extends TLSOptions, Partial<ServerWebSocket>, Partial<WebSocketServeOptions>, Partial<ServeOptions> {
    serverNames: Record<string, TLSOptions>;
}

interface App extends Options {
    /**
     * Fetch handler.
     * @param request Incoming request
     * @param server Current Bun.js server
     */
    fetch(request: Request, server: Server): Promise<Response>;

    /**
     * Error handler. Change this to change how server handles error.
     * 
     * Handles errors in middlewares.
     * @param err An error occured
     * @param ctx The current context
     */
    catch(err: any, ctx: AppContext<App>): Promise<void>;

    /**
     * Validate the request before running middlewares.
     * 
     * If validate returns a Response object or a "truthy" object then it is used to response.
     * 
     * If validate returns a "falsy" object then start other steps.
     * @param ctx The current context
     */
    validate(ctx: AppContext<App>): Promise<ValidateResult>;

    /**
     * Response after running middlewares. Change this to change the response returned.
     * @param ctx The current context
     */
    response(ctx: AppContext<App>): Promise<Response>;
};

/**
 * A Bunsvr app
 */
class App {
    private mds: Middleware<App>[];

    /**
     * App icon loaded in ArrayBuffer
     */
    ico?: ArrayBuffer;

    /**
     * Create an app that can be served using Bun.
     */
    constructor() {
        this.mds = [];
    }

    /**
     * Register a middleware
     * @param m The middleware to add
     */
    use(m: Middleware<App>) {
        this.mds.push(m);
    }

    /**
     * Set an icon. 
     * 
     * By default an empty Response is returned for 
     * every favicon request.
     * @param path The icon path
     */
    async icon(path: string) {
        this.ico = await file(path).arrayBuffer();
    }

    private async runMiddleware(index: number, ctx: AppContext<App>) {
        const fn = this.mds[index];

        return fn && fn(
            ctx,
            async () => this.runMiddleware(index + 1, ctx)
        );
    }

    fetch = async (request: Request, server: Server) => {
        const ctx = { 
            request, 
            response: {}, 
            server,
            app: this,
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

    // Default handlers
    async response(ctx: AppContext<App>) {
        return App.response(ctx);
    }
    async catch(err: any, ctx: AppContext<App>) {  
        return App.catch(err, ctx);
    }
    async validate(ctx: AppContext<App>) {
        return App.validate(ctx);
    }

    /**
     * The default response handler
     * @param ctx The current context
     * @returns A response
     */
    static response(ctx: AppContext<App>) {
        return new Response(formatBody(ctx.response.body), ctx.response);
    };

    /**
     * The default validate handler
     * @param ctx The current context
     */
    static validate(ctx: AppContext<App>): ValidateResult {
        const path = ctx.request.url.match(urlRegex);
        const ico = ctx.app.ico;

        if (ico && path[2] === "/favicon.ico")
            return new Response(ico);
    }
    
    /**
     * The default error handler
     * @param ctx The current context
     */
    static catch(err: any, ctx: AppContext<App>) {
        console.error(err);
        ctx.response.status = 500;
    }
}

export { App };
export * from "./types";