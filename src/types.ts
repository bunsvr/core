import { Server } from "bun";

/**
 * Run next middleware
 */
export interface NextFunction {
    (): Promise<void>;
}

/**
 * App request object
 */
export interface AppRequest extends Request {}

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
 * Request context
 */
export interface AppContext<App> extends Record<string | number | symbol, any> {
    /**
     * Incoming request
     */
    readonly request: AppRequest;

    /**
     * Response details
     */
    readonly response: AppResponse;

    /**
     * Current Bun.js server
     */
    readonly server: Server;

    /**
     * Current app
     */
    readonly app: App;
}

/**
 * Middleware function
 */
export interface Middleware<App> {
    (ctx: AppContext<App>, next: NextFunction): Promise<void>;
}