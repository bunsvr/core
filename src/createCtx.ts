import { Server } from "bun";
import { AppContext } from "./types";
import { parseBody, parseURL } from "./parsers";

export default function createCtx(req: Request, server: Server) {
    const ctx: AppContext = { 
        request: {
            value: req,
            url: parseURL(req.url),
            body: parseBody(req),
            headers: req.headers,
            cache: req.cache,
            credentials: req.credentials,
            dest: req.destination,
            integrity: req.integrity,
            keepAlive: req.keepalive,
            method: req.method,
            mode: req.mode,
            redirect: req.redirect,
            referrer: {
                value: req.referrer,
                policy: req.referrerPolicy,
            },
            signal: req.signal
        }, response: {}, server
    };

    return ctx;
};