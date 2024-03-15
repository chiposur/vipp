class TokenizedCommand {
  command: string
  args: Array<string>
  isOperator: boolean
  next: TokenizedCommand

  public isValid(): boolean {
    return this.command.length > 0;
  }

  public constructor() {
    this.command = '';
    this.args = [];
    this.isOperator = false;
  }
}

class FirstOperatorResult {
  operator: string
  index: number
}

class CommandParser {
  static isOperator(command: string): boolean {
    return command === '|' || command === '>' || command === '>>';
  }

  static isRedirectOperator(command: string): boolean {
    return command === '>' || command === '>>';
  }

  static findFirstOperator(startIndex: number, command: string): FirstOperatorResult {
    for (let i = startIndex; i < command.length; i += 1) {
      const currChar = command[i];
      const isPipe = currChar === '|';
      if (isPipe) {
        return {
          operator: '|',
          index: i,
        };
      }
      const isWriteFile = currChar === '>'
      const isLastChar = i === command.length - 1;
      if (isWriteFile && !isLastChar) {
        const nextChar = command[i+1];
        if (`${currChar}${nextChar}` === '>>') {
          return {
            operator: '>>',
            index: i+1,
          }
        }
      }
      if (isWriteFile) {
        return {
          operator: '>',
          index: i,
        };
      }
    }
    return {
      operator: '',
      index: -1,
    };
  }

  static parseCommands(commands: string): Array<TokenizedCommand> {
    const commandChains: Array<string> = commands.split(';');
    const parsedCommands: Array<TokenizedCommand> = [];
    commandChains.forEach((c) => {
      const tokenChain = this.parseCommandChain(c);
      if (tokenChain.isValid()) {
        parsedCommands.push(tokenChain);
      }
    });
    return parsedCommands;
  }

  static parseCommandChain(commandChain: string): TokenizedCommand {
    const segments = commandChain.split(/>+|\|/);
    const tokenizedCommand = this.parseCommand(segments[0]);
    let prev = tokenizedCommand;
    let processedLength = 0;
    segments.slice(1).forEach((s) => {
      const operator = new TokenizedCommand();
      const firstOperatorResult = this.findFirstOperator(processedLength, commandChain);
      operator.command = firstOperatorResult.operator;
      processedLength = firstOperatorResult.index + 1;
      operator.isOperator = true;
      prev.next = operator;
      prev = operator;
      if (this.isRedirectOperator(prev.command)) {
        operator.args = s.trim().split(' ');
        return;
      }
      const newCommand = this.parseCommand(s);
      prev.next = newCommand;
      prev = newCommand;
    });
    return tokenizedCommand;
  }

  static parseCommand(command: string): TokenizedCommand {
    const parsedCommand = new TokenizedCommand();
    const commandParts: string[] = command.trim().split(' ');
    if (commandParts.length > 0) {
      const args = commandParts.slice(1);
      parsedCommand.command = commandParts[0];
      parsedCommand.args = args;
      parsedCommand.isOperator = this.isOperator(parsedCommand.command);
    }
    return parsedCommand;
  }
}

export { CommandParser, TokenizedCommand }
