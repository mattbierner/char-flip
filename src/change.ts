import { SymbolIndex } from "./symbol_string";

export interface Change {
    /**
     * Offset at which to modify the next character
     */
    offset: SymbolIndex

    insertion: string;
}