"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExactlyOneMessagePayloadConstraint = void 0;
exports.ExactlyOneMessagePayload = ExactlyOneMessagePayload;
const class_validator_1 = require("class-validator");
let ExactlyOneMessagePayloadConstraint = class ExactlyOneMessagePayloadConstraint {
    validate(value, args) {
        const obj = args.object;
        const hasText = typeof obj?.text === 'string' && obj.text.trim().length > 0;
        const hasMedia = typeof obj?.mediaUrl === 'string' && obj.mediaUrl.trim().length > 0 && typeof obj?.mediaType === 'string' && obj.mediaType.trim().length > 0;
        const incompleteMedia = (Boolean(obj?.mediaUrl) && !obj?.mediaType) || (!obj?.mediaUrl && Boolean(obj?.mediaType));
        if (incompleteMedia)
            return false;
        const hasMediaMetadata = obj?.durationMs !== undefined || obj?.width !== undefined || obj?.height !== undefined || obj?.sizeBytes !== undefined || (typeof obj?.posterUrl === 'string' && obj.posterUrl.trim().length > 0);
        if (hasMediaMetadata && !hasMedia)
            return false;
        return (hasText || hasMedia) && !(hasText && hasMedia);
    }
    defaultMessage() {
        return 'Сообщение должно содержать либо текст, либо медиафайл (mediaUrl + mediaType), но не оба одновременно';
    }
};
exports.ExactlyOneMessagePayloadConstraint = ExactlyOneMessagePayloadConstraint;
exports.ExactlyOneMessagePayloadConstraint = ExactlyOneMessagePayloadConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'ExactlyOneMessagePayloadConstraint', async: false })
], ExactlyOneMessagePayloadConstraint);
function ExactlyOneMessagePayload(validationOptions) {
    return function (constructor) {
        (0, class_validator_1.registerDecorator)({
            name: 'ExactlyOneMessagePayload',
            target: constructor,
            propertyName: '',
            options: validationOptions,
            validator: ExactlyOneMessagePayloadConstraint,
        });
    };
}
//# sourceMappingURL=exactly-one-message-payload.validator.js.map