import * as React from 'react'
import { setInterval } from 'timers';

const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

const randomChar = () => possible[Math.floor(Math.random() * possible.length)]

const randomSetTimeout = (min: number, max: number, f: () => void) =>
    setTimeout(f, Math.random() * (max - min) + min)

class FlippableCharacter extends React.PureComponent<{ original: string, new: string, flipped: boolean }> {
    render() {
        return (
            <span className={'flip-container ' + (this.props.flipped ? 'flipped' : '')}>
                <span className='flipper'>
                    <span className='original'>{this.props.original}</span>
                    <span className='new'>{this.props.new}</span>
                    <span style={{ visibility: 'hidden' }}>{this.props.original}</span>
                </span>
            </span>
        )
    }
}

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
            return <FlippableCharacter key={i}
                original={x}
                new={i === this.state.oldIndex ? this.state.oldReplacement : this.state.replacement}
                flipped={this.props.active && i === this.state.index} />
        })

        return (
            <header className="page-header" >
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