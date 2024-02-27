import { Folder } from './fileSystem'
import { Point } from './types'

class TerminalState {
  currDir: Folder
  currLinePos: Point
  cursorPos: Point
  cursorIndex: number
  prompt: string
  fontName: string
  fontSize: string
  fontColor: string
  bgColor: string
  textBaseline: string
  textLines: Array<string>
  textLinePadding: number
  cursorPaddingLeft: number
  cursorPaddingTop: number
  currTextLineCmd: string

  public constructor() {
    this.currLinePos = new Point(0, 0);
    this.cursorPos = new Point(0, 0);
    this.cursorIndex = 0;
    this.currTextLineCmd = ""
    this.fontName = "sans-serif";
    this.fontSize = "16px";
    this.fontColor = "white";
    this.bgColor = "black";
    this.textLines = [];
    this.currTextLineCmd = ""
    this.textLinePadding = 8;
    this.cursorPaddingLeft = 9;
    this.cursorPaddingTop = 4;
    this.prompt = "";
  }

  public getFont(): string {
    return `${this.fontSize} ${this.fontName}`;
  }

  public getFontColor(): string {
    return this.fontColor;
  }

  public getBgColor(): string {
    return this.bgColor;
  }

  public getCurrDir(): Folder {
    return this.currDir;
  }

  public setCurrDir(folder: Folder) {
    this.currDir = folder;
    this.prompt = `[user@vipp-editor ${this.currDir.name}]$ `
  }

  public getPrompt(): string {
    return this.prompt;
  }

  public getPwd(): string {
    return this.currDir?.getFullName() || "";
  }

  public setCurrTextLineCmd(cmd: string) {
    this.textLines[this.textLines.length - 1] = `${this.prompt}${cmd}`;
    this.currTextLineCmd = cmd;
  }

  public getCurrTextLineCmd(): string {
    return this.currTextLineCmd;
  }

  public setCurrLinePos(currLinePos: Point) {
    this.currLinePos = currLinePos;
  }

  public getCurrLinePos(): Point {
    return this.currLinePos;
  }

  public setCursorPos(cursorPos: Point) {
    this.cursorPos = cursorPos;
  }

  public getCursorPos(): Point {
    return this.cursorPos;
  }
}

export { TerminalState };
