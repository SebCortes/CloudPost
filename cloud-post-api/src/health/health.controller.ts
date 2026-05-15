import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

export const HealthControllerPath = 'health';

@Controller(HealthControllerPath)
export class HealthController {
    constructor(
      private readonly health: HealthCheckService,
      private readonly prisma: PrismaService,
      private readonly prismaHealth: PrismaHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check() {
      return this.health.check([
        () => this.prismaHealth.pingCheck("database", this.prisma),
      ]);
    }
}
