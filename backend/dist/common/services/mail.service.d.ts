export declare class MailService {
    private readonly logger;
    sendVerify(email: string, code: string): Promise<boolean>;
    sendReset(email: string, link: string): Promise<boolean>;
}
