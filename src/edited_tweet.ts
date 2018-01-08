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

export class EditedTweet {
    private _charToSymbolMap?: number[]

    public static create(metadata: TweetMetadata, text: string) {
        return new EditedTweet(
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

    public get editedText(): SymbolString {
        if (!this.change) {
            return this.originalText
        }
        return this.originalText.replaceSymbolAt(this.change.offset, this.change.insertion)
    }

    public get charToSymbolMap(): number[] {
        if (!this._charToSymbolMap) {
            // Hacky: We operate on symbols while js splits unicode/emoji
            // Create mapping between these
            this._charToSymbolMap = this.editedText.symbols
                .reduce((p, text) => {
                    const split = text.split('')
                    p.sum.push(...split.map(() => p.offset))
                    return {
                        offset: p.offset += split.length,
                        sum: p.sum
                    }
                }, { offset: 0, sum: [] as number[] }).sum
        }
        return this._charToSymbolMap;
    }

    public flipAt(offset: SymbolIndex, key: string): EditedTweet {
        if (this.originalText.symbols[offset.value] === key) {
            return new EditedTweet(this.metadata, this.originalText, undefined)
        }

        return new EditedTweet(this.metadata, this.originalText, {
            offset,
            insertion: key
        })
    }

    public reset(): EditedTweet {
        if (!this.change) {
            return this
        }

        return new EditedTweet(this.metadata, this.originalText, undefined);
    }
}