import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto, TherapistVerificationRequestDto, TherapistVerifyDto } from './dto';
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    getMe(user: any): Promise<User>;
    updateMe(dto: UpdateUserDto, user: any): Promise<User>;
    requestTherapistVerification(dto: TherapistVerificationRequestDto, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyTherapist(id: string, dto: TherapistVerifyDto, user: any): Promise<{
        success: boolean;
        user: User;
        message: string;
    }>;
    getUserById(id: string): Promise<User>;
    getUserByAuthId(authId: string): Promise<User>;
    getAllUsers(page?: number, limit?: number): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
