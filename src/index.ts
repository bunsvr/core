import {
    Server,
    TLSOptions,
    ServerWebSocket,
    Errorlike,
    GenericServeOptions,
    WebSocketHandler
} from "bun";

declare global {
    interface Request<T = any> {
        /**
         * Data object to store some vars through middlewares 
         */
        data?: T;
    }
}

interface Options<T> extends TLSOptions, Partial<ServerWebSocket>, GenericServeOptions {
    serverNames: Record<string, TLSOptions>;

    /**
     * Enable websockets with {@link Bun.serve}
     * 
     * For simpler type safety, see {@link Bun.websocket}
     */
    websocket?: WebSocketHandler<T>;

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

/**
 * Middleware function
 */
export interface Middleware<T = any> {
    /**
     * @param this The current app
     * @param request The current request with a data object
     * @param server The current server
     */
    (this: App, request: Request<T>, server: Server): any;
}

export interface App<T = any> extends Options<T> { };

/**
 * A Stric app
 */
export class App<T = any> {
    private mds: Middleware<T>[];

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
    use(m: Middleware<T>) {
        const f = m.bind(this);
        this.mds.push(f);

        // If has only one middleware
        if (!this.fetch || this.mds.length === 1)
            this.fetch = f;
        else {
            const mdsLen = this.mds.length;

            // Manually set fetch function
            this.fetch = async (request, server) => {
                let res: any;
                for (let i = 0; i < mdsLen; ++i) {
                    /** @ts-ignore */
                    res = this.mds[i](request, server);
                    if (res instanceof Promise) 
                        res = await res;

                    if (res instanceof Response)
                        return res;
                }
            }
        }

        return this;
    }
};