import { Change } from './change'
import { SymbolIndex, SymbolString } from './symbol_string';

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
            new SymbolString(originalText),
            undefined
        )
    }

    private constructor(
        public readonly userId: string,
        public readonly statusId: string,
        public readonly originalText: SymbolString,
        public readonly change: Change | undefined
    ) { }

    public get editedText(): SymbolString {
        if (!this.change) {
            return this.originalText
        }
        return this.originalText.replaceSymbolAt(this.change.offset, this.change.insertion)
    }

    public toEditedSymbolIndex(charIndex: number): SymbolIndex {
        const characters = this.editedText.symbols
        let currentCharIndex = 0
        let symbolIndex = 0
        for (const char of characters) {
            if (charIndex < currentCharIndex + char.length) {
                return SymbolIndex.create(symbolIndex)
            }
            currentCharIndex += char.length
            ++symbolIndex
        }

        return SymbolIndex.create(charIndex)
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