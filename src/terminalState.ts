import { Folder } from './fileSystem'
import { Point } from './types'

class TerminalState {
  public bgColor: string
  public currDir: Folder
  public currLinePos: Point
  public currTextLineCmd: string
  public cursorIndex: number
  public cursorPaddingLeft: number
  public cursorPaddingTop: number
  public cursorPos: Point
  public fontColor: string
  public fontLoaded: boolean
  public fontName: string
  public prompt: string
  public textLines: Array<string>

  private fontSize: string
  private startingPos: Point

  public constructor() {
    const framePaddingLeft = 4;
    const framePaddingTop = 8;
    this.startingPos = new Point(framePaddingLeft, framePaddingTop);
    this.currLinePos = Point.from(this.startingPos);
    this.cursorPos = Point.from(this.startingPos);
    this.cursorIndex = 0;
    this.currTextLineCmd = '';
    this.fontName = 'Roboto Mono';
    this.fontSize = '16px';
    this.fontColor = 'white';
    this.fontLoaded = false;
    this.bgColor = 'black';
    this.textLines = [];
    this.currTextLineCmd = '';
    this.cursorPaddingLeft = 0;
    this.cursorPaddingTop = -2;
    this.prompt = '';
  }

  public getDefaultFont(): string {
    return `24px Arial`
  }

  public getFont(): string {
    return `${this.fontSize} ${this.fontName}`;
  }

  public setCurrDir(folder: Folder) {
    this.currDir = folder;
    this.prompt = `[user@vipp-editor ${this.currDir.name}]$ `
  }

  public getPwd(): string {
    return this.currDir?.getFullName() || '';
  }

  public setCursorIndex(index: number) {
    if (index > -1 && index <= this.currTextLineCmd.length) {
      this.cursorIndex = index;
    }
  }

  public setCurrTextLineCmd(cmd: string) {
    this.textLines[this.textLines.length - 1] = `${this.prompt}${cmd}`;
    this.currTextLineCmd = cmd;
  }

  public getNewStartingPos(): Point {
    return Point.from(this.startingPos);
  }
}

export { TerminalState };
