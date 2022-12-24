import { RequestBody, RequestURL } from "./types";

export function parseURL(url: string): RequestURL {
    const parsed = new URL(url);

    return {
        href: parsed.href,
        protocol: parsed.protocol,
        domain: parsed.hostname,
        path: parsed.pathname,
        fragment: parsed.hash,
        port: Number(parsed.port),
        query: parsed.searchParams.entries(),
    }
};

export function parseBody(req: Request): RequestBody {
    return {
        stream: req.body,
        get buffers() {
            return req.arrayBuffer();
        },
        get json() {
            return req.json();
        },
        get blob() {
            return req.blob();
        },
        get text() {
            return req.text();
        }
    };
};

export function formatBody(body: any): BodyInit {
    // If body is primitive
    if (typeof body !== "object")
        return String(body);

    // If body is a BodyInit type
    if (
        body instanceof ReadableStream 
        || body instanceof ArrayBuffer 
        || body instanceof Blob 
        || body instanceof SharedArrayBuffer
        || ArrayBuffer.isView(body)
    )
        return body;

    // If body has an user-defined to string
    if (Object.getPrototypeOf(body).toString !== Object.prototype.toString)
        return String(body);

    return JSON.stringify(body);
};