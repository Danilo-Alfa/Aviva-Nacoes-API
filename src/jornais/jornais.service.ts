import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class JornaisService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Cria um novo jornal (para automação via n8n)
   * A data é definida automaticamente como a data atual
   */
  async criar(url: string, titulo?: string) {
    const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await this.supabase.getClient()
      .from('jornais')
      .insert({
        url_pdf: url,
        titulo: titulo || null,
        data: hoje,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar jornal: ${error.message}`);
    }

    return data;
  }

  /**
   * Busca os últimos jornais (para página pública)
   */
  async getUltimos(limit: number = 5) {
    const { data, error } = await this.supabase.getClient()
      .from('jornais')
      .select('*')
      .order('data', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erro ao buscar jornais: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca todos os jornais (para admin)
   */
  async getTodos() {
    const { data, error } = await this.supabase.getClient()
      .from('jornais')
      .select('*')
      .order('data', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar jornais: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Atualiza um jornal
   */
  async atualizar(id: string, urlPdf: string, titulo: string | null, dataJornal: string) {
    const { data, error } = await this.supabase.getClient()
      .from('jornais')
      .update({
        url_pdf: urlPdf,
        titulo,
        data: dataJornal,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar jornal: ${error.message}`);
    }

    return data;
  }

  /**
   * Deleta um jornal
   */
  async deletar(id: string) {
    const { error } = await this.supabase.getClient()
      .from('jornais')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar jornal: ${error.message}`);
    }

    return { success: true };
  }
}
