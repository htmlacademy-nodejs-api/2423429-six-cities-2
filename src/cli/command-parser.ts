type ParsedCommand = Record<string, string[]>

export class CommandParser {
  static parse(cliArguments: string[]): ParsedCommand {
    const ParsedCommand: ParsedCommand = {};
    let currentCommand = '';

    for (const argument of cliArguments) {
      if (argument.startsWith('--')) {
        ParsedCommand[argument] = [];
        currentCommand = argument;
      } else if (currentCommand && argument) {
        ParsedCommand[currentCommand].push(argument);
      }
    }

    return ParsedCommand;
  }
}
