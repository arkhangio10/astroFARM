// NASA Earthdata Authentication Handler

import { NasaApiResponse } from './types';

export class EarthdataAuth {
  private readonly ursTokenUrl = 'https://urs.earthdata.nasa.gov/api/users/token';
  private username?: string;
  private password?: string;

  private accessToken?: string;
  private expiresAt?: number; // epoch ms

  constructor(username?: string, password?: string, initialToken?: string) {
    // Don't throw errors during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      // During build, use placeholders
      this.username = username || 'placeholder-user';
      this.password = password || 'placeholder-pass';
      this.accessToken = initialToken || 'placeholder-token';
    } else {
      this.username = username;
      this.password = password;
      this.accessToken = initialToken;
    }
  }

  isConfigured(): boolean {
    return this.username !== 'placeholder-user' && 
           this.password !== 'placeholder-pass' &&
           this.accessToken !== 'placeholder-token';
  }

  /**
   * Devuelve un Bearer token válido (cacheado/auto-refresh).
   * Requiere username/password si no hay token o expiró.
   */
  async getValidToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && this.expiresAt && now < this.expiresAt - 5 * 60 * 1000) {
      return this.accessToken; // aún válido (con margen de 5 min)
    }
    if (!this.username || !this.password) {
      if (this.accessToken) return this.accessToken; // no sabemos exp., se usa tal cual
      throw new Error('EDL: faltan credenciales para obtener/renovar el token.');
    }
    const basic = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    const res = await fetch(this.ursTokenUrl, {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}` },
    });

    const raw = await res.text();
    let data: any; try { data = JSON.parse(raw); } catch { data = raw; }

    if (!res.ok) {
      throw new Error(`EDL token error: ${res.status} - ${raw}`);
    }

    // Respuesta típica: { access_token, token_type: "Bearer", expiration_date: "2025-12-01T..." }
    this.accessToken = data?.access_token;
    const expIso = data?.expiration_date;
    this.expiresAt = expIso ? Date.parse(expIso) : undefined;

    if (!this.accessToken) throw new Error('EDL: respuesta sin access_token.');
    return this.accessToken;
  }
}
