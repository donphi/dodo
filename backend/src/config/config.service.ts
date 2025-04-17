import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private readonly config: Record<string, string>;

  constructor() {
    // Load static config from central config/ directory if present
    const configDir = path.resolve(__dirname, '../../../config');
    let fileConfig: Record<string, string> = {};
    const configFile = path.join(configDir, 'backend.env');
    if (fs.existsSync(configFile)) {
      const lines = fs.readFileSync(configFile, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...rest] = trimmed.split('=');
        fileConfig[key] = rest.join('=');
      }
    }
    // Merge with process.env (env takes precedence)
    // Filter process.env to only include string values
    const envConfig: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === 'string') {
        envConfig[key] = value;
      }
    }
    this.config = { ...fileConfig, ...envConfig };
  }

  get(key: string): string | undefined {
    return this.config[key];
  }
}