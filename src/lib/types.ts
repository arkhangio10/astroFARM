// NASA Earthdata API Types

export interface NasaApiResponse {
  data: any;
  error?: string;
  status: number;
}

export interface NasaCredentials {
  username?: string;
  password?: string;
  token?: string;           // opcional: si ya tienes un EDL token válido
}
