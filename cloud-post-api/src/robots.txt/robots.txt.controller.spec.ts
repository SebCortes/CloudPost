import { Test, TestingModule } from '@nestjs/testing';
import { RobotsTxtController } from './robots.txt.controller';

describe('RobotsTxtController', () => {
  let controller: RobotsTxtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RobotsTxtController],
    }).compile();

    controller = module.get<RobotsTxtController>(RobotsTxtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
