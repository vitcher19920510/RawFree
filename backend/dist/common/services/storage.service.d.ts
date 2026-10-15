export declare class StorageService {
    private readonly logger;
    upload(buffer: Buffer, mimetype: string): Promise<string>;
    delete(url: string): Promise<boolean>;
}
