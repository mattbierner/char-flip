import * as React from 'react'
import * as immutable from 'immutable'
import { Editor, EditorState, ContentState, SelectionState, ContentBlock, CharacterMetadata } from 'draft-js'

import { EditedTweet } from './edited_tweet'


interface TweetProps {
    tweet: EditedTweet
    onChangeTweet(edited: EditedTweet): void
}

interface TweetState {
    editorState: EditorState

}

const styleMap = {
    changed: {
        background: 'lightgreen',
    },
    selected: {
        boxShadow: 'inset 0 0 3px gray',
        animation: 'cursor-blink 1s ease-in 0.3s infinite'
    }
};

export class TweetEditor extends React.Component<TweetProps, TweetState> {
    constructor(props: TweetProps) {
        super(props)

        this.state = {
            editorState: EditorState.createWithContent(this.newContentForEdited(props.tweet))
        }
    }

    render() {
        return (
            <div className='editable-tweet'>
                <Editor
                    editorState={this.state.editorState}
                    onChange={s => this.onChange(s)}
                    onEscape={() => this.onEscape()}
                    handleBeforeInput={(chars, state) => this.handleBeforeInput(chars, state)}
                    handleKeyCommand={(command, state) => this.handleKeyCommand(command, state)}
                    handleDrop={() => 'handled'}
                    handlePastedText={(text, _, state) => this.handleBeforeInput(text, state)}
                    customStyleMap={styleMap} />
            </div>
        )
    }

    private onChange(editorState: EditorState): void {
        const selection = editorState.getSelection()

        const newState = EditorState.acceptSelection(
            EditorState.createWithContent(this.newContentForEdited(this.props.tweet, selection)),
            selection)

        this.setState({ editorState: newState })
    }

    private onEscape(): void {
        // Clear selection marker
        const newState = EditorState.acceptSelection(
            EditorState.createWithContent(this.newContentForEdited(this.props.tweet)),
            SelectionState.createEmpty('key'))

        this.setState({ editorState: newState })
    }

    private handleBeforeInput(chars: string, editorState: EditorState): 'not-handled' | 'handled' {
        if (Array.from(chars).length !== 1) {
            return 'handled'
        }

        const selection = editorState.getSelection()
        const offset = this.props.tweet.toEditedSymbolIndex(selection.getStartOffset())
        const edited = this.props.tweet.flipAt(offset, chars)

        const newState = EditorState.acceptSelection(
            EditorState.createWithContent(this.newContentForEdited(edited, selection)),
            selection)

        this.setState({ editorState: newState })
        this.props.onChangeTweet(edited)

        return 'handled'
    }

    private handleKeyCommand(command: string, editorState: EditorState): 'not-handled' | 'handled' {
        if (command === 'backspace') {
            const selection = editorState.getSelection()
            if (this.props.tweet.change && this.props.tweet.toEditedSymbolIndex(selection.getStartOffset()).value === this.props.tweet.change.offset.value) {
                const editedTweet = this.props.tweet.reset()

                const selection = editorState.getSelection()
                const newState = EditorState.acceptSelection(
                    EditorState.createWithContent(this.newContentForEdited(editedTweet, selection)),
                    selection)

                this.setState({ editorState: newState })
                this.props.onChangeTweet(editedTweet)
            }
        }
        return 'handled'
    }

    private newContentForEdited(edited: EditedTweet, selection?: SelectionState) {
        const isAtIndex = (i: number, indexToCheck: number): boolean => {
            if (i === indexToCheck) {
                return true
            }
            const entry = edited.charToSymbolMap[i]
            return entry === indexToCheck
        }

        const empty = immutable.OrderedSet([])
        const selected = immutable.OrderedSet(['selected'])
        const changed = immutable.OrderedSet(['changed'])
        const selectedAndChanged = immutable.OrderedSet(['selected', 'changed'])

        const characterList = immutable.List(edited.editedText.characters.map((_, i) => {
            const s = !!selection && isAtIndex(i, selection.getStartOffset())
            const c = !!edited.change && isAtIndex(i, edited.change.offset.value)
            return CharacterMetadata.create({
                style: s
                    ? (c ? selectedAndChanged : selected)
                    : (c ? changed : empty)
            })
        }))

        const block = new ContentBlock().set('text', edited.editedText.text)
            .set('key', 'root')
            .set('type', 'unstyled')
            .set('characterList', characterList) as ContentBlock;
        return ContentState.createFromBlockArray([block])
    }
}

