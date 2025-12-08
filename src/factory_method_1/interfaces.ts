export interface Notification {
    send(message: string): void
    validate(message: string): boolean
}
