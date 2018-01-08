import { Change } from './change'
import { SymbolIndex, SymbolString } from './symbol_string';

export interface TweetMetadata {
    readonly url: string
    readonly statusId: string
    readonly postDate: string
    readonly authorId: string
    readonly authorName: string
    readonly authorUrl: string
}

export class Tweet {
    public static create(metadata: TweetMetadata, text: string) {
        return new Tweet(
            metadata,
            new SymbolString(text),
            undefined
        )
    }

    private constructor(
        public readonly metadata: TweetMetadata,
        public readonly originalText: SymbolString,
        public readonly change: Change | undefined
    ) { }

    public get userImageUrl(): string {
        return `https://avatars.io/twitter/${this.metadata.authorId}`
    }

    public get editedText(): SymbolString {
        if (!this.change) {
            return this.originalText
        }
        return this.originalText.replaceSymbolAt(this.change.offset, this.change.insertion)
    }

    public flipAt(offset: SymbolIndex, key: string): Tweet {
        if (this.originalText.symbols[offset.value] === key || offset.value >= this.originalText.symbols.length) {
            return new Tweet(this.metadata, this.originalText, undefined)
        }

        return new Tweet(this.metadata, this.originalText, {
            offset,
            insertion: key
        })
    }

    public reset(): Tweet {
        if (!this.change) {
            return this
        }

        return new Tweet(this.metadata, this.originalText, undefined);
    }
}