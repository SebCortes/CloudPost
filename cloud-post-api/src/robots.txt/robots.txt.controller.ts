import { Controller, Get, Header } from '@nestjs/common';

@Controller('robots.txt')
export class RobotsTxtController {
    
    @Get()
    @Header('Content-Type', 'text/plain; charset=utf-8')
    async getRobotsTxt(): Promise<string> {
        return `User-agent: *\r\nDisallow: /\r\n`;
    }
}
