import * as React from 'react'

import { fetchTweet } from './tweet_fetcher'
import { Tweet } from './tweet';

const exampleTweet = 'https://twitter.com/realDonaldTrump/status/949070800417640454'

const parseUrl = (url: string): { userId: string, statusId: string } | undefined => {
    const match = url.match(/^https:\/\/twitter.com\/([^\\]+)\/status\/(\d+)$/)
    if (!match) {
        return undefined
    }
    return {
        userId: match[1],
        statusId: match[2]
    }
}

interface TweetSelectViewProps {
    onDidSelectTweet(tweet: Tweet): void
}

interface TweetSelectViewState {
    value: string
    loading: boolean
    error?: string
}

export class TweetSelectView extends React.Component<TweetSelectViewProps, TweetSelectViewState> {

    constructor(props: TweetSelectViewProps) {
        super(props)
        this.state = {
            loading: false,
            value: exampleTweet,
            error: undefined
        }
    }

    render() {
        return (
            <div className='tweet-select-view'>
                <h1>
                    One change.<br />
                    Make it count.
                </h1>

                <div className='tweet-selector'>
                    <h2>Enter tweet url</h2>
                    <div>{this.state.error}</div>
                    <input
                        type='text'
                        placeholder={exampleTweet}
                        value={this.state.value}
                        onChange={e => this.onChange(e)}
                        onKeyPress={e => this.onKeyPress(e)} />
                </div>
            </div>
        )
    }

    private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({
            value: event.target.value,
            error: undefined
        })
    }

    private onKeyPress(event: React.KeyboardEvent<HTMLInputElement>): void {
        if (event.key === 'Enter') {
            this.tryLoadTweet(this.state.value)
            return
        }
    }

    private tryLoadTweet(url: string) {
        const parsedUrl = parseUrl(url)
        if (!parsedUrl) {
            this.setState({
                loading: false,
                error: 'Invalid status url'
            })
            return
        }

        this.setState({ loading: true, error: '' })
        fetchTweet(parsedUrl.userId, parsedUrl.statusId)
            .then(tweet => {
                this.setState({ loading: false, error: '' })
                this.props.onDidSelectTweet(tweet)
            })
            .catch(() => {
                this.setState({ loading: false, error: 'Could not load tweet' })
            })
    }
}
