import { ResponseError } from './ResponseError';

export class ValidationError extends ResponseError {
    static {
        ValidationError.prototype.name = 'ValidationError';
    }

    public readonly detail: readonly Object[];

    constructor(content: { detail: Object[] }) {
        super(422, content);
        this.detail = content.detail;
    }
}
