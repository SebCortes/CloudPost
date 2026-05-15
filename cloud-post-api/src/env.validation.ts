
import { plainToInstance } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsString, IsUrl, Max, Min, ValidateIf, validateSync } from 'class-validator'
import { NODE_ENV_VALUES } from './const'

const ValidateIfNotInDevelopment = (o: Record<string, unknown>, varName: string) => {
  const isNotDev = o.NODE_ENV !== NODE_ENV_VALUES.development
  
  if (!isNotDev && !o[varName]) {
    console.warn(`${varName} is not set, it will have to be set in production`)
  }
  
  return isNotDev
}

const IsUrlOptions: (requireTld: boolean) => validator.IsURLOptions = (requireTld: boolean) => {
  return {
    require_tld: requireTld,
    require_protocol: true,
    allow_query_components: false,
    allow_fragments: false,
    disallow_auth: true,
    require_valid_protocol: true,
  }
}

const isProd = process.env.NODE_ENV === undefined || process.env.NODE_ENV === NODE_ENV_VALUES.production

class EnvironmentVariables {

  @IsEnum(NODE_ENV_VALUES)
  NODE_ENV!: NODE_ENV_VALUES

  @IsInt()
  @Min(0)
  @Max(65535)
  API_PORT: number = 3000

  @IsString()
  @IsNotEmpty()
  @IsUrl(IsUrlOptions(isProd))
  FRONT_END_DOMAIN_NAME!: string

}

export interface EnvVariables extends EnvironmentVariables {}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    {
      enableImplicitConversion: true
    },
  )

  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  
  return validatedConfig
}
