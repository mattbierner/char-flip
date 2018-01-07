import * as React from 'react'
import * as ReactDOM from 'react-dom'
import queryString = require('query-string');

import { fetchTweet } from './tweet_fetcher'
import { EditedTweet } from './edited_tweet';
import { TweetSelectView } from './tweet_select_view';
import { TweetEditorView } from './tweet_editor_view';

enum Stage {
    Initial,
    SelectTweet,
    Editor
}

class PersistedState {
    public static readonly currentVersion = 1

    private constructor(
        public readonly userId: string,
        public readonly statusId: string,
        public readonly offset: number | undefined,
        public readonly insertion: string | undefined
    ) { }

    public static tryGetFromQueryString(): PersistedState | undefined {
        const qs = queryString.parse(location.search)
        if (isNaN(qs.version) || !qs.userId || !qs.statusId) {
            return undefined
        }

        if (+qs.version !== PersistedState.currentVersion) {
            return undefined
        }

        return new PersistedState(
            qs.userId,
            qs.statusId,
            isNaN(qs.offset) ? undefined : +qs.offset,
            qs.insertion
        )
    }

    public static persist(tweet: EditedTweet): void {
        const qs = queryString.stringify({
            version: PersistedState.currentVersion,
            userId: tweet.userId,
            statusId: tweet.statusId,
            offset: tweet.change ? tweet.change.offset : undefined,
            insertion: tweet.change ? tweet.change.insertion : undefined
        })

        history.replaceState(null, '', window.location.pathname + '?' + qs);
    }
}

interface MainState {
    stage: Stage,
    tweet?: EditedTweet
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
            fetchTweet(persistedState.userId, persistedState.statusId)
                .then(tweet => {
                    if (typeof persistedState.offset !== 'undefined' && typeof persistedState.insertion !== 'undefined') {
                        tweet = tweet.flipAt(persistedState.offset, persistedState.insertion)
                    }

                    this.setState({
                        tweet,
                        stage: Stage.Editor
                    })
                })
                .catch(() => {
                    this.setState({
                        stage: Stage.SelectTweet
                    })
                })
        } else {
            this.setState({ stage: Stage.SelectTweet })
        }
    }

    render() {
        if (this.state.stage === Stage.SelectTweet) {
            return (
                <div className='content'>
                    <TweetSelectView
                        onDidSelectTweet={tweet => this.onUpdateTweet(tweet)} />
                </div>
            )
        }

        if (this.state.stage === Stage.Editor) {
            return (
                <div className='content'>
                    <TweetEditorView
                        tweet={this.state.tweet!}
                        onChangeTweet={tweet => this.onUpdateTweet(tweet)} />
                </div>
            )
        }

        return (
            <div className='content'>Loading</div>
        )
    }

    private onUpdateTweet(tweet: EditedTweet): void {
        this.setState({ tweet, stage: Stage.Editor })
        PersistedState.persist(tweet)
    }

}

ReactDOM.render(
    <Main />,
    document.getElementById('main'))
