export class SymbolIndex {
    public static create(value: number) {
        return new SymbolIndex(value)
    }

    private constructor(
        public readonly value: number
    ) { }
}

export class SymbolString {
    public readonly text: string
    public readonly symbols: string[]
    public readonly characters: string[]

    constructor(text: string) {
        this.text = text
        this.symbols = Array.from(text)
        this.characters = text.split('')
    }

    public replaceSymbolAt(index: SymbolIndex, newSymbol: string): SymbolString {
        return new SymbolString(
            this.symbols.slice(0, index.value).join('') + newSymbol + this.symbols.slice(index.value + 1).join(''))
    }

    public toSymbolIndex(charIndex: number): SymbolIndex {
        const characters = this.symbols
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

    public toCharacterIndex(symbolIndex: SymbolIndex): number {
        return this.symbols.slice(0, symbolIndex.value)
            .reduce((sum, c) => sum + c.length, 0)
    }
}