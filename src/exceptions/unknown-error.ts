import type { Response } from '../types'

export class UnknownError extends Error {
    public constructor(message?: string, public code?: number, public response?: Response) {
        super(message)
    }
}
