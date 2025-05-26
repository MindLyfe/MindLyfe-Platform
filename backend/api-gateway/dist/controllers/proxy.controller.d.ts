import { Request, Response } from 'express';
import { ProxyService } from '../services/proxy.service';
export declare class ProxyController {
    private readonly proxyService;
    private readonly logger;
    constructor(proxyService: ProxyService);
    proxyAuth(req: Request, res: Response): Promise<void>;
    proxyAi(req: Request, res: Response): Promise<void>;
    proxyJournal(req: Request, res: Response): Promise<void>;
    proxyRecommender(req: Request, res: Response): Promise<void>;
    proxyLyfbot(req: Request, res: Response): Promise<void>;
    proxyChat(req: Request, res: Response): Promise<void>;
    proxyTeletherapy(req: Request, res: Response): Promise<void>;
    proxyCommunity(req: Request, res: Response): Promise<void>;
    proxyNotification(req: Request, res: Response): Promise<void>;
    proxyUser(req: Request, res: Response): Promise<void>;
    private proxyToService;
}
