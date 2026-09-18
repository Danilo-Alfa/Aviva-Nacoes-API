import { LimiteDeMensagens } from './limite-mensagens';

describe('LimiteDeMensagens', () => {
  const inicio = 1_700_000_000_000;

  it('permite a primeira mensagem', () => {
    const limite = new LimiteDeMensagens();

    expect(limite.registrar('socket-1', inicio).permitido).toBe(true);
  });

  it('recusa duas mensagens coladas', () => {
    const limite = new LimiteDeMensagens();
    limite.registrar('socket-1', inicio);

    const resultado = limite.registrar('socket-1', inicio + 100);

    expect(resultado.permitido).toBe(false);
    expect(resultado.motivo).toContain('instante');
  });

  it('libera depois do intervalo minimo', () => {
    const limite = new LimiteDeMensagens();
    limite.registrar('socket-1', inicio);

    expect(limite.registrar('socket-1', inicio + 1_000).permitido).toBe(true);
  });

  it('recusa rajada acima do maximo da janela', () => {
    const limite = new LimiteDeMensagens();

    for (let i = 0; i < 8; i++) {
      expect(limite.registrar('socket-1', inicio + i * 1_000).permitido).toBe(true);
    }

    const resultado = limite.registrar('socket-1', inicio + 9_000);

    expect(resultado.permitido).toBe(false);
    expect(resultado.motivo).toContain('muitas mensagens');
  });

  it('esquece mensagens fora da janela', () => {
    const limite = new LimiteDeMensagens();

    for (let i = 0; i < 8; i++) {
      limite.registrar('socket-1', inicio + i * 1_000);
    }

    expect(limite.registrar('socket-1', inicio + 30_000).permitido).toBe(true);
  });

  it('conta cada socket separadamente', () => {
    const limite = new LimiteDeMensagens();
    limite.registrar('socket-1', inicio);

    expect(limite.registrar('socket-2', inicio + 100).permitido).toBe(true);
  });

  it('libera o socket ao esquecer', () => {
    const limite = new LimiteDeMensagens();
    limite.registrar('socket-1', inicio);
    limite.esquecer('socket-1');

    expect(limite.registrar('socket-1', inicio + 100).permitido).toBe(true);
  });
});
