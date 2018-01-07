import * as React from 'react'
const copy = require('copy-to-clipboard')

import { EditedTweet } from './edited_tweet';
import { TweetEditor } from './tweet_editor';

class TweetDiffInfo extends React.Component<{ tweet: EditedTweet }> {
    render() {
        const { tweet } = this.props
        if (!tweet.change) {
            return <div></div>
        }

        const oldChar = tweet.originalText.symbols[tweet.change.offset.value]
        const newChar = tweet.change.insertion
        return (
            <div className='tweet-diff-info'>
                <div>
                    <span className='diff-char'>{oldChar}</span> --> <span className='diff-char'>{newChar}</span>
                </div>
                <div>
                    <span>{tweet.change.offset.value}</span>
                </div>
            </div>
        )
    }
}

class Controls extends React.Component<{ tweet: EditedTweet, onReset: () => void }> {
    render() {
        return (
            <div className='controls'>
                <button
                    disabled={!this.props.tweet.change}
                    onClick={this.props.onReset}
                >Reset</button>
                <button
                    disabled={!this.props.tweet.change}
                    onClick={() => this.onShare()}
                >share</button>
            </div>
        )
    }
    private onShare(): void {
        if (!this.props.tweet.change) {
            return
        }

        copy(window.location)
    }
}


interface TweetEditorViewProps {
    tweet: EditedTweet
    onChangeTweet(edited: EditedTweet): void
}

export class TweetEditorView extends React.Component<TweetEditorViewProps> {
    render() {
        return (
            <div>
                <TweetEditor
                    tweet={this.props.tweet}
                    onChangeTweet={this.props.onChangeTweet} />
                <TweetDiffInfo
                    tweet={this.props.tweet} />
                <Controls
                    tweet={this.props.tweet}
                    onReset={() => this.onReset()} />
            </div>
        )
    }

    private onReset(): void {
        this.props.onChangeTweet(this.props.tweet.reset())
    }
}
