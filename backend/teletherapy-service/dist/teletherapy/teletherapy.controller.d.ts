import { TeletherapyService } from './teletherapy.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { TherapySession } from './entities/therapy-session.entity';
import { UpdateSessionNotesDto } from './dto/update-session-notes.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { CancelSessionDto } from './dto/cancel-session.dto';
import { AddParticipantsDto, RemoveParticipantsDto, UpdateParticipantRoleDto, ManageBreakoutRoomsDto } from './dto/manage-participants.dto';
import { JwtUser } from '../auth/interfaces/user.interface';
export declare class TeletherapyController {
    private readonly teletherapyService;
    constructor(teletherapyService: TeletherapyService);
    createSession(createSessionDto: CreateSessionDto, req: any): Promise<TherapySession>;
    getSession(id: string, req: any): Promise<TherapySession>;
    getUpcomingSessions(req: any): Promise<TherapySession[]>;
    getSessionsByDateRange(startDate: Date, endDate: Date, req: any): Promise<TherapySession[]>;
    updateSessionStatus(id: string, updateStatusDto: UpdateSessionStatusDto, req: any): Promise<TherapySession>;
    updateSessionNotes(id: string, updateNotesDto: UpdateSessionNotesDto, req: any): Promise<TherapySession>;
    cancelSession(id: string, cancelSessionDto: CancelSessionDto, req: any): Promise<TherapySession>;
    addParticipants(id: string, addParticipantsDto: AddParticipantsDto, req: any): Promise<TherapySession>;
    removeParticipants(id: string, removeParticipantsDto: RemoveParticipantsDto, req: any): Promise<TherapySession>;
    updateParticipantRole(id: string, updateRoleDto: UpdateParticipantRoleDto, req: any): Promise<TherapySession>;
    manageBreakoutRooms(id: string, breakoutRoomsDto: ManageBreakoutRoomsDto, req: any): Promise<TherapySession>;
    joinSession(id: string, req: any): Promise<TherapySession>;
    leaveSession(id: string, req: any): Promise<TherapySession>;
    getGroupSessions(category?: string, focus?: string[], req: any): Promise<TherapySession[]>;
    getIndividualSessions(category?: string, req: any): Promise<TherapySession[]>;
    createChatRoomForSession(id: string, user: JwtUser): Promise<{
        success: boolean;
        message: string;
    }>;
    checkTherapistClientRelationship(therapistId: string, clientId: string, user: JwtUser): Promise<{
        hasRelationship: boolean;
    }>;
}
