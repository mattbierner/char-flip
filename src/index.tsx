import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { fetchTweet } from './tweet_fetcher'
import { Tweet } from './tweet';
import { TweetSelectView } from './tweet_select_view'
import { TweetEditorView } from './tweet_editor_view'
import { PageHeader } from './header'
import { LoadingSpinner } from './loading_spinner'
import { PersistedState } from './persist_state';

enum Stage {
    Initial,
    SelectTweet,
    Editor
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
                .catch(() => {
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
