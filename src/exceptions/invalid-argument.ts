import type { Response } from '../types'

export class InvalidArgument extends Error {
    constructor(message?: string, public response?: Response) {
        super(message)
    }
}
