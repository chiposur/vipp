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
  }

  public processCommand(command: string, args?: Array<string>): string {
    if (this.commandMap.has(command)) {
      const terminalCommand: TerminalCommand = this.commandMap.get(command);
      return terminalCommand.run(args || []);
    }
    return `${command}: command not found`;
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
