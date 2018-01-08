import * as React from 'react'
import { setInterval } from 'timers';

const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

const randomChar = () => possible[Math.floor(Math.random() * possible.length)]

interface PageHeaderProps {
    active: boolean
}

interface PageHeaderState {
    index: number
    replacement: string
    oldIndex: number
    oldReplacement: string
}

export class PageHeader extends React.Component<PageHeaderProps, PageHeaderState> {
    private readonly title = 'char flip'

    private interval?: any

    constructor(props: PageHeaderProps) {
        super(props)

        this.state = {
            index: -1,
            replacement: '',
            oldIndex: -1,
            oldReplacement: ''
        }
    }

    componentDidMount() {
        this.toggleActive(this.props.active)
    }

    componentWillReceiveProps(newProps: PageHeaderProps) {
        if (newProps.active !== this.props.active) {
            this.toggleActive(newProps.active)
        }
    }

    render() {
        const text = this.title.split('').map((x, i) => {
            return <span key={i} className={'flip-container ' + (i === this.state.index ? 'flipped' : '')}>
                <span className='flipper'>
                    <span className='original'>{x}</span>
                    <span className='new'>{i === this.state.oldIndex ? this.state.oldReplacement : this.state.replacement}</span>
                    <span style={{ visibility: 'hidden' }}>{x}</span>
                </span>
            </span>
        })

        return (
            <header className="page-header">
                <h1><a href=".">{text}</a></h1>
            </header>
        )
    }

    private toggleActive(active: boolean) {
        clearInterval(this.interval)
        this.setState({
            index: -1,
            replacement: '',
            oldIndex: -1,
            oldReplacement: ''
        })

        if (active) {
            this.interval = setInterval(() => {
                this.setState({
                    index: Math.floor(Math.random() * this.title.length),
                    replacement: randomChar(),
                    oldReplacement: this.state.replacement,
                    oldIndex: this.state.index
                })
            }, 1000)
        }
    }
}