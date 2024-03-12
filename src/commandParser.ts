class ParsedCommand {
  command: string
  args: Array<string>

  public isValid(): boolean {
    return this.command.length > 0;
  }

  public constructor() {
    this.command = "";
    this.args = [];
  }
}

class CommandParser {
  static parseCommands(commands: string): Array<ParsedCommand> {
    const parsedCommands: Array<ParsedCommand> = [];
    const orderedCommands: Array<string> = commands.split(';');
    orderedCommands.forEach((c) => {
      const parsedCommand = this.parseCommand(c);
      if (parsedCommand.isValid()) {
        parsedCommands.push(parsedCommand);
      }
    });
    return parsedCommands;
  }

  static parseCommand(command: string): ParsedCommand {
    const parsedCommand = new ParsedCommand();
    const commandParts: string[] = command.trim().split(" ");
    if (commandParts.length > 0) {
      const args = commandParts.slice(1);
      parsedCommand.command = commandParts[0];
      parsedCommand.args = args;
    }
    return parsedCommand;
  }
}

export { CommandParser, ParsedCommand }