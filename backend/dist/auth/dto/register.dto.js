"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const exactly_one_channel_validator_1 = require("../validators/exactly-one-channel.validator");
let RegisterDto = class RegisterDto {
};
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.ValidateIf)((o) => typeof o.phone === 'string' && o.phone.trim() !== ''),
    (0, class_validator_1.IsPhoneNumber)('RU', { message: 'Неверный формат номера телефона' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => typeof o.email === 'string' && o.email.trim() !== ''),
    (0, class_validator_1.IsEmail)({}, { message: 'Неверный формат email' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => typeof o.email === 'string' && o.email.trim() !== ''),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'При регистрации по email пароль обязателен' }),
    (0, class_validator_1.MinLength)(8, { message: 'Пароль должен содержать не менее 8 символов' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.Equals)(true, { message: 'Вам должно быть 18+ для регистрации' }),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "is18Accepted", void 0);
exports.RegisterDto = RegisterDto = __decorate([
    (0, exactly_one_channel_validator_1.ExactlyOneChannel)()
], RegisterDto);
//# sourceMappingURL=register.dto.js.map