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
exports.UpdateProfileDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateProfileDto {
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.ValidateIf)((o) => typeof o.name === 'string' && o.name.trim() !== ''),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.age !== undefined && o.age !== null),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(18, { message: 'Вам должно быть не менее 18 лет' }),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateProfileDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => typeof o.gender === 'string' && o.gender.trim() !== ''),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => typeof o.lookingFor === 'string' && o.lookingFor.trim() !== ''),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "lookingFor", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => typeof o.city === 'string' && o.city.trim() !== ''),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => typeof o.bio === 'string'),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "bio", void 0);
//# sourceMappingURL=update-profile.dto.js.map