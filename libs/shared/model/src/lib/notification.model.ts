import { Audited } from "./audited.model";
import { User } from "./user.model";

export interface Notification extends Audited {
    notificationId: number;
    userId: number;
    notificationType: string;
    content: string;
    isRead: boolean;
    link: string;

    user: User;
}