import {
    file,
    Server,
    TLSOptions,
    ServerWebSocket,
    WebSocketHandler
} from "bun";
import { Middleware, AppContext } from "./types";

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

    private faviconPath: string;
    private base_uri: string = "http://localhost:3000";

    /**
     * Create an app that can be served using Bun.
     */
    constructor() {
        this.mds = [];
        this.faviconPath = this.baseURI + "/favicon.ico";
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

    fetch = async (request: Request, server: Server) => {
        if (this.ico && this.faviconPath === request.url)
            return new Response(this.ico);

        const ctx: AppContext<App> = {
            request,
            server,
            app: this,
        };

        let i = -1, res: Response;
        const mdsLen = this.mds.length;
        while (!res && ++i < mdsLen) 
            res = await this.mds[i](ctx);

        return res as Response;
    }
}

export { App };
export * from "./types";