import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
export type SafeUser = Omit<User, 'password' | 'hashPassword' | 'comparePassword'>;
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findAll(): Promise<SafeUser[]>;
    findById(id: string): Promise<SafeUser>;
    findByIdInternal(id: string): Promise<User | undefined>;
    findByEmail(email: string): Promise<User | undefined>;
    findByResetToken(token: string): Promise<User | undefined>;
    createUser(userData: Partial<User>): Promise<SafeUser>;
    updateLastLogin(id: string): Promise<SafeUser>;
    updateResetToken(id: string, token: string, expires: Date): Promise<SafeUser>;
    updatePassword(id: string, password: string): Promise<SafeUser>;
    deactivateUser(id: string): Promise<{
        id: string;
        status: string;
    }>;
    private sanitizeUser;
}
