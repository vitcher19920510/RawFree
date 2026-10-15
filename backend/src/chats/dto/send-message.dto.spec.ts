import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SendMessageDto } from './send-message.dto';

describe('SendMessageDto', () => {
  it('should fail on empty object {}', async () => {
    const dto = plainToInstance(SendMessageDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail on empty string text ""', async () => {
    const dto = plainToInstance(SendMessageDto, { text: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail on whitespace text "  " after transform', async () => {
    const dto = plainToInstance(SendMessageDto, { text: '  ' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail on number text 123', async () => {
    const dto = plainToInstance(SendMessageDto, { text: 123 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass on valid text "hi"', async () => {
    const dto = plainToInstance(SendMessageDto, { text: 'hi' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass on valid media payload', async () => {
    const dto = plainToInstance(SendMessageDto, {
      mediaType: 'photo',
      mediaUrl: 'https://rawfree.ru/photo.jpg',
      width: 1080,
      height: 1080,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when both text and media are provided', async () => {
    const dto = plainToInstance(SendMessageDto, {
      text: 'hi',
      mediaType: 'photo',
      mediaUrl: 'https://rawfree.ru/photo.jpg',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when mediaType is provided without mediaUrl', async () => {
    const dto = plainToInstance(SendMessageDto, { mediaType: 'videonote' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when media metadata fields are provided on text message', async () => {
    const dto = plainToInstance(SendMessageDto, { text: 'hi', durationMs: 5000 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when posterUrl is provided on text message', async () => {
    const dto = plainToInstance(SendMessageDto, { text: 'hi', posterUrl: 'https://rawfree.ru/poster.jpg' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
