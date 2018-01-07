import { Change } from './change'

export class EditedTweet {
    private _charToSymbolMap?: number[]

    public static create(
        userId: string,
        statusId: string,
        originalText: string
    ) {
        return new EditedTweet(
            userId,
            statusId,
            originalText,
            undefined
        )
    }

    private constructor(
        public readonly userId: string,
        public readonly statusId: string,
        public readonly originalText: string,
        public readonly change: Change | undefined
    ) { }

    public get editedText(): string {
        if (!this.change) {
            return this.originalText
        }
        const tokens = Array.from(this.originalText)
        return tokens.slice(0, this.change.offset).join('') + this.change.insertion + tokens.slice(this.change.offset + 1).join('')
    }

    public get charToSymbolMap(): number[] {
        if (!this._charToSymbolMap) {
            // Hacky: We operate on symbols while js splits unicode/emoji
            // Create mapping between these
            this._charToSymbolMap = Array.from(this.editedText)
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

    public flipAt(offset: number, key: string): EditedTweet {
        if (this.originalText[offset] === key) {
            return new EditedTweet(this.userId, this.statusId, this.originalText, undefined)
        }

        return new EditedTweet(this.userId, this.statusId, this.originalText, {
            offset,
            insertion: key
        })
    }

    public reset(): EditedTweet {
        if (!this.change) {
            return this
        }

        return new EditedTweet(this.userId, this.statusId, this.originalText, undefined);
    }
}