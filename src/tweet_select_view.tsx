import * as React from 'react'

import { fetchTweet } from './tweet_fetcher'
import { EditedTweet } from './tweet';

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
    onDidSelectTweet(tweet: EditedTweet): void
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
            <div>
                Enter tweet url
                <input
                    type='text'
                    placeholder={exampleTweet}
                    value={this.state.value}
                    onChange={e => this.onChange(e)}
                    onKeyPress={e => this.onKeyPress(e)} />
            </div>
        )
    }

    private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ value: event.target.value })
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
