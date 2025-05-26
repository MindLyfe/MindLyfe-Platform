import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto, TherapistVerificationRequestDto, TherapistVerifyDto } from './dto';
import { AuthClientService } from '@mindlyf/shared/auth-client';
export declare class UsersService {
    private readonly userRepo;
    private readonly authClient;
    constructor(userRepo: Repository<User>, authClient: AuthClientService);
    getMe(user: any): Promise<User>;
    updateMe(dto: UpdateUserDto, user: any): Promise<User>;
    requestTherapistVerification(dto: TherapistVerificationRequestDto, user: any): Promise<{
        success: boolean;
    }>;
    verifyTherapist(id: string, dto: TherapistVerifyDto, user: any): Promise<User>;
}
