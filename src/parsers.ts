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