// NASA Earthdata API client for AstroFarm

import { NasaApiResponse, NasaCredentials } from './types';
import { EarthdataAuth } from './EarthdataAuth';

type NasaService = 'CMR' | 'LAADS' | 'GES_DISC';

class NasaEarthdataClient {
  private baseUrls = {
    CMR: 'https://cmr.earthdata.nasa.gov/search',
    LAADS: 'https://ladsweb.modaps.eosdis.nasa.gov/api/v2',
    GES_DISC: 'https://disc.gsfc.nasa.gov/api',
  };

  private auth: EarthdataAuth;

  constructor(credentials: NasaCredentials) {
    this.auth = new EarthdataAuth(
      credentials.username,
      credentials.password,
      credentials.token
    );
  }

  // --- núcleo de request por servicio ---
  private async makeRequest(url: string, service: NasaService = 'CMR', requireAuth = false): Promise<NasaApiResponse> {
    try {
      console.log(`🌍 NASA API Request: ${url}`);
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'User-Agent': 'AstroFarm/1.0 (+https://example.com)',
      };

      // Estrategia por servicio:
      // - LAADS / GES_DISC: SIEMPRE Bearer
      // - CMR: público por defecto; si requireAuth=true o tienes token, añade Bearer
      if (service === 'LAADS' || service === 'GES_DISC' || requireAuth) {
        const token = await this.auth.getValidToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      const raw = await res.text();
      let data: any; try { data = JSON.parse(raw); } catch { data = raw; }

      console.log(`📊 Response Status: ${res.status}`);

      if (!res.ok) {
        return { data, status: res.status, error: `NASA API Error: ${res.status} - ${raw}` };
      }
      return { data, status: res.status };
    } catch (err: any) {
      console.error('❌ NASA API Error:', err);
      return { data: null, status: 0, error: err?.message || 'Unknown error' };
    }
  }

  // --- utilidades de dominio ---
  getCentralValleyTiles(): string[] {
    return ['h08v05', 'h08v06', 'h09v05', 'h09v06'];
  }

  formatDateForAPI(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}.${m}.${d}`;
  }

  // --- CMR: búsquedas (sin auth por defecto) ---
  async testConnection(): Promise<NasaApiResponse> {
    const url = `${this.baseUrls.CMR}/collections.json?short_name=MOD13Q1&page_size=1`;
    return this.makeRequest(url, 'CMR', false);
  }

  async getAvailableNDVIDates(): Promise<NasaApiResponse> {
    const url = `${this.baseUrls.CMR}/granules.json?short_name=MOD13Q1&page_size=10&sort_key=-start_date`;
    return this.makeRequest(url, 'CMR', false);
  }

  // Get Julian day for MODIS products
  getJulianDay(date: Date): string {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const day = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    return String(day).padStart(3, '0');
  }

  // --- acceso por producto: mapea a short_name + filtros reales (fecha/tile) ---
  private productToShortName(product: string): string {
    switch (product) {
      case 'NDVI': return 'MOD13Q1';
      case 'TEMPERATURE': return 'MOD11A2';
      case 'SOIL_MOISTURE': return 'SPL3SMP_E';
      case 'PRECIPITATION': return 'GPM_3IMERGDF';
      default: throw new Error(`Unknown product: ${product}`);
    }
  }

  private buildTemporalRange(dateStr: string): string {
    // admite "YYYY.MM.DD" -> crea rango del día
    const [Y, M, D] = dateStr.split('.').map(Number);
    const start = new Date(Date.UTC(Y, M - 1, D, 0, 0, 0)).toISOString();
    const end   = new Date(Date.UTC(Y, M - 1, D, 23, 59, 59)).toISOString();
    return `${start},${end}`;
  }

  async testDataAccess(product: string, date: string, tile: string): Promise<NasaApiResponse> {
    const shortName = this.productToShortName(product);
    const temporal = this.buildTemporalRange(date);
    const url = `${this.baseUrls.CMR}/granules.json?short_name=${shortName}` +
                `&temporal=${encodeURIComponent(temporal)}` +
                `&readable_granule_name=${encodeURIComponent(tile)}` +
                `&page_size=5&sort_key=-start_date`;
    // CMR puede funcionar sin auth; si tu DAAC exige auth en follow-ups, la añadirás allí
    return this.makeRequest(url, 'CMR', false);
  }

  async getDataFile(product: string, date: string, tile: string, filenamePart?: string): Promise<NasaApiResponse> {
    // 1) Encuentra el granule en CMR
    const shortName = this.productToShortName(product);
    const temporal = this.buildTemporalRange(date);
    let url = `${this.baseUrls.CMR}/granules.json?short_name=${shortName}` +
              `&temporal=${encodeURIComponent(temporal)}` +
              `&readable_granule_name=${encodeURIComponent(tile)}` +
              `&page_size=20&sort_key=-start_date`;
    const search = await this.makeRequest(url, 'CMR', false);
    if (search.error || !search.data?.feed?.entry?.length) return search;

    // 2) Filtra por nombre aproximado si te pasaron "filename"
    const entries = search.data.feed.entry as any[];
    const picked = filenamePart
      ? entries.find(e => e.title?.includes(filenamePart))
      : entries[0];

    if (!picked) {
      return { data: null, status: 404, error: 'Granule not found for given filters' };
    }

    // 3) Normalmente tendrás enlaces a data pool del DAAC (LAADS/LP DAAC/etc).
    //    Para descargarlos necesitarás Bearer (requireAuth=true). Aquí devolvemos los links.
    return { data: picked.links || picked, status: 200 };
  }
}

// Create singleton instance
let nasaClient: NasaEarthdataClient | null = null;

export function getNasaClient(): NasaEarthdataClient {
  if (!nasaClient) {
    const username = process.env.NASA_EARTHDATA_USERNAME; // opcional si tienes token ya
    const password = process.env.NASA_EARTHDATA_PASSWORD; // idem
    const token    = process.env.NASA_EARTHDATA_TOKEN;    // opcional (si ya lo generaste)

    if ((!token) && (!username || !password)) {
      throw new Error('Configura NASA_EARTHDATA_TOKEN o (NASA_EARTHDATA_USERNAME + NASA_EARTHDATA_PASSWORD)');
    }
    nasaClient = new NasaEarthdataClient({ username, password, token });
  }
  return nasaClient;
}

// Utility functions for data processing
export function processNDVIData(rawData: any): number {
  // Process MODIS NDVI data (scale factor: 0.0001)
  if (rawData && rawData.NDVI) {
    return rawData.NDVI * 0.0001;
  }
  return 0;
}

export function processSoilMoistureData(rawData: any): number {
  // Process SMAP soil moisture data (scale factor: 0.0001)
  if (rawData && rawData.Soil_Moisture_Retrieval_Data_AM) {
    return rawData.Soil_Moisture_Retrieval_Data_AM * 0.0001;
  }
  return 0;
}

export function processTemperatureData(rawData: any): number {
  // Process MODIS LST data (scale factor: 0.02, offset: -273.15)
  if (rawData && rawData.LST_Day_1km) {
    return (rawData.LST_Day_1km * 0.02) - 273.15;
  }
  return 0;
}

export function processPrecipitationData(rawData: any): number {
  // Process GPM precipitation data (mm/hour)
  if (rawData && rawData.precipitationCal) {
    return rawData.precipitationCal;
  }
  return 0;
}

export default NasaEarthdataClient;
