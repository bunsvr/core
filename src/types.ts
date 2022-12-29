import { Server } from "bun";

/**
 * Request context
 */
export interface AppContext<App> extends Record<string | number | symbol, any> {
    /**
     * Incoming request
     */
    readonly request: Request;

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
    (ctx: AppContext<App>): Promise<any>;
}