import * as React from 'react'

interface PageHeaderState {
    index: number
    replacement: string
}

export class PageHeader extends React.Component<{}, PageHeaderState> {
    private readonly title = 'char flip'

    constructor(props: any) {
        super(props)

        this.state = {
            index: 0,
            replacement: 'b'
        }
    }

    render() {
        const text = this.title.split('').map((x, i) => {
            if (i === this.state.index) {
                return <span key={i} className='flipped'>
                    <span className='origin'>{x}</span>
                    <span className='new'>{this.state.replacement}</span>
                </span>
            }
            return <span key={i}>{x}</span>
        })

        return (
            <header className="page-header">
                <h1><a href=".">{text}</a></h1>
            </header>
        )
    }
}