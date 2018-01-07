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
}