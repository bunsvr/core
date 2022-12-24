import { Server } from "bun";

/**
 * Run next middleware
 */
export interface NextFunction {
    (): Promise<void>;
}

/**
 * App response object
 */
export interface AppResponse extends ResponseInit {
    /**
     * The response body. This can be at any format other than a BlobPart array
     */
    body?: any;
}

/**
 * Request query type
 */
export type RequestQuery = Record<string, string> & IterableIterator<[string, string]>;

/**
 * A parsed request URL
 */
export interface RequestURL {
    /**
     * Full URL
     */
    readonly href: string;

    /**
     * Protocol
     */
    readonly protocol: string;

    /**
     * Full domain
     */
    readonly domain: string;

    /**
     * URL path without query
     */
    readonly path: string;

    /**
     * URL hash or fragment
     */
    readonly fragment: string;

    /**
     * URL port
     */
    readonly port: number;

    /**
     * URL parsed query
     */
    readonly query: RequestQuery;
}

/**
 * Request referrer details
 */
export interface RequestReferrer {
    /**
     * Returns the referrer of request. Its value can be a same-origin URL
     * if explicitly set in init, the empty string to indicate no referrer,
     * and "about:client" when defaulting to the global's default. This is
     * used during fetching to determine the value of the `Referer` header
     * of the request being made.
     */
    readonly value: string;

    /**
     * Returns the referrer policy associated with request. This is used during fetching to compute the value of the request's referrer.
     */
    readonly policy: ReferrerPolicy;
}

/**
 * A request body
 */
export interface RequestBody {
    /**
     * Body in text
     */
    readonly text: Promise<string>;

    /**
     * Body in readable stream
     */
    readonly stream?: ReadableStream;

    /**
     * Body in buffer array
     */
    readonly buffers: Promise<ArrayBuffer>;

    /**
     * Body in json
     */
    readonly json: Promise<any>;

    /**
     * Body in blob
     */
    readonly blob: Promise<Blob>;
}

/**
 * App request object
 */
export interface AppRequest {
    /**
     * URL parts
     */
    readonly url: RequestURL;

    /**
     * Request body
     */
    readonly body: RequestBody;

    /**
     * Returns the request headers
     */
    readonly headers: Headers;

    /**
     * Returns the cache mode associated with request, which is a string indicating how the request will interact with the browser's cache when fetching.
     */
    readonly cache: RequestCache;

    /**
     * Returns the credentials mode associated with request, which is a string indicating whether credentials will be sent with the request always, never, or only when sent to a same-origin URL.
     */
    readonly credentials: RequestCredentials;

    /**
     * Returns the kind of resource requested by request, e.g., "document" or "script".
     *
     * In Bun, this always returns "navigate".
     */
    readonly dest: RequestDestination;

    /**
     * Returns request's subresource integrity metadata, which is a cryptographic hash of the resource being fetched. Its value consists of multiple hashes separated by whitespace. [SRI]
     */
    readonly integrity: string;

    /**
     * Returns a boolean indicating whether or not request can outlive the global in which it was created.
     */
    readonly keepAlive: boolean;

    /**
     * Returns request's HTTP method, which is "GET" by default.
     */
    readonly method: string;

    /**
     * Returns the mode associated with request, which is a string indicating whether the request will use CORS, or will be restricted to same-origin URLs.
     */
    readonly mode: RequestMode;

    /**
     * Returns the redirect mode associated with request, which is a string indicating how redirects for the request will be handled during fetching. A request will follow redirects by default.
     */
    readonly redirect: RequestRedirect;

    /**
     * Referrer object
     */
    readonly referrer: RequestReferrer;

    /**
     * Returns the signal associated with request, which is an AbortSignal object indicating whether or not request has been aborted, and its abort event handler.
     */
    readonly signal: AbortSignal;
}

/**
 * Request context
 */
export interface Context {
    readonly request: AppRequest;
    readonly response: AppResponse;
    readonly server: Server;
}

/**
 * Middleware function
 */
export interface Middleware {
    (ctx: Context, next: NextFunction): any;
}