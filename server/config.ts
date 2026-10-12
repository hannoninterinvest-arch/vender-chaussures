export class ConfigService {
  constructor(private readonly overrides: Record<string, string> = {}) {}
  get<T = string>(name: string): T | undefined {
    return (this.overrides[name] ?? process.env[name]) as T | undefined;
  }
  getOrThrow<T = string>(name: string): T {
    const value = this.get<T>(name);
    if (!value) throw new Error(`${name} est obligatoire`);
    return value;
  }
}
