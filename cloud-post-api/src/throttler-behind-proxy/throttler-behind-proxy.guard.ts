import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

export function GetIp(req: Record<string, any>): { ip: string, isFromProxy: boolean } {
  if(req.headers['x-forwarded-for']){
    return {
      ip: req.headers['x-forwarded-for'].split(',')[0],
      isFromProxy: true,
    }
  }
  return {
    ip: !!req.ips.length ? req.ips[0] : req.ip,
    isFromProxy: false,
  }
}

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return GetIp(req).ip;
  }
}