import type { Response } from '../types'

export class InvalidRequestBody extends Error {
    public constructor(message?: string, public response?: Response) {
        super(message)
    }
}
