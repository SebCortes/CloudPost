
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { EnvVariables } from '../env.validation';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(
    configService: ConfigService<EnvVariables, true>,
  ) {
    const databaseUrl = configService.get<EnvVariables['DATABASE_URL']>('DATABASE_URL')
    const rdsCaCert = configService.get<EnvVariables['RDS_CA_CERT']>('RDS_CA_CERT')

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
      ssl: rdsCaCert
        ? {
            ca: rdsCaCert,
            rejectUnauthorized: true,
          }
        : undefined,
    });

    super({ adapter });
  }
}
