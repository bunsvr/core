function isBlobPart(o: any): o is BlobPart {
    return o instanceof ReadableStream
        || o instanceof ArrayBuffer
        || o instanceof Blob
        || o instanceof SharedArrayBuffer
        || ArrayBuffer.isView(o);
}

export function formatBody(body: any): BodyInit {
    // If body is primitive
    if (typeof body !== "object")
        return String(body);

    // If body is a BodyInit type
    if (isBlobPart(body))
        return body;

    // If body has an user-defined to string
    if (Object.getPrototypeOf(body).toString !== Object.prototype.toString)
        return String(body);

    return JSON.stringify(body);
};