import { ConsoleLogger } from '../../common/console.logger.js';
import { Command } from './command.interface.js';
import chalk from 'chalk';

export class HelpCommand implements Command {
  private logger = new ConsoleLogger();

  public getName(): string {
    return '--help';
  }

  public execute(): void {
    this.logger.info(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                   ${chalk.bold('Rental CLI Application')}                   ║
╚══════════════════════════════════════════════════════════════╝

${chalk.bold('Программа для подготовки данных для REST API сервера.')}

${chalk.yellow('📝 Пример использования:')}
<<<<<<< HEAD
    ${chalk.green('npm run ts ./src/main.cli.ts -- --<command> [--arguments]')}

${chalk.blue('🎯 Доступные команды:')}
    ${chalk.green('--version')}                   # ${chalk.gray('выводит номер версии')}
    ${chalk.green('--help')}                      # ${chalk.gray('печатает этот текст')}
    ${chalk.green('--import <path>')}             # ${chalk.gray('импортирует данные из TSV')}

${chalk.magenta('🚀 Пример импорта:')}
    ${chalk.green('npm run ts ./src/main.cli.ts -- --import ./mocks/mock-data.tsv')}
=======
    ${chalk.green('npm run cli -- --<command> [--arguments]')}

${chalk.blue('Доступные команды:')}
    ${chalk.green('--version')}                   # ${chalk.gray('выводит номер версии')}
    ${chalk.green('--help')}                      # ${chalk.gray('печатает этот текст')}
    ${chalk.green('--import <path>')}             # ${chalk.gray('импортирует данные из TSV')}
    ${chalk.green('--generate <n> <path> <url>')} # ${chalk.gray('генерирует n тестовых предложений')}

${chalk.magenta('Пример импорта:')}
    ${chalk.green('npm run cli -- --import ./mocks/mock-data.tsv')}

${chalk.magenta('Пример генерации:')}
    ${chalk.green('npm run cli -- --generate 10 ./mocks/test-data.tsv http://localhost:3000')}
>>>>>>> feature-fixes

${chalk.gray('──────────────────────────────────────────────────────────')}
${chalk.italic('Для дополнительной информации обратитесь к документации.')}
    `));
  }
}
