export class ResponseError extends Error {
    static {
        ResponseError.prototype.name = 'Error';
    }

    public readonly status: number;

    public readonly content: unknown;

    constructor(status: number, content: unknown) {
        super(`Status code ${status}`);
        this.status = status;
        this.content = content;
    }
}
