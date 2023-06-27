import { EventEmitter } from 'events'
import type { ClientOptions, RawData } from 'ws'
import { WebSocket } from 'ws'
import type { ChannelType, Request, Response } from './types'
import { InvalidArgument, InvalidRequestBody, ServerSideError, Unauthenticated, UnknownError } from './exceptions'
import { createHmac } from 'crypto'
import type { ChannelPayload } from './channels'
import { channels } from './channels'

export interface WebSocketClientOptions {
    autoConnect?: boolean
    baseUrl?: string
    apiKey?: string
    apiSecret?: string
    websocket?: ClientOptions & { protocols?: string | string[] }
}

let id = 0

export class WebSocketClient extends EventEmitter {
    public readonly baseUrl: string
    public readonly options: WebSocketClientOptions

    public socket?: WebSocket

    public constructor(options: WebSocketClientOptions = {}) {
        super()

        this.options = options
        this.baseUrl = options.baseUrl ?? 'wss://api.gateio.ws/ws/v4/'

        if (options.autoConnect) {
            this.connect()
        }
    }

    public connect() {
        const { protocols = [], ...options } = this.options.websocket ?? {}
        const ws = new WebSocket(this.baseUrl, protocols, options)

        ws.on('ping', () => {
            ws.pong()
        })

        ws.on('open', () => {
            this.socket = ws
            this.emit('open')
        })

        ws.on('close', () => {
            this.socket = undefined
            this.emit('close')
        })

        ws.on('error', (error) => {
            this.emit('error', error)
        })

        ws.on('message', this.onMessage.bind(this))

        return ws
    }

    public close(code?: number, data?: string) {
        if (!this.socket) {
            return
        }

        this.socket.close(code, data)
    }

    public send(channel: ChannelType, event?: Request['event'], payload?: any, auth?: boolean) {
        if (!this.socket) {
            throw new Error('WebSocket is not ready')
        }

        const request: Request = {
            id: ++id,
            time: Math.floor(Date.now() / 1000),
            channel,
        }

        if (event) {
            request.event = event
        }

        if (payload) {
            request.payload = payload
        }

        if (auth) {
            if (!this.options.apiKey || !this.options.apiSecret) {
                throw new Unauthenticated('API Key and Secret are required')
            }

            const signer = createHmac('sha512', this.options.apiSecret)
            const signature = `channel=${channel}&event=${event}&time=${request.time}`

            request.auth = {
                method: 'api_key',
                KEY: this.options.apiKey,
                SIGN: signer.update(new Buffer(signature, 'utf8')).digest('hex'),
            }
        }

        return this.socket.send(JSON.stringify(request))
    }

    public subscribe<C extends keyof typeof channels>(channel: C, ...args: ChannelPayload<C>) {
        const [payload, auth] = channels[channel](...(args as [any]))

        return this.send(channel, 'subscribe', payload, auth)
    }

    public unsubscribe<C extends keyof typeof channels>(channel: C, ...args: ChannelPayload<C>) {
        const [payload, auth] = channels[channel](...(args as [any]))

        return this.send(channel, 'unsubscribe', payload, auth)
    }

    protected onMessage(message: RawData) {
        if (message instanceof ArrayBuffer) {
            message = Buffer.from(message)
        }

        const response: Response = JSON.parse(message.toString())

        if (response.error) {
            return this.emit('error', this.parseResponseError(response))
        }

        return this.emit('message', response)
    }

    protected parseResponseError(response: Response) {
        if (!response.error) {
            throw new Error('Response is not an error')
        }

        switch (response.error.code) {
            case 1:
                return new InvalidRequestBody(response.error.message, response)
            case 2:
                return new InvalidArgument(response.error.message, response)
            case 3:
                return new ServerSideError(response.error.message, response)
            default:
                return new UnknownError(response.error.message, response.error.code, response)
        }
    }
}
