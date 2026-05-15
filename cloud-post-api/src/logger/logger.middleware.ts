import { Injectable, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response, NextFunction } from 'express'
import { EnvVariables } from '../env.validation'
import { IncomingRequest, NODE_ENV_VALUES } from '../const'
import { GetIp } from '../throttler-behind-proxy/throttler-behind-proxy.guard'
import { HealthControllerPath } from '../health/health.controller'

enum LogColor {
  white = '\x1b[32m',
  red = '\x1b[31m',
  none = '',
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private isEnvProd: boolean
  constructor(
    private readonly configService: ConfigService<EnvVariables, true>,
  ) {
    this.isEnvProd = this.configService.get<EnvVariables['NODE_ENV']>('NODE_ENV') === NODE_ENV_VALUES.production
  }

  use(request: IncomingRequest, response: Response, next: NextFunction) {
    const { method } = request
    const { ip, isFromProxy } = GetIp(request)

    response.on('close', () => {
      const { statusCode } = response
      if (request.url === '/' + HealthControllerPath && this.isEnvProd) {
        // No need to log it
        return
      }
      const textToLog = this.buildLogMessage(ip, method, request.url, statusCode, isFromProxy)
      console.log(textToLog)
    })

    next()
  }

  private buildLogMessage(
    ip: string,
    method: string,
    url: string,
    statusCode: number,
    isFromProxy: boolean,
  ) {
    const sourceLabel = isFromProxy ? '[PROXY] ' : ''
    const color = this.getLogColor(statusCode)
    const colorSuffix = color === LogColor.none ? '' : '\x1b[0m'

    return `${new Date().toLocaleString()} - ${color}${sourceLabel}[${ip}] ${method} ${url} : ${statusCode}${colorSuffix}`
  }

  private getLogColor(statusCode: number): LogColor {
    if (statusCode >= 200 && statusCode < 300) {
      return LogColor.white
    }

    if (statusCode >= 400) {
      return LogColor.red
    }

    return LogColor.none
  }
}
