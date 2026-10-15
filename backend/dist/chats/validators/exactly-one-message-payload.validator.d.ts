import { ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
export declare class ExactlyOneMessagePayloadConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean;
    defaultMessage(): string;
}
export declare function ExactlyOneMessagePayload(validationOptions?: ValidationOptions): (constructor: Function) => void;
