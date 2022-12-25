import { Server } from "bun";
import { AppContext } from "./types";

export default function createCtx(req: Request, server: Server) {
    const ctx: AppContext = { 
        request: req, response: {}, server
    };

    return ctx;
};