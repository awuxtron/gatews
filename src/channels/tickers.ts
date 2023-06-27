import type { Response } from '../types'
import { Channel } from '../constants'

export interface TickersChannel {
    currency_pair: string
    last: string
    lowest_ask: string
    highest_bid: string
    change_percentage: string
    base_volume: string
    quote_volume: string
    high_24h: string
    low_24h: string
}

export function isTickersChannel(response: Response): response is Response<TickersChannel> {
    return response.channel === Channel.TICKERS
}

export function tickersChannel(currencyPairs: string[]): [string[], boolean] {
    return [currencyPairs, false]
}
