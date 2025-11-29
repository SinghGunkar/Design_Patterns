import { EmailNotificationFactory, SMSNotificationFactory, PushNotificationFactory, SlackNotificationFactory, DelayedEmailNotificationFactory } from './factory.js';
import type { NotificationFactory } from './factory.js';

function clientCode(factory: NotificationFactory, message: string) {
    factory.notify(message);
}

// Example usage:
const emailFactory = new EmailNotificationFactory();
clientCode(emailFactory, "Hello via Email!");

const delayedEmailFactory = new DelayedEmailNotificationFactory();
clientCode(delayedEmailFactory, "Hello via Delayed Email!");

const smsFactory = new SMSNotificationFactory();
clientCode(smsFactory, "Hello via SMS!");

const pushFactory = new PushNotificationFactory();
clientCode(pushFactory, "Hello via Push Notification!");

const slackFactory = new SlackNotificationFactory();
clientCode(slackFactory, "Hello via Slack!");
