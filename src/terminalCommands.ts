import { FileSystem } from './fileSystem'
import { TerminalState } from './terminalState'

class TerminalCommand {
  name: string
  run: (args?: Array<string>) => string
}

class TerminalCommands {
  fileSystem: FileSystem
  terminalState: TerminalState
  commandMap: Map<string, TerminalCommand>
  commandHistory: Array<string>
  cycledCommandIndex: number

  public constructor(fileSystem: FileSystem, terminalState: TerminalState) {
    this.fileSystem = fileSystem;
    this.terminalState = terminalState;
    this.commandMap = new Map();
    this.commandMap.set(
      'vipp',
      {
        name: 'vipp',
        run: (args?: Array<string>): string => { return this.vipp(args || []) }
      });
    this.commandMap.set(
      'touch',
      {
        name: 'touch',
        run: (args?: Array<string>): string => { return this.touch(args || []) }
      });
    this.commandMap.set(
      'ls',
      {
        name: 'ls',
        run: (args?: Array<string>): string => { return this.ls(args || []) }
      });
    this.commandMap.set(
      'cd',
      {
        name: 'cd',
        run: (args?: Array<string>): string => { return this.cd(args || []) }
      });
    this.commandMap.set(
      'mkdir',
      {
        name: 'mkdir',
        run: (args?: Array<string>): string => { return this.mkdir(args || []) }
      });
    this.commandMap.set(
      'rm',
      {
        name: 'rm',
        run: (args?: Array<string>): string => { return this.rm(args || []) }
      });
    this.commandMap.set(
      'pwd',
      {
        name: 'pwd',
        run: (args?: Array<string>): string => { return this.pwd(args || []) }
      });
    this.commandHistory = [];
    this.cycledCommandIndex = -1;
  }

  public processCommand(command: string, args?: Array<string>): string {
    this.cycledCommandIndex = -1;
    const argsText = args ? ` ${args.join(' ')}` : '';
    this.commandHistory.push(`${command}${argsText}`)
    if (this.commandMap.has(command)) {
      const terminalCommand: TerminalCommand = this.commandMap.get(command);
      return terminalCommand.run(args || []);
    }
    return `${command}: command not found`;
  }

  // cycleCommand returns a command forwards or backwards in history
  // Returns empty string if the history cannot be cycled
  public cycleCommand(isUp: boolean): string {
    if (isUp) {
      return this.cycleCommandUp();
    }
    return this.cycleCommandDown();
  }

  // cycleCommandUp returns the next command backwards in history
  // Returns empty string if the history cannot be cycled
  private cycleCommandUp(): string {
    let currIndex = this.cycledCommandIndex;
    if (currIndex === -1) {
      this.cycledCommandIndex = this.commandHistory.length - 1;
      return this.commandHistory[this.cycledCommandIndex];
    }
    currIndex -= 1;
    if (currIndex < 0) {
      return '';
    }
    this.cycledCommandIndex = currIndex;
    return this.commandHistory[this.cycledCommandIndex];
  }

  // cycleCommandDown returns the next command forwards in history
  // Returns empty string if the history cannot be cycled
  private cycleCommandDown(): string {
    let currIndex = this.cycledCommandIndex;
    if (currIndex === -1) {
      return '';
    }
    currIndex += 1;
    if (currIndex > this.commandHistory.length - 1) {
      return '';
    }
    this.cycledCommandIndex = currIndex;
    return this.commandHistory[this.cycledCommandIndex];
  }

  private vipp(args: Array<string>): string {
    console.log(`vipp called with ${args.length} args`);
    return 'vipp not implemented';
  }

  private touch(args: Array<string>): string {
    console.log(`touch called with ${args.length} args`);
    return 'touch not implemented';
  }

  private ls(args: Array<string>): string {
    console.log(`ls called with ${args.length} args`);
    return 'ls not implemented';
  }

  private cd(args: Array<string>): string {
    console.log(`cd called with ${args.length} args`);
    return 'cd not implemented';
  }

  private mkdir(args: Array<string>): string {
    console.log(`mkdir called with ${args.length} args`);
    return 'mkdir not implemented';
  }

  private rm(args: Array<string>): string {
    console.log(`rm called with ${args.length} args`);
    return 'rm not implemented';
  }

  private pwd(args: Array<string>): string {
    console.log(`pwd called with ${args.length} args`);
    return this.terminalState.currDir.getFullName();
  }
}

export { TerminalCommand, TerminalCommands };
