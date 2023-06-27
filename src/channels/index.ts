import { Channel } from '../constants'
import { tickersChannel } from './tickers'

export * from './tickers'

export const channels = <const>{
    [Channel.TICKERS]: tickersChannel,
}

export type ChannelPayload<C extends keyof typeof channels> = Parameters<(typeof channels)[C]>
