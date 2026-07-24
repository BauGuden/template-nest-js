import { HealthController } from './health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  it('returns a healthy response', () => {
    const response = controller.getHttpHealth();

    expect(response.status).toBe('ok');
    expect(response.service).toBeDefined();
    expect(response.timestamp).toBeDefined();
  });

  it('echoes a NATS ping payload', () => {
    expect(controller.ping({ id: 1 })).toEqual({
      pong: true,
      payload: { id: 1 },
    });
  });
});
