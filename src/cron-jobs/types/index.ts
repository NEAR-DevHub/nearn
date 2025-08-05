export interface CronJobResult {
  success: boolean;
  message: string;
  processed?: number;
  errors?: string[];
}

export interface CronJobContext {
  jobName: string;
  executionTime: Date;
  isDryRun?: boolean;
}
