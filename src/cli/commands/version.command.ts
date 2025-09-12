import { readFileSync } from 'node:fs';
import { Command } from './command.interface.js';
import chalk from 'chalk';
import { ConsoleLogger } from '../../common/console.logger.js';

export class VersionCommand implements Command {
  private logger = new ConsoleLogger();

  public getName(): string {
    return '--version';
  }

  public execute(): void {
    try {
      const version = this.readVersion();
      this.logger.info(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                     ${chalk.bold('Версия приложения')}                     ║
╚══════════════════════════════════════════════════════════════╝

${chalk.green('📦 Текущая версия:')} ${chalk.yellow.bold(version)}

${chalk.gray('──────────────────────────────────────────────────────────')}
${chalk.italic('Rental CLI для управления данными об аренде жилья.')}
      `));
    } catch (error) {
      this.logger.error('Failed to read version from package.json', error);
    }
  }

  private readVersion(): string {
    const content = readFileSync('./package.json', 'utf-8');
    const { version } = JSON.parse(content);
    return version;
  }
}
