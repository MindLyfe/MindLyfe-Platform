import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getAllUsers(): Promise<any>;
    getUserById(id: string): Promise<any>;
    updateUser(id: string, updateDto: any): Promise<any>;
    deleteUser(id: string): Promise<any>;
    updateUserPassword(id: string, passwordDto: any): Promise<any>;
}
