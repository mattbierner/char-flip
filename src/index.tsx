import * as React from 'react'
import * as ReactDOM from 'react-dom'
import queryString = require('query-string')
const debounce = require('lodash.debounce')

import { fetchTweet } from './tweet_fetcher'
import { Tweet } from './tweet';
import { TweetSelectView } from './tweet_select_view'
import { TweetEditorView } from './tweet_editor_view'
import { SymbolIndex } from './symbol_string'
import { PageHeader } from './header'
import { LoadingSpinner } from './loading_spinner'

enum Stage {
    Initial,
    SelectTweet,
    Editor
}

const replaceQueryString = debounce((qs: string) => {
    history.replaceState(null, '', window.location.pathname + '?' + qs)
}, 200)

class PersistedState {
    public static readonly currentVersion = 1

    private constructor(
        public readonly authorId: string,
        public readonly statusId: string,
        public readonly offset: SymbolIndex | undefined,
        public readonly insertion: string | undefined
    ) { }

    public static tryGetFromQueryString(): PersistedState | undefined {
        const qs = queryString.parse(location.search)
        if (isNaN(qs.version) || !qs.authorId || !qs.statusId) {
            return undefined
        }

        if (+qs.version !== PersistedState.currentVersion) {
            return undefined
        }

        if (isNaN(qs.offset) || Array.from(qs.insertion).length !== 1) {
            return new PersistedState(
                qs.authorId,
                qs.statusId,
                undefined,
                undefined)
        }

        return new PersistedState(
            qs.authorId,
            qs.statusId,
            SymbolIndex.create(+qs.offset),
            qs.insertion
        )
    }

    public static persist(tweet: Tweet): void {
        const qs = queryString.stringify({
            version: PersistedState.currentVersion,
            authorId: tweet.metadata.authorId,
            statusId: tweet.metadata.statusId,
            offset: tweet.change ? tweet.change.offset.value : undefined,
            insertion: tweet.change ? tweet.change.insertion : undefined
        })

        try {
            replaceQueryString(qs)
        } catch {
            // noop
        }
    }
}

interface MainState {
    stage: Stage
    tweet?: Tweet
    initialLoadingError?: string
}

class Main extends React.Component<{}, MainState> {
    constructor(props: {}) {
        super(props)

        this.state = {
            stage: Stage.Initial
        }
    }

    componentWillMount() {
        const persistedState = PersistedState.tryGetFromQueryString()
        if (persistedState) {
            fetchTweet(persistedState.authorId, persistedState.statusId)
                .then(tweet => {
                    if (typeof persistedState.offset !== 'undefined' && typeof persistedState.insertion !== 'undefined') {
                        tweet = tweet.flipAt(persistedState.offset, persistedState.insertion)
                    }

                    this.setState({
                        tweet,
                        stage: Stage.Editor
                    })
                })
                .catch(e => {
                    this.setState({
                        stage: Stage.SelectTweet,
                        initialLoadingError: 'Invalid page'
                    })
                })
        } else {
            this.setState({ stage: Stage.SelectTweet })
        }
    }

    render() {
        let body: any
        if (this.state.stage === Stage.SelectTweet) {
            body = (
                <div className='content'>
                    <TweetSelectView
                        onDidSelectTweet={tweet => this.onUpdateTweet(tweet)}
                        initialError={this.state.initialLoadingError} />
                </div>
            )
        } else if (this.state.stage === Stage.Editor) {
            body = (
                <div className='content'>
                    <TweetEditorView
                        tweet={this.state.tweet!}
                        onChangeTweet={tweet => this.onUpdateTweet(tweet)} />
                </div>
            )
        } else {
            body = (
                <div className='content loading'>
                    <div>
                        <LoadingSpinner active={true} />
                    </div>
                </div>
            )
        }

        return (
            <>
            <PageHeader active={this.state.stage !== Stage.Editor} />
            {body}
            </>
        )
    }

    private onUpdateTweet(tweet: Tweet): void {
        this.setState({ tweet, stage: Stage.Editor })
        PersistedState.persist(tweet)
    }

}

ReactDOM.render(
    <Main />,
    document.getElementById('main'))
