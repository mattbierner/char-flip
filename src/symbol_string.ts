export class SymbolIndex {
    public static create(value: number) {
        return new SymbolIndex(value)
    }

    private constructor(
        public readonly value: number
    ) { }

    public equals(other: SymbolIndex): boolean {
        return this.value === other.value
    }
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
        let currentCharIndex = 0
        let symbolIndex = 0
        for (const symbol of this.symbols) {
            if (charIndex < currentCharIndex + symbol.length) {
                return SymbolIndex.create(symbolIndex)
            }
            currentCharIndex += symbol.length
            ++symbolIndex
        }

        return SymbolIndex.create(currentCharIndex)
    }
}