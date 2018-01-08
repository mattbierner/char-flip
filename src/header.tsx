import * as React from 'react'

export class PageHeader extends React.Component {
    private readonly title = 'char flip'

    render() {
        return (
            <header className="page-header">
                <h1><a href=".">{this.title}</a></h1>
            </header>
        )
    }
}