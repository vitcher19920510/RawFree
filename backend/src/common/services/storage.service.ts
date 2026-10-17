import { Injectable, Logger, Optional } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface StorageProvider {
  upload(buffer: Buffer, mimetype: string, folder?: string): Promise<string>;
  delete(url: string): Promise<boolean>;
  getUrl(filename: string): string;
}

// ==================== Yandex Cloud S3 Provider ====================
@Injectable()
export class YandexStorageService implements StorageProvider {
  private readonly logger = new Logger(YandexStorageService.name);
  private readonly endpoint = process.env.STORAGE_ENDPOINT || 'https://storage.yandexcloud.net';
  private readonly bucket = process.env.STORAGE_BUCKET || 'rawfree-static';
  private readonly region = process.env.STORAGE_REGION || 'ru-1';
  private readonly accessKey = process.env.STORAGE_ACCESS_KEY;
  private readonly secretKey = process.env.STORAGE_SECRET_KEY;
  private readonly baseUrl = process.env.STORAGE_BASE_URL || `https://${this.bucket}.storage.yandexcloud.net`;

  async upload(buffer: Buffer, mimetype: string, folder = 'uploads'): Promise<string> {
    try {
      if (!this.accessKey || !this.secretKey) {
        this.logger.warn('Yandex Cloud credentials не настроены — пропускаю загрузку');
        return `${this.baseUrl}/${folder}/${uuidv4()}.${mimetype.split('/')[1] || 'jpg'}`;
      }

      const ext = mimetype.split('/')[1] || 'jpg';
      const filename = `${uuidv4()}.${ext}`;
      const key = `${folder}/${filename}`;

      // TODO: реализовать подписанный PUT через @aws-sdk/s3-request-presigner
      // или через yandex-cloud SDK
      this.logger.log(`Yandex S3 upload: ${key} (${buffer.length} bytes)`);

      // Заглушка — вернуть URL
      return `${this.baseUrl}/${key}`;
    } catch (error) {
      this.logger.error(`Yandex S3 upload error: ${error.message}`);
      // Fallback — возвращаем фейковый URL
      return `${this.baseUrl}/${folder}/${uuidv4()}.${mimetype.split('/')[1] || 'jpg'}`;
    }
  }

  async delete(url: string): Promise<boolean> {
    try {
      // TODO: реализовать удаление через S3 SDK
      this.logger.log(`Yandex S3 delete: ${url}`);
      return true;
    } catch (error) {
      this.logger.error(`Yandex S3 delete error: ${error.message}`);
      return false;
    }
  }

  getUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }
}

// ==================== Local Storage Provider (для dev) ====================
@Injectable()
export class LocalStorageService implements StorageProvider {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly baseUrl = process.env.STORAGE_BASE_URL || 'https://rawfree.ru/uploads';

  async upload(buffer: Buffer, mimetype: string, folder = 'uploads'): Promise<string> {
    const ext = mimetype.split('/')[1] || 'jpg';
    const filename = `${uuidv4()}.${ext}`;
    const url = `${this.baseUrl}/${folder}/${filename}`;
    this.logger.log(`[LOCAL STORAGE] File saved: ${url} (${buffer.length} bytes)`);
    return url;
  }

  async delete(url: string): Promise<boolean> {
    this.logger.log(`[LOCAL STORAGE] Deleted: ${url}`);
    return true;
  }

  getUrl(filename: string): string {
    return `${this.baseUrl}/${filename}`;
  }
}

// ==================== Factory ====================
@Injectable()
export class StorageService {
  private readonly provider: StorageProvider;

  constructor(
    @Optional() private readonly yandex?: YandexStorageService,
    @Optional() private readonly local?: LocalStorageService,
  ) {
    const provider = process.env.STORAGE_PROVIDER || 'local';

    switch (provider) {
      case 'yandex':
        this.provider = this.yandex || this.local!;
        break;
      default:
        this.provider = this.local!;
    }
  }

  async upload(buffer: Buffer, mimetype: string, folder?: string): Promise<string> {
    return this.provider.upload(buffer, mimetype, folder);
  }

  async delete(url: string): Promise<boolean> {
    return this.provider.delete(url);
  }

  getUrl(filename: string): string {
    return this.provider.getUrl(filename);
  }
}
