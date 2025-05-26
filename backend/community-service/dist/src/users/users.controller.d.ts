import { UsersService } from './users.service';
import { UpdateUserDto, TherapistVerificationRequestDto, TherapistVerifyDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<import("./entities/user.entity").User>;
    updateMe(dto: UpdateUserDto, req: any): Promise<import("./entities/user.entity").User>;
    requestTherapistVerification(dto: TherapistVerificationRequestDto, req: any): Promise<{
        success: boolean;
    }>;
    verifyTherapist(id: string, dto: TherapistVerifyDto, req: any): Promise<import("./entities/user.entity").User>;
}
