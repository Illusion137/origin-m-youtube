export default interface ContinuationItem {
    trigger: string
    continuationEndpoint: ContinuationEndpoint
}

interface ContinuationEndpoint {
    clickTrackingParams: string
    commandMetadata: CommandMetadata
    continuationCommand: ContinuationCommand
}

interface CommandMetadata {
    webCommandMetadata: WebCommandMetadata
}

interface WebCommandMetadata {
    sendPost: boolean
    apiUrl: string
}

interface ContinuationCommand {
    token: string
    request: string
}