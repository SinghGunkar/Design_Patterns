// step 1) Define the Notification interface
interface Notification {
    send(message: string): void
    validate(message: string): boolean
}

// step 2) Create concrete classes implementing the Notification interface
class EmailNotification implements Notification {
    send(message: string): void {
        console.log(`Sending Email notification with message: ${message}`);
    }

    validate(message: string): boolean {
        return message.length > 0;
    }
}

class SMSNotification implements Notification {
    send(message: string): void {
        console.log(`Sending SMS notification with message: ${message}`);
    }

    validate(message: string): boolean {
        return message.length > 0 && message.length <= 160;
    }
}

class PushNotification implements Notification {
    send(message: string): void {
        console.log(`Sending Push notification with message: ${message}`);
    }

    validate(message: string): boolean {
        return message.length > 0 && message.length <= 200;
    }
}

class SlackNotification implements Notification {
    send(message: string): void {
        console.log(`Sending Slack notification with message: ${message}`);
    }

    validate(message: string): boolean {
        return message.length > 0 && message.length <= 4000;
    }
}

// step 3) Create the NotificationFactory abstract class
abstract class NotificationFactory {
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

// step 4) Create concrete factory classes for each notification type
class EmailNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new EmailNotification();
    }
}

class SMSNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new SMSNotification();
    }
}

class PushNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new PushNotification();
    }
}

class SlackNotificationFactory extends NotificationFactory {
    createNotification(): Notification {
        return new SlackNotification();
    }
}

// step 5) Client code to use the factories
function clientCode(factory: NotificationFactory, message: string) {
    factory.notify(message);
}

// Example usage:
const emailFactory = new EmailNotificationFactory();
clientCode(emailFactory, "Hello via Email!");

const smsFactory = new SMSNotificationFactory();
clientCode(smsFactory, "Hello via SMS!");

const pushFactory = new PushNotificationFactory();
clientCode(pushFactory, "Hello via Push Notification!");

const slackFactory = new SlackNotificationFactory();
clientCode(slackFactory, "Hello via Slack!");   