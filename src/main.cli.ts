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

<<<<<<< HEAD
// Список обязательных переменных окружения
// const REQUIRED_ENV_VARS = [
//   'PORT', 'SALT', 'DB_HOST', 'DB_USER', 'DB_PASSWORD',
//   'DB_NAME', 'DB_PORT', 'UPLOAD_DIRECTORY', 'JWT_SECRET'
// ];

// function checkEnvironmentVariables() {
//   const missingVars = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);

//   if (missingVars.length > 0) {
//     throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
//   }
//   return true;
// }

function bootstrap() {
  try {
    //checkEnvironmentVariables();
=======
function bootstrap() {
  try {
>>>>>>> feature-fixes

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
