export class SymbolIndex {
    public static create(value: number) {
        return new SymbolIndex(value)
    }

    private constructor(
        public readonly value: number
    ) { }
}

export interface Change {
    /**
     * Offset at which to modify the next character
     */
    offset: SymbolIndex

    insertion: string;
}