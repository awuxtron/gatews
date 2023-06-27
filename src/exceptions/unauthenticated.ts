export class Unauthenticated extends Error {
    constructor(message?: string) {
        super(message ?? 'Unauthenticated')
    }
}
