import queryString = require('query-string')
const debounce = require('lodash.debounce')

import { SymbolIndex } from './symbol_string'
import { Tweet } from './tweet';

const replaceQueryString = debounce((qs: string) => {
    history.replaceState(null, '', window.location.pathname + '?' + qs)
}, 200)


export class PersistedState {
    public static readonly currentVersion = 1

    private constructor(
        public readonly authorId: string,
        public readonly statusId: string,
        public readonly offset: SymbolIndex | undefined,
        public readonly insertion: string | undefined
    ) { }

    public static tryGetFromQueryString(): PersistedState | undefined {
        const qs = queryString.parse(location.search)
        if (isNaN(qs.version) || !qs.authorId || !qs.statusId) {
            return undefined
        }

        if (+qs.version !== PersistedState.currentVersion) {
            return undefined
        }

        if (isNaN(qs.offset) || Array.from(qs.insertion).length !== 1) {
            return new PersistedState(
                qs.authorId,
                qs.statusId,
                undefined,
                undefined)
        }

        return new PersistedState(
            qs.authorId,
            qs.statusId,
            SymbolIndex.create(+qs.offset),
            qs.insertion
        )
    }

    public static persist(tweet: Tweet): void {
        try {
            replaceQueryString(PersistedState.getQueryString(tweet))
        } catch {
            // noop
        }
    }

    public static getUrl(tweet: Tweet) {
        return window.location.origin + window.location.pathname + '?' + PersistedState.getQueryString(tweet)
    }

    public static getQueryString(tweet: Tweet): string {
        return queryString.stringify({
            version: PersistedState.currentVersion,
            authorId: tweet.metadata.authorId,
            statusId: tweet.metadata.statusId,
            offset: tweet.change ? tweet.change.offset.value : undefined,
            insertion: tweet.change ? tweet.change.insertion : undefined
        })
    }
}
