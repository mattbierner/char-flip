import * as React from 'react'

export class LoadingSpinner extends React.Component<{ active: boolean }> {
    render() {
        return <span className={"material-icons loading-spinner " + (this.props.active ? '' : 'hidden')}>autorenew</span>
    }
}