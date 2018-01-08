const jsonp = require('jsonp-promise')
const buildUrl = require('build-url')

import { EditedTweet, TweetMetadata } from './tweet'

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

interface TweetContent {
    text: string
    metadata: TweetMetadata
}

const fetchTweetContent = async (authorId: string, statusId: string): Promise<TweetContent> => {
    const tweetOembedUrl = getTweetOembedUrl(authorId, statusId)
    if (!tweetOembedUrl) {
        throw 'invalid'
    }

    const result = await jsonp(tweetOembedUrl).promise
    console.log(result)
    // Trust that twitter done sanitized the tweet already :)
    const div = document.createElement('div')
    div.innerHTML = result.html
    const body = div.querySelector('p')
    if (!body) {
        throw 'Invalid body'
    }

    const links = div.querySelectorAll('a')
    let postDate = ''
    if (links && links.length) {
        postDate = links[links.length - 1].textContent || ''
    }

    return {
        text: body.textContent || '',
        metadata: {
            url: result.url,
            authorId,
            statusId,
            postDate,
            authorName: result.author_name,
            authorUrl: result.author_url
        }
    }
}

export const fetchTweet = async (authorId: string, statusId: string): Promise<EditedTweet> => {
    const content = await fetchTweetContent(authorId, statusId)
    return EditedTweet.create(content.metadata, content.text)
}
