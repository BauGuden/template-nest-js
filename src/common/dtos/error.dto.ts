export interface ErrorDto {
  statusCode: number;
  message: string | string[];
  data?: unknown;
  timestamp: string;
}
