/**
 * CLI 选项
 */
export interface CliOptions {
  input?: string;
  output?: string;
  config?: string;
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
}

/**
 * 项目配置文件
 */
export interface GefeConfig {
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
}
