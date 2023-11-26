import fs from "fs";
import path from "path";
import { PulseConfig } from "../common/types";

export function loadConfig(): PulseConfig {
  try {
    const configPath = path.join(
      process.env.HOME || process.env.USERPROFILE || "",
      ".pulse.json"
    );
    const configFile = fs.readFileSync(configPath, "utf-8");
    const config: PulseConfig = JSON.parse(configFile);
    return config;
  } catch (error) {
    console.error("Error reading config file:", error);
    throw error;
  }
}
