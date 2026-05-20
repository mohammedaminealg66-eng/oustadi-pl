import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  root() {
    return { status: 'ok', service: 'oustadi-api', timestamp: new Date().toISOString() };
  }
}
