export interface Change {
    /**
     * Offset at which to modify the next character
     */
    offset: number

    insertion: string;
}