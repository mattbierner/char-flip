import * as React from 'react'

const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const randomChar = () => possibleChars[Math.floor(Math.random() * possibleChars.length)]


class FlippableCharacter extends React.PureComponent<{ originalChar: string, newChar: string, flipped: boolean }> {
    render() {
        return (
            <div className={'flip-container ' + (this.props.flipped ? 'flipped' : '')}>
                <div className='flipper'>
                    <div className='original'>{this.props.originalChar}</div>
                    <div className='new'>{this.props.newChar}</div>
                </div>
                <span style={{ visibility: 'hidden' }}>{this.props.originalChar}</span>
            </div>
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

    private updateInterval?: any

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
                originalChar={x}
                newChar={i === this.state.oldIndex ? this.state.oldReplacement : this.state.replacement}
                flipped={this.props.active && i === this.state.index} />
        })

        return (
            <header className='page-header' >
                <h1><a href='.'>{text}</a></h1>
                <h2>One change<br />Make it count</h2>
            </header>
        )
    }

    private toggleActive(active: boolean) {
        clearInterval(this.updateInterval)
        this.setState({
            index: -1,
            replacement: '',
            oldIndex: -1,
            oldReplacement: ''
        })

        if (active) {
            this.updateInterval = setInterval(() => {
                let newIndex = -1;
                do {
                    newIndex = Math.floor(Math.random() * this.title.length)
                } while (newIndex === this.state.index)

                this.setState({
                    index: newIndex,
                    replacement: randomChar(),
                    oldReplacement: this.state.replacement,
                    oldIndex: this.state.index
                })
            }, 1000)
        }
    }
}