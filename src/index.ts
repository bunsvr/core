import {
    Server,
    TLSOptions,
    ServerWebSocket,
    Errorlike,
    GenericServeOptions
} from "bun";
import { Middleware } from "./types";

interface Options<T> extends TLSOptions, Partial<ServerWebSocket>, GenericServeOptions {
    serverNames: Record<string, TLSOptions>;
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

interface App<RequestData, T = any> extends Options<T> { };

function withoutPath(url: URL) {
    return url.protocol + "//" + url.hostname + ":" + url.port;
}

/**
 * A Bunsvr app
 */
class App<RequestData = any> {
    private mds: Middleware<App, RequestData>[];
    // Set URL
    #url: URL;
    #baseURI: string;

    /**
     * Create an app that can be served using Bun.
     */
    constructor() {
        this.#url = new URL("http://localhost:3000");
        this.#baseURI = withoutPath(this.#url);

        this.mds = [];
    }

    /**
     * Parsed base URI
     */
    get url() {
        return this.#url;
    }
    set url(url) {
        this.#url = url;
        this.#baseURI = withoutPath(url);
    }

    /**
     * What URI should be used to make {@link Request.url} absolute?
     *
     * By default, looks at {@link hostname}, {@link port}, and whether or not SSL is enabled to generate one
     *
     * @example
     *```js
     * "http://my-app.com"
     * ```
     *
     * @example
     *```js
     * "https://wongmjane.com/"
     * ```
     *
     * This should be the public, absolute URL – include the protocol and {@link hostname}. If the port isn't 80 or 443, then include the {@link port} too.
     *
     * @example
     * "http://localhost:3000"
     */
    get baseURI() {
        return this.#baseURI;
    }
    set baseURI(baseURI) {
        this.#url = new URL(baseURI);
        this.#baseURI = withoutPath(this.#url);
    }

    /**
     * What port should the server listen on?
     * @default process.env.PORT || "3000"
     */
    set port(port: number | string) {
        this.#url.port = String(port);
        this.#baseURI = withoutPath(this.#url);
    }
    get port() {
        return this.#url.port;
    }

    /**
     * What hostname should the server listen on?
     *
     * @default
     * ```js
     * "0.0.0.0" // listen on all interfaces
     * ```
     * @example
     *  ```js
     * "127.0.0.1" // Only listen locally
     * ```
     * @example
     * ```js
     * "remix.run" // Only listen on remix.run
     * ````
     *
     * note: hostname should not include a {@link port}
     */
    set hostname(hostname: string) {
        this.#url.hostname = hostname;
        this.#baseURI = withoutPath(this.#url);
    }
    get hostname() {
        return this.#url.hostname;
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