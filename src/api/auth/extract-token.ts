import * as fs from "fs";
import { STORAGE_STATE } from "../../../playwright.config";

type StorageStateCookie = {
  name: string;
  value: string;
};

type PlaywrightStorageState = {
  cookies: StorageStateCookie[];
};

const TOKEN_COOKIE_NAME = "rolnopolToken";

export function extractTokenFromStorageState(
  storageStatePath: string = STORAGE_STATE,
): string {
  if (!fs.existsSync(storageStatePath)) {
    throw new Error(
      `Storage state file not found at ${storageStatePath}. Run the setup project first.`,
    );
  }

  const raw = fs.readFileSync(storageStatePath, "utf-8");
  const state = JSON.parse(raw) as PlaywrightStorageState;
  const tokenCookie = state.cookies.find(
    (cookie) => cookie.name === TOKEN_COOKIE_NAME,
  );

  if (!tokenCookie?.value) {
    throw new Error(
      `${TOKEN_COOKIE_NAME} cookie not found in storage state at ${storageStatePath}`,
    );
  }

  return tokenCookie.value;
}
