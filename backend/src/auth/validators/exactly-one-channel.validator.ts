import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Классовый валидатор, проверяющий наличие ровно одного канала связи (телефон ИЛИ email)
 */
export function ExactlyOneChannel(validationOptions?: ValidationOptions) {
  return function (constructor: Function) {
    registerDecorator({
      name: 'exactlyOneChannel',
      target: constructor,
      propertyName: 'channelGuard',
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          const obj = args.object as any;
          const hasPhone = typeof obj?.phone === 'string' && obj.phone.trim().length > 0;
          const hasEmail = typeof obj?.email === 'string' && obj.email.trim().length > 0;
          return hasPhone !== hasEmail; // Ровно один канал должен быть true
        },
        defaultMessage(): string {
          return 'Необходимо указать ровно один канал связи: либо телефон, либо email + пароль';
        }
      }
    });
  };
}
