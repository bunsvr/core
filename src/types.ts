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
 * Request context
 */
export interface AppContext {
    readonly request: Request;
    readonly response: AppResponse;
    readonly server: Server;
}

/**
 * Middleware function
 */
export interface Middleware {
    (ctx: AppContext, next: NextFunction): any;
}