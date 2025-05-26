export declare enum ParticipantRole {
    HOST = "host",
    CO_HOST = "co_host",
    PARTICIPANT = "participant",
    OBSERVER = "observer"
}
export declare class AddParticipantsDto {
    userIds?: string[];
    emails?: string[];
    role: ParticipantRole;
    invitationMessage?: string;
    sendNotifications?: boolean;
}
export declare class RemoveParticipantsDto {
    userIds: string[];
    reason?: string;
    sendNotifications?: boolean;
}
export declare class UpdateParticipantRoleDto {
    userId: string;
    role: ParticipantRole;
}
export declare class ManageBreakoutRoomsDto {
    rooms: {
        name: string;
        participants: string[];
    }[];
    duration?: string;
}
