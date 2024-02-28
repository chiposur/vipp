import { FileSystem, File, Folder } from './fileSystem'
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
    this.commandMap.set(
      'cat',
      {
        name: 'cat',
        run: (args?: Array<string>): string => { return this.cat(args || []) }
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
    if (args.length === 0) {
      return "usage: touch [file]";
    }
    const name = args[0];
    const dir = this.terminalState.getCurrDir();
    if (dir.containsFile(name) || dir.containsFolder(name)) {
      return `"${name}" already exists in current directory`;
    }
    dir.addFile(new File(name, ''));
    return "new empty file created";
  }

  private ls(args: Array<string>): string {
    console.log(`ls called with ${args.length} args`);
    const dir = this.terminalState.getCurrDir();
    const folders = `${dir.children.map((f) => f.name).join(" ")}`;
    const files = `${dir.files.map((f) => f.name).join(" ")}`;
    const filesAndFolders = `${folders} ${files}`
    return filesAndFolders;
  }

  private cd(args: Array<string>): string {
    console.log(`cd called with ${args.length} args`);
    return 'cd not implemented';
  }

  private mkdir(args: Array<string>): string {
    console.log(`mkdir called with ${args.length} args`);
    if (args.length === 0) {
      return "usage: mkdir [folder]";
    }
    const name = args[0];
    const dir = this.terminalState.getCurrDir();
    if (dir.containsFolder(name) || dir.containsFile(name)) {
      return `"${name}" already exists in current directory`;
    }
    dir.addChildFolder(new Folder(name));
    return "new folder created";
  }

  private rm(args: Array<string>): string {
    console.log(`rm called with ${args.length} args`);
    if (args.length === 0) {
      return "usage: rm [file|folder]";
    }
    const name = args[0];
    const dir = this.terminalState.getCurrDir();
    const containsFile = dir.containsFile(name);
    const containsFolder = dir.containsFolder(name);
    const containsName = containsFile || containsFolder;
    if (!containsName) {
      return `"${name}" does not exist in current directory`;
    }
    if (containsFile) {
      dir.removeFile(name);
    }
    if (containsFolder) {
      dir.removeFolder(name);
    }
    return `"${name}" deleted`;
  }

  private pwd(args: Array<string>): string {
    console.log(`pwd called with ${args.length} args`);
    return this.terminalState.currDir.getFullName();
  }

  private cat(args: Array<string>): string {
    console.log(`cat called with ${args.length} args`);
    if (args.length === 0) {
      return "usage: cat [file]";
    }
    const name = args[0];
    const dir = this.terminalState.getCurrDir();
    const file = dir.getFile(name);
    if (!file) {
      return `file "${name}" does not exist in current directory`;
    }
    return file.text;
  }
}

export { TerminalCommand, TerminalCommands };
