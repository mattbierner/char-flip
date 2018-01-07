const jsonp = require('jsonp-promise')
const buildUrl = require('build-url')

import { EditedTweet } from './edited_tweet'

const getTweetUrl = (userId: string, statusId: string): string | null => {
    if (!statusId.match(/^\d+$/)) {
        return null
    }
    return `https://twitter.com/${encodeURIComponent(userId)}/status/${encodeURIComponent(statusId)}`
}

const getTweetOembedUrl = (userId: string, statusId: string): string | null => {
    const tweetUrl = getTweetUrl(userId, statusId)
    if (!tweetUrl) {
        return tweetUrl
    }

    return buildUrl('https://publish.twitter.com', {
        path: 'oembed',
        queryParams: {
            url: tweetUrl,
            hide_media: 1,
            omit_script: 1,
            hide_thread: 1,
            dnt: 1
        }
    })
}

const fetchTweetTextContent = async (userId: string, statusId: string): Promise<string> => {
    const tweetOembedUrl = getTweetOembedUrl(userId, statusId)
    if (!tweetOembedUrl) {
        throw 'invalid'
    }

    const result = await jsonp(tweetOembedUrl).promise

    // Trust that twitter done sanitized the tweet already :)
    const div = document.createElement('div')
    div.innerHTML = result.html
    const body = div.querySelector('p')
    if (!body) {
        throw '';
    }
    return body.textContent || ''
}

export const fetchTweet = async (userId: string, statusId: string): Promise<EditedTweet> => {
    const textContent = await fetchTweetTextContent(userId, statusId)
    return EditedTweet.create(userId, statusId, textContent)
}
