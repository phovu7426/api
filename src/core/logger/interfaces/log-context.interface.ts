export interface LogContext {
  context?: string;
  trace?: string;
  userId?: number | null;
  username?: string | null;
  requestId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  extra?: Record<string, any>;
  [key: string]: any;
}


