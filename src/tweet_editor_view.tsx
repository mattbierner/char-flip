import * as React from 'react'
const copy = require('copy-to-clipboard')

import { Tweet } from './tweet';
import { TweetEditor } from './tweet_editor';

class TweetDiffInfo extends React.PureComponent<{ tweet: Tweet }> {
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
                    <span className='diff-char old-char'>{oldChar}</span> ⇨ <span className='diff-char new-char'>{newChar}</span>
                </div>
            </div>
        )
    }
}

class TweetHeader extends React.PureComponent<{ tweet: Tweet }> {
    render() {
        return (
            <div className='tweet-header'>
                <div className='author'>
                    <img className='author-image' src={this.props.tweet.userImageUrl} />
                    <span className='author-name-and-id'>
                        <a className='author-name' href={this.props.tweet.metadata.authorUrl}>{this.props.tweet.metadata.authorName}</a><br />
                        <span className='author-id'>{this.props.tweet.metadata.authorId}</span>
                    </span>
                </div>
                <div className='post-info'>
                    <a className='post-date' href={this.props.tweet.metadata.url}>{this.props.tweet.metadata.postDate}</a>
                    <TweetDiffInfo tweet={this.props.tweet} />
                </div>
            </div>
        )
    }
}

interface ControlsProps {
    tweet: Tweet
    onReset(): void
}

class Controls extends React.Component<ControlsProps, { copyLabel: string }> {
    private readonly standardCopyLabel = 'copy link'

    private copyLabelTimer?: any

    constructor(props: ControlsProps) {
        super(props)

        this.state = {
            copyLabel: this.standardCopyLabel
        }
    }

    componentWillReceiveProps(newProps: ControlsProps) {
        if (newProps.tweet !== this.props.tweet) {
            this.setState({ copyLabel: this.standardCopyLabel })
        }
    }

    render() {
        return (
            <div className='controls'>
                <button
                    title='reset'
                    className='material-button'
                    disabled={!this.props.tweet.change}
                    onClick={this.props.onReset}
                ><i className='material-icons'>undo</i><span className='label'>(reset)</span></button>
                <button
                    title='copy link'
                    disabled={!this.props.tweet.change}
                    onClick={() => this.onShare()}
                ><i className='material-icons'>link</i><span className='label'>({this.state.copyLabel})</span></button>
            </div>
        )
    }
    private onShare(): void {
        if (!this.props.tweet.change) {
            return
        }

        copy(window.location)
        this.setState({ copyLabel: 'copied link to tweet' })

        if (this.copyLabelTimer) {
            clearTimeout(this.copyLabelTimer)
        }

        this.copyLabelTimer = setTimeout(() => {
            this.copyLabelTimer = undefined
            this.setState({ copyLabel: this.standardCopyLabel })
        }, 2000)
    }
}


interface TweetEditorViewProps {
    tweet: Tweet
    onChangeTweet(edited: Tweet): void
}

export class TweetEditorView extends React.Component<TweetEditorViewProps> {
    render() {
        return (
            <div className={'tweet ' + this.getLengthClass(this.props.tweet)}>
                <TweetHeader tweet={this.props.tweet} />

                <TweetEditor
                    tweet={this.props.tweet}
                    onChangeTweet={this.props.onChangeTweet} />

                <div className='tweet-footer'>
                    <Controls
                        tweet={this.props.tweet}
                        onReset={() => this.onReset()} />
                </div>
            </div>
        )
    }

    private onReset(): void {
        this.props.onChangeTweet(this.props.tweet.reset())
    }

    private getLengthClass(tweet: Tweet) {
        const len = tweet.originalText.symbols.length
        if (len < 80) {
            return 'len-80'
        } else if (len < 160) {
            return 'len-160'
        }
    }
}
