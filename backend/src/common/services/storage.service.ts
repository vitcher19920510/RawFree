import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async upload(buffer: Buffer, mimetype: string): Promise<string> {
    const ext = mimetype.split('/')[1] || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const url = `https://rawfree.ru/uploads/${filename}`;
    this.logger.log(`[STORAGE STUB] Uploaded file (${buffer.length} bytes) to ${url}`);
    return url;
  }

  async delete(url: string): Promise<boolean> {
    this.logger.log(`[STORAGE STUB] Deleted file from ${url}`);
    return true;
  }
}
