/**
 * CLI 选项
 */
export interface CliOptions {
  input?: string;
  output?: string;
  config?: string;
  source?: string;
  convertToV3?: boolean;
  noCache?: boolean;
  clean?: boolean;
  env?: string;
  force?: boolean;
}

/**
 * API 源配置
 */
export interface ApiSource {
  input: string;
  output: string;
  convertToV3?: boolean;
  clean?: boolean;
  patches?: PatchFunction[];
  clientType?: "fetch" | "axios";
  baseURL?: string;

  /**
   * Kubb 原生配置（可选）
   * 用于添加额外的 Kubb 插件或覆盖默认配置
   * @example
   * kubb: {
   *   plugins: [pluginZod({ output: { path: './zod' } })]
   * }
   */
  kubb?: {
    plugins?: any[];
    hooks?: any;
    [key: string]: any;
  };
}

/**
 * 项目配置文件
 */
export interface Swagger2TsConfig {
  sources?: Record<string, ApiSource>;
  patches?: PatchFunction[];
  convertToV3?: boolean;
  cache?: boolean;
  cacheDir?: string;
}

/**
 * 补丁函数类型
 */
export type PatchFunction = (swaggerContent: string) => string;

/**
 * 增量缓存元数据
 */
export interface CacheMetadata {
  hash: string;
  timestamp: number;
  input: string;
  output: string;
  version: string;
}

/**
 * Swagger 处理结果
 */
export interface ProcessedSwagger {
  content: string;
  isConverted: boolean;
  originalVersion: string;
}

/**
 * 生成器选项
 */
export interface GeneratorOptions {
  input: string;
  output: string;
  clean?: boolean;
  configPath?: string;
  clientType?: "fetch" | "axios";
  baseURL?: string;
  kubbOptions?: {
    plugins?: any[];
    hooks?: any;
    [key: string]: any;
  };
}
