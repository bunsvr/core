import {
    file,
    Server,
    TLSOptions,
    ServerWebSocket,
    WebSocketHandler
} from "bun";
import { Middleware, AppContext } from "./types";
import { formatBody } from "./parsers";

interface Options extends TLSOptions, Partial<ServerWebSocket> {
    serverNames: Record<string, TLSOptions>;

    /**
     * What is the maximum size of a request body? (in bytes)
     * @default 1024 * 1024 * 128 // 128MB
     */
    maxRequestBodySize?: number;

    /**
     * Render contextual errors? This enables bun's error page
     * @default process.env.NODE_ENV !== 'production'
     */
    development?: boolean;

    /**
     * Enable websockets with {@link Bun.serve}
     *
     * For simpler type safety, see {@link Bun.websocket}
     *
     * @example
     * ```js
     *import { serve, websocket } from "bun";
     *serve({
     *  websocket: websocket({
     *    open: (ws) => {
     *      console.log("Client connected");
     *    },
     *    message: (ws, message) => {
     *      console.log("Client sent message", message);
     *    },
     *    close: (ws) => {
     *      console.log("Client disconnected");
     *    },
     *  }),
     *  fetch(req, server) {
     *    if (req.url === "/chat") {
     *      const upgraded = server.upgrade(req);
     *      if (!upgraded) {
     *        return new Response("Upgrade failed", { status: 400 });
     *      }
     *    }
     *    return new Response("Hello World");
     *  },
     *});
     *```
     * Upgrade a {@link Request} to a {@link ServerWebSocket} via {@link Server.upgrade}
     *
     * Pass `data` in @{link Server.upgrade} to attach data to the {@link ServerWebSocket.data} property
     *
     *
     */
    websocket?: WebSocketHandler;
}

interface App extends Options {
    /**
     * Fetch handler.
     * @param request Incoming request
     * @param server Current Bun.js server
     */
    fetch(request: Request, server: Server): Promise<Response>;

    /**
     * Response after running middlewares. Change this to change the response returned.
     * @param ctx The current context
     */
    response(ctx: AppContext<App>): Promise<any> | any;
};

/**
 * A Bunsvr app
 */
class App {
    private mds: Middleware<App>[];
    private faviconPath: string;

    /**
     * App icon loaded in ArrayBuffer
     */
    ico?: ArrayBuffer;

    /**
     * App base URI
     */
    private base_uri: string = "http://localhost:3000";

    /**
     * Create an app that can be served using Bun.
     */
    constructor() {
        this.mds = [];
        this.faviconPath = this.baseURI + "/favicon.ico";

        this.response = App.response;
    }

    /**
     * Get the base URI of the app
     */
    get baseURI() {
        return this.base_uri;
    }

    /**
     * Set the base URI of the app
     */
    set baseURI(value: string) {
        this.base_uri = value;
        this.faviconPath = value + "/favicon.ico";
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
        const ico = this.ico;
        if (ico && this.faviconPath === request.url)
            return new Response(ico);

        const ctx: AppContext<App> = {
            request,
            response: {},
            server,
            app: this,
        };

        // Run middleware
        await this.runMiddleware(0, ctx);

        // Custom response
        return this.response(ctx) as Response;
    }

    /**
     * The default response handler
     * @param ctx The current context
     * @returns A response
     */
    static response(ctx: AppContext<App>) {
        return new Response(formatBody(ctx.response.body), ctx.response);
    };
}

export { App };
export * from "./types";