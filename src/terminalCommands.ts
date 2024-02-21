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
  currCmdIndex: number

  public constructor(fileSystem: FileSystem, terminalState: TerminalState) {
    this.fileSystem = fileSystem;
    this.terminalState = terminalState;
    this.commandMap = new Map();
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
    this.currCmdIndex = -1;
  }

  public processCommand(command: string, args?: Array<string>): string {
    if (this.commandMap.has(command)) {
      const terminalCommand: TerminalCommand = this.commandMap.get(command);
      this.commandHistory.push(`${command} ${args.join(' ')}`)
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

  // cycleCommandUp cycles the command backwards in history
  // Returns empty string if the history cannot be cycled
  private cycleCommandUp(): string {
    let currIndex = this.currCmdIndex;
    if (currIndex == -1) {
      this.currCmdIndex = this.commandHistory.length - 1;
      return this.commandHistory[this.currCmdIndex];
    }
    currIndex -= 1;
    if (currIndex < 0) {
      return '';
    }
    this.currCmdIndex = currIndex;
    return this.commandHistory[this.currCmdIndex];
  }

  // cycleCommandDown cycles the command forwards in history
  // Returns empty string if the history cannot be cycled
  private cycleCommandDown(): string {
    let currIndex = this.currCmdIndex;
    if (currIndex == -1) {
      return '';
    }
    currIndex += 1;
    if (currIndex > this.commandHistory.length - 1) {
      return '';
    }
    this.currCmdIndex = currIndex;
    return this.commandHistory[this.currCmdIndex];
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
