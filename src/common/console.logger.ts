import chalk from 'chalk';

export class ConsoleLogger {
  public info(message: string): void {
    console.log(chalk.blue(`[INFO] ${message}`));
  }

  public error(message: string, error?: unknown): void {
    console.error(chalk.red(`[ERROR] ${message}`), error ? chalk.red(`: ${error}`) : '');
  }

  public success(message: string): void {
    console.log(chalk.green(`[SUCCESS] ${message}`));
  }

  public warning(message: string): void {
    console.log(chalk.yellow(`[WARNING] ${message}`));
  }

  public debug(message: string): void {
    console.log(chalk.gray(`[DEBUG] ${message}`));
  }
}
