import * as dotenv from "dotenv";

dotenv.config({ override: true });

const requireEnvVariable = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }

  return value;
};

export const BASE_URL = requireEnvVariable("BASE_URL");
export const API_BASE_URL = requireEnvVariable("API_BASE_URL");
export const OPENAPI_URL = requireEnvVariable("OPENAPI_URL");

export const USER_EMAIL = requireEnvVariable("USER_EMAIL");
export const USER_PASSWORD = requireEnvVariable("USER_PASSWORD");
