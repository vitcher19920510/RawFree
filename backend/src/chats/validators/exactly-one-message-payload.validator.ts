import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'ExactlyOneMessagePayloadConstraint', async: false })
export class ExactlyOneMessagePayloadConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const obj = args.object as any;
    const hasText = typeof obj?.text === 'string' && obj.text.trim().length > 0;
    const hasMedia = typeof obj?.mediaUrl === 'string' && obj.mediaUrl.trim().length > 0 && typeof obj?.mediaType === 'string' && obj.mediaType.trim().length > 0;

    const incompleteMedia = (Boolean(obj?.mediaUrl) && !obj?.mediaType) || (!obj?.mediaUrl && Boolean(obj?.mediaType));
    if (incompleteMedia) return false;

    // ПРАВКА 4: posterUrl, durationMs, width, height, sizeBytes допустимы строго при наличии mediaUrl + mediaType
    const hasMediaMetadata = obj?.durationMs !== undefined || obj?.width !== undefined || obj?.height !== undefined || obj?.sizeBytes !== undefined || (typeof obj?.posterUrl === 'string' && obj.posterUrl.trim().length > 0);
    if (hasMediaMetadata && !hasMedia) return false;

    return (hasText || hasMedia) && !(hasText && hasMedia);
  }

  defaultMessage(): string {
    return 'Сообщение должно содержать либо текст, либо медиафайл (mediaUrl + mediaType), но не оба одновременно';
  }
}

export function ExactlyOneMessagePayload(validationOptions?: ValidationOptions) {
  return function (constructor: Function) {
    registerDecorator({
      name: 'ExactlyOneMessagePayload',
      target: constructor,
      propertyName: '',
      options: validationOptions,
      validator: ExactlyOneMessagePayloadConstraint,
    });
  };
}
