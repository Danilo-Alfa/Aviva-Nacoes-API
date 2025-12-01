import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Aviva Nações API',
      version: '1.0.0',
      description: 'API Backend para o sistema Aviva Nações',
      endpoints: {
        docs: '/docs',
        live: '/api/live',
        chat: '/api/chat',
        viewers: '/api/viewers',
      },
    };
  }

  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
