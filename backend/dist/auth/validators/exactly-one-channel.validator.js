"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExactlyOneChannel = ExactlyOneChannel;
const class_validator_1 = require("class-validator");
function ExactlyOneChannel(validationOptions) {
    return function (constructor) {
        (0, class_validator_1.registerDecorator)({
            name: 'exactlyOneChannel',
            target: constructor,
            propertyName: 'channelGuard',
            options: validationOptions,
            validator: {
                validate(value, args) {
                    const obj = args.object;
                    const hasPhone = typeof obj?.phone === 'string' && obj.phone.trim().length > 0;
                    const hasEmail = typeof obj?.email === 'string' && obj.email.trim().length > 0;
                    return hasPhone !== hasEmail;
                },
                defaultMessage() {
                    return 'Необходимо указать ровно один канал связи: либо телефон, либо email + пароль';
                }
            }
        });
    };
}
//# sourceMappingURL=exactly-one-channel.validator.js.map