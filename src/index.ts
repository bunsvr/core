import { 
    file,
    Server, 
    TLSOptions, 
    ServerWebSocket, 
    WebSocketServeOptions, 
    ServeOptions 
} from "bun";
import { Middleware, Context } from "./types";
import createCtx from "./createCtx";
import { formatBody } from "./parsers";

interface App extends TLSOptions, Partial<ServerWebSocket>, Partial<WebSocketServeOptions>, Partial<ServeOptions> {
    serverNames: Record<string, TLSOptions>;
};

class App {
    private mds: Middleware[];
    private iconData: ReadableStream | string;

    /**
     * Create an app that can be served using Bun
     */
    constructor() {
        this.mds = [];
        // @ts-ignore
        this.port = process.env.PORT || 8080;
        this.iconData = "";
    }

    /**
     * Add a middleware
     * @param m 
     */
    use(m: Middleware) {
        this.mds.push(m);
    }

    /**
     * Set an icon. 
     * By default an empty string is returned for 
     * every favicon request.
     * @param path 
     */
    async icon(path: string) {
        this.iconData = file(path).readable;
    }

    /**
     * Run a middleware
     * @param index 
     * @param ctx 
     */
    private async runMiddleware(index: number, ctx: Context) {
        if (index >= this.mds.length || index < 0)
            return;

        return this.mds[index](
            ctx,
            async () => this.runMiddleware(index + 1, ctx)
        );
    }

    /**
     * Fetch
     * @param request 
     * @param server 
     */
    fetch = async (request: Request, server: Server) => {
        if (request.url.endsWith("favicon.ico"))
            return new Response(this.iconData);

        const ctx = createCtx(request, server);

        try {
            await this.runMiddleware(0, ctx);
        } catch (e) {
            await this.catch(e, ctx);
        }

        return this.response(ctx);
    }

    /**
     * Response after running middlewares. Change this to change the response returned
     * @param ctx
     */
    async response(ctx: Context) {
        return new Response(formatBody(ctx.response.body), ctx.response);
    }

    /**
     * Error handler. Change this to change how server handles error
     * Handles errors in middlewares
     * @param err 
     * @param ctx 
     */
    async catch(err: any, ctx: Context) {
        ctx.response.body = err;
    }
}

export default App;
export * from "./types";