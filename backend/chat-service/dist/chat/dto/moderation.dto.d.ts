export declare enum ModerationAction {
    HIDE = "hide",
    DELETE = "delete",
    WARNING = "warning",
    BLOCK_USER = "block_user"
}
export declare class ModerateMessageDto {
    messageId: string;
    action: ModerationAction;
    reason?: string;
}
export declare class ReportMessageDto {
    messageId: string;
    reason: string;
}
export declare class ModerateRoomDto {
    roomId: string;
    action: ModerationAction;
    reason?: string;
}
