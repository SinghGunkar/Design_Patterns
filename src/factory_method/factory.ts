import type { Notification } from './interfaces.js';
import { EmailNotification, SMSNotification, PushNotification, SlackNotification, DelayedEmailNotification } from './concrete-classes.js';

export abstract class NotificationFactory {
    abstract createNotification(): Notification;

    notify(message: string): void {
        const notification = this.createNotification();
        if (notification.validate(message)) {
            notification.send(message);
        } else {
            console.log("Invalid message for this notification type.");
        }
    }
}

export class EmailNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new EmailNotification();
    }
}

export class DelayedEmailNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new DelayedEmailNotification();
    }
}

export class SMSNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new SMSNotification();
    }
}

export class PushNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new PushNotification();
    }
}

export class SlackNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new SlackNotification();
    }
}
