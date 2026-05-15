import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

/**
 * Options for RequiredPipe behavior.
 */
export interface RequiredPipeOptions {
  /**
   * If true, hides argument source/name details in error messages.
   * @default false
   */
  isSecret?: boolean
}

@Injectable()
/**
 * Ensures a route argument is present.
 *
 * This pipe throws a 400 Bad Request when the value is null or undefined.
 * Error messages are built from Nest ArgumentMetadata to indicate where the
 * missing value comes from (query, body, param, etc.).
 */
export class RequiredPipe implements PipeTransform {
  private readonly isSecret: boolean

  constructor(options: RequiredPipeOptions = {}) {
    this.isSecret = options.isSecret===undefined ? false : options.isSecret
  }

  /**
   * Validates that the given value is defined.
   *
   * @param value Current argument value provided by Nest.
   * @param metadata Metadata describing argument source and key name.
   * @returns The original value when present.
   * @throws BadRequestException When value is null or undefined.
   */
  transform(value: any, metadata: ArgumentMetadata) {
    if (value === null || value === undefined) {
      if (this.isSecret) {
        throw new BadRequestException()
      }
      throw new BadRequestException(`${metadata.data} in ${metadata.type} is required`)
    }
    return value
  }
}
