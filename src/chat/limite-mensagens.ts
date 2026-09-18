/**
 * Controle de flood do chat. Guarda os horarios das ultimas mensagens de cada
 * socket e recusa rajadas, sem depender de nada externo.
 */
const JANELA_MS = 20_000;
const MAXIMO_POR_JANELA = 8;
const INTERVALO_MINIMO_MS = 800;

export interface ResultadoLimite {
  permitido: boolean;
  motivo?: string;
}

export class LimiteDeMensagens {
  private historico = new Map<string, readonly number[]>();

  registrar(chave: string, agora: number = Date.now()): ResultadoLimite {
    const anteriores = (this.historico.get(chave) ?? []).filter(
      (momento) => agora - momento < JANELA_MS,
    );

    const ultima = anteriores[anteriores.length - 1];

    if (ultima !== undefined && agora - ultima < INTERVALO_MINIMO_MS) {
      this.historico.set(chave, anteriores);
      return { permitido: false, motivo: 'Calma la, espere um instante antes da proxima mensagem.' };
    }

    if (anteriores.length >= MAXIMO_POR_JANELA) {
      this.historico.set(chave, anteriores);
      return { permitido: false, motivo: 'Voce enviou muitas mensagens seguidas. Aguarde alguns segundos.' };
    }

    this.historico.set(chave, [...anteriores, agora]);
    return { permitido: true };
  }

  esquecer(chave: string): void {
    this.historico.delete(chave);
  }
}
