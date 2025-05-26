import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(): Promise<{
        count: number;
        users: import("./user.service").SafeUser[];
    }>;
    findOne(id: string): Promise<import("./user.service").SafeUser>;
    deactivate(id: string): Promise<{
        id: string;
        status: string;
    }>;
}
