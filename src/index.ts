import { 
    file,
    Server, 
    TLSOptions, 
    ServerWebSocket, 
    WebSocketServeOptions, 
    ServeOptions,
    env
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
    catch(err: any, ctx: AppContext, app: App): Promise<void>;

    /**
     * Validate the request before running middlewares.
     * 
     * If validate returns a Response object or a "truthy" object then it is used to response.
     * 
     * If validate returns a "falsy" object then start other steps.
     * @param ctx The current context
     */
    validate(ctx: AppContext, app: App): Promise<ValidateResult>;

    /**
     * Response after running middlewares. Change this to change the response returned.
     * @param ctx The current context
     */
    response(ctx: AppContext, app: App): Promise<Response>;
};

/**
 * A Bunsvr app
 */
class App {
    private mds: Middleware[];
    private ico?: ArrayBuffer;

    /**
     * Create an app that can be served using Bun.
     */
    constructor() {
        this.mds = [];
        // @ts-ignore
        this.port = env.PORT || 8080;
    }

    /**
     * Register a middleware
     * @param m The middleware to add
     */
    use(m: Middleware) {
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

    private async runMiddleware(index: number, ctx: AppContext) {
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
            server
        };

        // Custom validate
        const response = await this.validate(ctx, this);
        if (response)
            return response as unknown as Response;

        // Run middleware and catch errors
        try {
            await this.runMiddleware(0, ctx);
        } catch (e) {
            await this.catch(e, ctx, this);
        }

        // Custom response
        return this.response(ctx, this);
    }

    // Default handlers
    async response(ctx: AppContext) {
        return App.response(ctx);
    }
    async catch(err: any) {  
        throw err;
    }
    async validate(ctx: AppContext) {
        return App.validate(ctx, this);
    }

    /**
     * The default response handler
     * @param ctx The current context
     * @returns A response
     */
    static response(ctx: AppContext) {
        return new Response(formatBody(ctx.response.body), ctx.response);
    };

    /**
     * The default validate handler
     * @param ctx The current context
     * @param app The app
     * @returns 
     */
    static validate(ctx: AppContext, app: App): ValidateResult {
        const path = ctx.request.url.match(urlRegex);
        if (app.ico && path[2] === "/favicon.ico")
            return new Response(app.ico);
    }
}

export { App };
export * from "./types";