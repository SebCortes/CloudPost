import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { RequestMethod } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from './env.validation'
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'
import { NODE_ENV_VALUES } from './const'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  })

  app.enableCors()
  app.set('trust proxy', 'loopback')

  const configService = app.get(ConfigService) as ConfigService<EnvVariables, true>
  
  const port = configService.get<EnvVariables['API_PORT']>('API_PORT')
  const nodeEnv = configService.get<EnvVariables['NODE_ENV']>('NODE_ENV')

  if (nodeEnv === NODE_ENV_VALUES.production) {
    app.setGlobalPrefix('api', {
      exclude: [{ path: 'health', method: RequestMethod.GET }],
    })
  }

  if (nodeEnv === NODE_ENV_VALUES.development) {
    const config = new DocumentBuilder()
      .setTitle('CloudPost API')
      .setDescription('API for CloudPost, a post platform')
      .setVersion('1.0')
      .addTag('cloud-post')
      .build()

    const documentFactory = () => {
      const options: SwaggerDocumentOptions = {
        operationIdFactory: (
          controllerKey: string,
          methodKey: string
        ) => methodKey.length > 1 ? methodKey[0].toLowerCase() + methodKey.slice(1) : methodKey.toLowerCase(),
        autoTagControllers: true,
      }

      return SwaggerModule.createDocument(app, config, options)
    }

    const swaggerUrl = 'swagger'
    const swaggerJsonUrl = swaggerUrl + '/json'
    const swaggerYamlUrl = swaggerUrl + '/yaml'

    SwaggerModule.setup(swaggerUrl, app, documentFactory, {
      jsonDocumentUrl: swaggerJsonUrl,
      yamlDocumentUrl: swaggerYamlUrl,
    })
    
    console.log(`Swagger UI is available at /${swaggerUrl}, JSON document is available at /${swaggerJsonUrl} and YAML at /${swaggerYamlUrl}`)
  }

  await app.listen(port)
  
  console.log(`API listening on port ${port}`)
}

bootstrap()
