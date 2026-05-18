import { Controller, Get, Header } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';

@ApiTags('robots')
@Controller('robots.txt')
export class RobotsTxtController {
    
    @Get()
    @Header('Content-Type', 'text/plain; charset=utf-8')
    @ApiOperation({ summary: 'Get robots.txt content' })
    @ApiProduces('text/plain')
    @ApiOkResponse({
        description: 'robots.txt content returned successfully.',
        schema: {
            type: 'string',
            example: 'User-agent: *\r\nDisallow: /\r\n',
        },
    })
    async getRobotsTxt(): Promise<string> {
        return `User-agent: *\r\nDisallow: /\r\n`;
    }
}
