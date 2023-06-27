import type { Response } from '../types'

export class ServerSideError extends Error {
    public constructor(message?: string, public response?: Response) {
        super(message)
    }
}
