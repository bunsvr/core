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
 * Request context
 */
export interface AppContext {
    /**
     * Incoming request
     */
    readonly request: Request;

    /**
     * Response details
     */
    readonly response: AppResponse;

    /**
     * Current Bun.js server
     */
    readonly server: Server;
}

/**
 * Middleware function
 */
export interface Middleware {
    (ctx: AppContext, next: NextFunction): Promise<void>;
}

/**
 * App.validate result.
 */
export type ValidateResult = boolean | void | null | undefined | Response;