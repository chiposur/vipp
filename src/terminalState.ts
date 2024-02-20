import { FileSystem, Folder } from './fileSystem'
import { Point } from './types'

class TerminalState {
  fileSystem: FileSystem
  currDir: Folder
  currLinePt: Point
  prompt: string
  fontName: string
  fontSz: string
  fontColor: string
  textBaseline: string

  public constructor(fileSystem: FileSystem) {
    this.fileSystem = fileSystem;
    this.currLinePt = new Point(0, 0);
    this.fontName = "sans-serif";
    this.fontSz = "16px";
    this.fontColor = "white";
    this.setCurrDir(this.fileSystem.root);
  }

  public getFont(): string {
    return `${this.fontSz} ${this.fontName}`;
  }

  public getFontColor(): string {
    return this.fontColor;
  }

  public setCurrDir(folder: Folder) {
    this.currDir = folder;
    this.prompt = `[user@vipp-editor ${this.currDir.name}]$ `
  }

  public getPrompt() {
    return this.prompt;
  }

  public getPwd() {
    return this.currDir.getFullName();
  }
}

export { TerminalState };
