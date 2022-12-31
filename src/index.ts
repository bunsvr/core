import {
    file,
    Server,
    TLSOptions,
    ServerWebSocket,
    WebSocketHandler,
    Errorlike
} from "bun";
import { Middleware } from "./types";

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
     */
    websocket?: WebSocketHandler;

    /**
     * An error handler
     * @param this 
     * @param request 
     * @returns 
     */
    error?(
        this: Server,
        request: Errorlike,
    ): Response | Promise<Response> | undefined | void | Promise<undefined>;

    /**
     * Fetch handler.
     * @param request Incoming request
     * @param server Current Bun.js server
     */
    fetch(
        request: Request,
        server: Server
    ): Promise<Response>;
}

interface App extends Options { };

/**
 * A Bunsvr app
 */
class App<RequestData = any> {
    private mds: Middleware<App, RequestData>[];

    /**
     * App base URI
     */
    baseURI: string;

    /**
     * Create an app that can be served using Bun.
     */
    constructor() {
        this.baseURI = "http://localhost:3000";
        this.mds = [];
    }

    /**
     * Register a middleware
     * @param m The middleware to add
     */
    use(m: Middleware<App, RequestData>) {
        const f = m.bind(this);
        this.mds.push(f);

        // If has only one middleware
        if (!this.fetch)
            this.fetch = f;
        else {
            const mds = this.mds;
            const mdsLen = this.mds.length;

            // Manually set fetch function
            this.fetch = async (request, server) => {
                let res: Response;
                for (let i = 0; i < mdsLen; ++i)
                    /** @ts-ignore */
                    if (res = await mds[i](request, server))
                        return res;
            }
        }
    }
}

export { App };
export * from "./types";