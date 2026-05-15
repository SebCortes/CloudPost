import { ConfigService } from "@nestjs/config";
import { LoggerMiddleware } from "./logger.middleware";

describe('LoggerMiddleware', () => {
  it('should be defined', () => {
    expect(new LoggerMiddleware(new ConfigService())).toBeDefined();
  });
});
