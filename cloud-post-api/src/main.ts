import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from './env.validation'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  })

  app.enableCors()
  app.set('trust proxy', 'loopback')

  const configService = app.get(ConfigService) as ConfigService<EnvVariables, true>
  
  const port = configService.get<EnvVariables['PORT']>('PORT')

  await app.listen(port)
  
  console.log(`API listening on port ${port}`)
}

bootstrap()
