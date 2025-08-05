export class CronLogger {
  private jobName: string;
  private startTime: Date;

  constructor(jobName: string) {
    this.jobName = jobName;
    this.startTime = new Date();
  }

  info(message: string, data?: any) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        job: this.jobName,
        level: 'info',
        message,
        ...(data && { data }),
      }),
    );
  }

  error(message: string, error?: any) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        job: this.jobName,
        level: 'error',
        message,
        error: error?.message || error,
        stack: error?.stack,
      }),
    );
  }

  complete(processed: number = 0, errors: string[] = []) {
    const duration = Date.now() - this.startTime.getTime();
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        job: this.jobName,
        level: 'info',
        message: 'Job completed',
        processed,
        errors: errors.length,
        duration,
      }),
    );
  }
}
