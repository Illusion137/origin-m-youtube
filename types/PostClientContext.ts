export default interface PostClientContext {
    client: Client
    user: User
    request: Request
    clientScreenNonce: string
    clickTracking: ClickTracking
    adSignalsInfo: AdSignalsInfo
}

interface Client {
    hl: string
    gl: string
    remoteHost: string
    deviceMake: string
    deviceModel: string
    visitorData: string
    userAgent: string
    clientName: string
    clientVersion: string
    osName: string
    osVersion: string
    originalUrl: string
    playerType: string
    screenPixelDensity: number
    platform: string
    clientFormFactor: string
    configInfo: ConfigInfo
    screenDensityFloat: number
    userInterfaceTheme: string
    timeZone: string
    browserName: string
    browserVersion: string
    acceptHeader: string
    deviceExperimentId: string
    screenWidthPoints: number
    screenHeightPoints: number
    utcOffsetMinutes: number
    connectionType: string
    memoryTotalKbytes: string
    mainAppWebInfo: MainAppWebInfo
}

interface ConfigInfo {
    appInstallData: string
}

interface MainAppWebInfo {
    graftUrl: string
    webDisplayMode: string
    isWebNativeShareAvailable: boolean
}

interface User {
    lockedSafetyMode: boolean
}

interface Request {
    useSsl: boolean
    internalExperimentFlags: any[]
    consistencyTokenJars: any[]
}

interface ClickTracking {
    clickTrackingParams: string
}

interface AdSignalsInfo {
    params: Param[]
}

interface Param {
    key: string
    value: string
}