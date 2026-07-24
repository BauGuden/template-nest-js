import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { env, MESSAGE_PATTERNS } from '../config';

export interface HealthResponse {
  service: string;
  status: 'ok';
  mode: string;
  timestamp: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Comprueba el estado de la API HTTP' })
  getHttpHealth(): HealthResponse {
    return this.createResponse();
  }

  @MessagePattern(MESSAGE_PATTERNS.health)
  getMicroserviceHealth(): HealthResponse {
    return this.createResponse();
  }

  @MessagePattern(MESSAGE_PATTERNS.ping)
  ping(payload: unknown): { pong: true; payload: unknown } {
    return { pong: true, payload };
  }

  private createResponse(): HealthResponse {
    return {
      service: env.appName,
      status: 'ok',
      mode: env.appMode,
      timestamp: new Date().toISOString(),
    };
  }
}
