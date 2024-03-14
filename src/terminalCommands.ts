import { CommandParser, TokenizedCommand } from './commandParser'
import { FileSystem, File, Folder } from './fileSystem'
import { Storage } from './storage'
import { TerminalState } from './terminalState'

class TerminalCommand {
  name: string
  run: (input?: string, args?: Array<string>) => CommandResult
}

class CommandResult {
  ExitStatus: number
  Output: Array<string>
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
        run: (_input?: string, args?: Array<string>): CommandResult => { return this.vipp(args || []) }
      });
    this.commandMap.set(
      'touch',
      {
        name: 'touch',
        run: (_input?: string, args?: Array<string>): CommandResult => { return this.touch(args || []) }
      });
    this.commandMap.set(
      'ls',
      {
        name: 'ls',
        run: (_input?: string, args?: Array<string>): CommandResult => { return this.ls(args || []) }
      });
    this.commandMap.set(
      'cd',
      {
        name: 'cd',
        run: (_input?: string, args?: Array<string>): CommandResult => { return this.cd(args || []) }
      });
    this.commandMap.set(
      'mkdir',
      {
        name: 'mkdir',
        run: (_input?: string, args?: Array<string>): CommandResult => { return this.mkdir(args || []) }
      });
    this.commandMap.set(
      'rm',
      {
        name: 'rm',
        run: (_input?: string, args?: Array<string>): CommandResult => { return this.rm(args || []) }
      });
    this.commandMap.set(
      'pwd',
      {
        name: 'pwd',
        run: (_input?: string, args?: Array<string>): CommandResult => { return this.pwd(args || []) }
      });
    this.commandMap.set(
      'cat',
      {
        name: 'cat',
        run: (_input?: string, args?: Array<string>): CommandResult => { return this.cat(args || []) }
      });
    this.commandMap.set(
      'echo',
      {
        name: 'echo',
        run: (input?: string, args?: Array<string>): CommandResult => { return this.echo(input || '', args || []) }
      });
    this.commandHistory = [];
    this.cycledCommandIndex = -1;
  }

  public processCommands(commands: string): Array<CommandResult> {
    this.cycledCommandIndex = -1;
    this.commandHistory.push(commands);
    const tokenizedCommands = CommandParser.parseCommands(commands);
    const output: Array<CommandResult> = [];
    tokenizedCommands.forEach((c) => {
      const commandResult = this.processCommand(c);
      output.push(commandResult);
    });
    return output;
  }

  private processCommand(tokenizedCommand: TokenizedCommand): CommandResult {
    let curr = tokenizedCommand;
    let nextInput = '';
    let commandResult;
    while (curr) {
      if (!curr) {
        return commandResult;
      }
      if (curr.isOperator) {
        commandResult = this.handleOperator(nextInput, curr);
      } else if (this.commandMap.has(curr.command)) {
        const terminalCommand: TerminalCommand = this.commandMap.get(curr.command);
        commandResult = terminalCommand.run(nextInput, curr.args || []);
        nextInput = commandResult.Output.join('\n');
      } else {
        return {
          ExitStatus: 1,
          Output: [`${curr.command}: command not found`]
        };
      }
      curr = curr.next;
    }
    return commandResult;
  }

  private handleOperator(input: string, tokenizedCommand: TokenizedCommand): CommandResult {
    let output = input;
    let exitStatus = 0;
    const operator = tokenizedCommand.command;
    const args = tokenizedCommand.args;
    const firstArg = args.length > 0 ? args[0] : '';
    switch (operator) {
      case '|':
        break;
      case '>':
        output = '';
        this.writeToFile(input, firstArg);
        break;
      case '>>':
        output = '';
        this.appendToFile(input, firstArg);
        break;
      default:
        exitStatus = 1;
        console.debug(`Operator '${operator}' not found`);
    }
    return {
      Output: output ? [output] : [],
      ExitStatus: exitStatus,
    };
  }

  private writeToFile(input: string, filename: string) {
    if (!filename) {
      return;
    }
    let dir = this.terminalState.currDir;
    const folderParts = filename.split('/');
    if (folderParts.length > 1) {
      const folderResult = this.fileSystem.resolveFolder(dir, folderParts.slice(1).join(''));
      if (folderResult.exists) {
        dir = folderResult.folder;
      } else {
        return;
      }
    }
    const file = dir.getFile(filename);
    if (file) {
      file.text = input;
      Storage.saveFileText(file);
    }
  }

  private appendToFile(input: string, filename: string) {
    if (!filename) {
      return;
    }
    let dir = this.terminalState.currDir;
    const folderParts = filename.split('/');
    if (folderParts.length > 1) {
      const folderResult = this.fileSystem.resolveFolder(dir, folderParts.slice(1).join(''));
      if (folderResult.exists) {
        dir = folderResult.folder;
      } else {
        return;
      }
    }
    const file = dir.getFile(filename);
    if (file) {
      file.text = `${file.text}${input}`;
      Storage.saveFileText(file);
    }
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

  private vipp(args: Array<string>): CommandResult {
    console.debug(`vipp called with ${args.length} args`);
    return {
      ExitStatus: 1,
      Output: ['vipp not implemented']
    };
  }

  private touch(args: Array<string>): CommandResult {
    console.debug(`touch called with ${args.length} args`);
    if (args.length === 0) {
      return {
        ExitStatus: 1,
        Output: ['usage: touch [file]']
      };
    }
    const name = args[0];
    const dir = this.terminalState.currDir;
    if (dir.containsFile(name) || dir.containsFolder(name)) {
      return {
        ExitStatus: 1,
        Output: [`"${name}" already exists in current directory`],
      };
    }
    const file = new File(name, '');
    file.setParent(dir);
    dir.addFile(file);
    Storage.saveFileText(file);
    Storage.saveFileSystem(this.fileSystem.root);
    return {
      ExitStatus: 0,
      Output: [],
    };
  }

  private ls(args: Array<string>): CommandResult {
    console.debug(`ls called with ${args.length} args`);
    const dir = this.terminalState.currDir;
    if (dir.children.length === 0 && dir.files.length === 0) {
      return {
        ExitStatus: 0,
        Output: [],
      };
    }
    const folders = `${dir.children.map((f) => `${f.name}/`).join(' ')}`;
    const files = `${dir.files.map((f) => f.name).join(' ')}`;
    const filesAndFolders = `${folders} ${files}`;
    return {
      ExitStatus: 0,
      Output: [filesAndFolders],
    };
  }

  private cd(args: Array<string>): CommandResult {
    console.debug(`cd called with ${args.length} args`);
    if (args.length === 0) {
      return {
        ExitStatus: 1,
        Output: ['usage: cd [folder path]'],
      };
    }
    const dir = this.terminalState.currDir;
    const path = args[0];
    const result = this.fileSystem.resolveFolder(dir, path);
    if (result.exists)
    {
      this.terminalState.setCurrDir(result.folder);
      return {
        ExitStatus: 0,
        Output: [],
      };
    }
    return {
      ExitStatus: 1,
      Output: [`folder path "${path}" does not exist`],
    };
  }

  private mkdir(args: Array<string>): CommandResult {
    console.debug(`mkdir called with ${args.length} args`);
    if (args.length === 0) {
      return {
        ExitStatus: 1,
        Output: ['usage: mkdir [folder]']
      };
    }
    const name = args[0];
    const dir = this.terminalState.currDir;
    if (dir.containsFolder(name) || dir.containsFile(name)) {
      return {
        ExitStatus: 1,
        Output: [`"${name}" already exists in current directory`],
      };
    }
    const folder = new Folder(name);
    folder.setParent(dir);
    dir.addChildFolder(folder);
    Storage.saveFileSystem(this.fileSystem.root);
    return {
      ExitStatus: 0,
      Output: [],
    };
  }

  private rm(args: Array<string>): CommandResult {
    console.debug(`rm called with ${args.length} args`);
    if (args.length === 0) {
      return {
        ExitStatus: 1,
        Output: ['usage: rm [file|folder]'],
      };
    }
    const name = args[0];
    const dir = this.terminalState.currDir;
    const containsFile = dir.containsFile(name);
    const containsFolder = dir.containsFolder(name);
    const containsName = containsFile || containsFolder;
    if (!containsName) {
      return {
        ExitStatus: 1,
        Output: [`"${name}" does not exist in current directory`],
      };
    }
    if (containsFile) {
      const index = dir.files.findIndex((f) => f.name === name);
      const file = dir.files[index];
      Storage.removeFileText(file);
      dir.removeFile(name);
    }
    if (containsFolder) {
      dir.removeFolder(name);
    }
    Storage.saveFileSystem(this.fileSystem.root);
    return {
      ExitStatus: 0,
      Output: [],
    };
  }

  private pwd(args: Array<string>): CommandResult {
    console.debug(`pwd called with ${args.length} args`);
    return {
      ExitStatus: 0,
      Output: [this.terminalState.currDir.getFullName()],
    };
  }

  private cat(args: Array<string>): CommandResult {
    console.debug(`cat called with ${args.length} args`);
    if (args.length === 0) {
      return {
        ExitStatus: 1,
        Output: ['usage: cat [file]'],
      };
    }
    const name = args[0];
    const dir = this.terminalState.currDir;
    const file = dir.getFile(name);
    if (!file) {
      return {
        ExitStatus: 1,
        Output: [`file "${name}" does not exist in current directory`],
      };
    }
    return {
      ExitStatus: 0,
      Output: file.text.split('\n'),
    }
  }

  private echo(input: string, args: Array<string>): CommandResult {
    console.debug(`echo called with ${args.length} args`);
    const echoText = `${input}${args.join(' ')}`;
    return {
      ExitStatus: 0,
      Output: echoText.length > 0 ? echoText.split('\n') : [],
    }
  }
}

export { TerminalCommand, CommandResult, TerminalCommands };
