import { Server } from "bun";


/**
 * Middleware function
 */
export interface Middleware<App> {
    (this: App, request: Request, server: Server): Promise<any>;
}