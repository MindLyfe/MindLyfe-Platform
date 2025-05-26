import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(req: any, query: any): Promise<any>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateDto: any, req: any): Promise<any>;
    remove(id: string, req: any): Promise<any>;
    updatePassword(id: string, passwordDto: any, req: any): Promise<any>;
}
