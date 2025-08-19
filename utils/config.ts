interface IConfig {
  BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
}

export const config: IConfig = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8001/api",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Invity",
  APP_VERSION: process.env.NEXT_PUBLIC_VERSION || "v1",
};
