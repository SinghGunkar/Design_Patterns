import type { Notification } from './interfaces.js';

export class EmailNotification implements Notification {
    send(message: string): void {
        console.log(`Sending Email notification with message: ${message}`);
    }

    validate(message: string): boolean {
        return message.length > 0;
    }
}

export class DelayedEmailNotification extends EmailNotification {
    override send(message: string): void {
        console.log(`Sending Delayed Email notification with message: ${message} after a delay`);
    }
}

export class SMSNotification implements Notification {
    send(message: string): void {
        console.log(`Sending SMS notification with message: ${message}`);
    }

    validate(message: string): boolean {
        return message.length > 0 && message.length <= 160;
    }
}

export class PushNotification implements Notification {
    send(message: string): void {
        console.log(`Sending Push notification with message: ${message}`);
    }

    validate(message: string): boolean {
        return message.length > 0 && message.length <= 200;
    }
}

export class SlackNotification implements Notification {
    send(message: string): void {
        console.log(`Sending Slack notification with message: ${message}`);
    }

    validate(message: string): boolean {
        return message.length > 0 && message.length <= 4000;
    }
}
