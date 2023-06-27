import type { Channel } from './constants'

export type ChannelType = Channel | `${Channel}`

export interface Auth {
    method: 'api_key'
    KEY: string
    SIGN: string
}

export interface Error {
    code: number
    message: string
}

export interface Request {
    id?: number
    time: number
    channel: string
    event?: 'subscribe' | 'unsubscribe'
    payload?: any
    auth?: Auth
}

export interface Response<R = any> {
    id?: number
    time: number
    channel: string
    event: string
    error?: Error
    result?: R
}
