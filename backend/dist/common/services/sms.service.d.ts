export declare class SmsService {
    private readonly logger;
    send(phone: string, code: string): Promise<boolean>;
}
