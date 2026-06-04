import * as fs from "fs";
import { STORAGE_STATE } from "./paths";

async function globalSetup(): Promise<void> {
  if (fs.existsSync(STORAGE_STATE)) {
    fs.unlinkSync(STORAGE_STATE);
  }
}

export default globalSetup;
