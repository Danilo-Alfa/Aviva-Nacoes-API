import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class VersiculosService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Cria um novo versículo (para automação via n8n)
   * A data é definida automaticamente como a data atual
   */
  async criar(url: string) {
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await this.supabase
      .getClient()
      .from('versiculos')
      .insert({
        url_post: url,
        titulo: null,
        data: hoje,
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar versículo: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca o versículo do dia (mais recente ativo)
   */
  async getVersiculoDoDia() {
    const { data, error } = await this.supabase
      .getClient()
      .from('versiculos')
      .select('*')
      .eq('ativo', true)
      .order('data', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar versículo: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca versículos anteriores (exceto o mais recente)
   */
  async getVersiculosAnteriores(limit: number = 6) {
    const { data, error } = await this.supabase
      .getClient()
      .from('versiculos')
      .select('*')
      .eq('ativo', true)
      .order('data', { ascending: false })
      .range(1, limit);

    if (error) {
      throw new Error(`Erro ao buscar versículos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca todos os versículos (para admin)
   */
  async getTodos() {
    const { data, error } = await this.supabase
      .getClient()
      .from('versiculos')
      .select('*')
      .order('data', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar versículos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Atualiza um versículo
   */
  async atualizar(
    id: string,
    urlPost: string,
    titulo: string | null,
    dataVersiculo: string,
  ) {
    const { data, error } = await this.supabase
      .getClient()
      .from('versiculos')
      .update({
        url_post: urlPost,
        titulo,
        data: dataVersiculo,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar versículo: ${error.message}`);
    }

    return data;
  }

  /**
   * Deleta um versículo
   */
  async deletar(id: string) {
    const { error } = await this.supabase
      .getClient()
      .from('versiculos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar versículo: ${error.message}`);
    }

    return { success: true };
  }

  /**
   * Ativa/desativa um versículo
   */
  async toggleAtivo(id: string, ativo: boolean) {
    const { data, error } = await this.supabase
      .getClient()
      .from('versiculos')
      .update({ ativo })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }

    return data;
  }
}
