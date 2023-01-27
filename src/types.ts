import { Server } from "bun";

/**
 * An app request
 */
export interface AppRequest<T = any> extends Request {
    /**
     * A data object to pass data through middlewares.
     */
    data?: T;
}

/**
 * Middleware function
 */
export interface Middleware<App, RequestData = any> {
    /**
     * @param this The current app
     * @param request The current request with a data object
     * @param server The current server
     */
    (this: App, request: AppRequest<RequestData>, server: Server): any;
}