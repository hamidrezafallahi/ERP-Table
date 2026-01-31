export interface IUserAgentDevice {
  CacheKey: string;
  Browser: string;
  BrowserVersion: string;
  Engine: string;
  Ip: string;
  OS: string;
  OSVersion: string;
  Device: string;
  Architecture: string;
  IsActiveToken: boolean;
  LastLoginDate?: string;
  setDevices?: any;
}

export interface IUserAgentResponse {
  Data: IUserAgentDevice[];
}
