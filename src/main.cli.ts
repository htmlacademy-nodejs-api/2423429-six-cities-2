#!/usr/bin/env node
import 'reflect-metadata';
import chalk from 'chalk';
import {
  CLIApplication,
  GenerateCommand,
  HelpCommand,
  ImportCommand,
  VersionCommand,
} from './cli/index.js';

function bootstrap() {
  try {

    const cliApplication = new CLIApplication();
    cliApplication.registerCommands([
      new HelpCommand(),
      new VersionCommand(),
      new ImportCommand(),
      new GenerateCommand(),
    ]);

    cliApplication.processCommand(process.argv.slice(2));
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red('❌ Ошибка:'), error.message);
      console.log(
        chalk.yellow('💡 Создайте .env файл с необходимыми переменными')
      );
      console.log(
        chalk.gray(`
PORT=3000
SALT=10
DB_HOST=localhost
DB_USER=admin
DB_PASSWORD=test
DB_NAME=six-cities
DB_PORT=27017
UPLOAD_DIRECTORY=upload
JWT_SECRET=your-super-secret-jwt-key
      `)
      );
    }
    process.exitCode = 1;
  }
}

bootstrap();
