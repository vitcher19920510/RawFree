"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const send_message_dto_1 = require("./send-message.dto");
describe('SendMessageDto', () => {
    it('should fail on empty object {}', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, {});
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('should fail on empty string text ""', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, { text: '' });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('should fail on whitespace text "  " after transform', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, { text: '  ' });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('should fail on number text 123', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, { text: 123 });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('should pass on valid text "hi"', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, { text: 'hi' });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBe(0);
    });
    it('should pass on valid media payload', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, {
            mediaType: 'photo',
            mediaUrl: 'https://rawfree.ru/photo.jpg',
            width: 1080,
            height: 1080,
        });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBe(0);
    });
    it('should fail when both text and media are provided', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, {
            text: 'hi',
            mediaType: 'photo',
            mediaUrl: 'https://rawfree.ru/photo.jpg',
        });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('should fail when mediaType is provided without mediaUrl', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, { mediaType: 'videonote' });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('should fail when media metadata fields are provided on text message', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, { text: 'hi', durationMs: 5000 });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
    it('should fail when posterUrl is provided on text message', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(send_message_dto_1.SendMessageDto, { text: 'hi', posterUrl: 'https://rawfree.ru/poster.jpg' });
        const errors = await (0, class_validator_1.validate)(dto);
        expect(errors.length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=send-message.dto.spec.js.map