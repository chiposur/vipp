import { FileSystem } from './fileSystem'
import { TerminalCommands } from './terminalCommands'
import { TerminalState } from './terminalState'
import { Point } from './types'

class Terminal {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  fileSystem: FileSystem
  commands: TerminalCommands
  state: TerminalState
  resizeObserver: ResizeObserver

  public constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.resizeObserver = new ResizeObserver(() => {
      this.syncCanvasResolution();
      this.render();
    });
    this.resizeObserver.observe(this.canvas);
    this.init();
  }

  private init() {
    this.fileSystem = new FileSystem();
    this.state = new TerminalState();
    this.state.setCurrDir(this.fileSystem.root);
    this.commands = new TerminalCommands(this.fileSystem, this.state);
    this.registerHandlers();
    this.syncCanvasResolution();
    this.drawNewPromptRow();
    this.render();
  }

  private registerHandlers() {
    const eventTarget = document.getElementById("canvas-wrapper");
    eventTarget.addEventListener("keydown", (e: KeyboardEvent) => this.onKeyDown(e));
  }

  private clearTerminal() {
    this.state.textLines = [];
    this.state.currLinePos = new Point(0, 0);
    this.drawNewPromptRow();
    this.render();
  }

  private isUTF16(code: string): boolean {
    if (code.length < 0) {
      return false;
    }
    const charCode = code.charCodeAt(0);
    if (!charCode) {
      return false;
    }
    return code.charCodeAt(0) <= 65535;
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key.length === 1 && this.isUTF16(e.code)) {
      this.drawText(e.key);
      const currCmd = this.state.getCurrTextLineCmd();
      const newCmd = `${currCmd}${e.key}`;
      this.state.setCurrTextLineCmd(newCmd);
    }
  }

  private handleBackspace() {
    const currCmd = this.state.getCurrTextLineCmd();
    if (currCmd) {
      const newCmd = currCmd.substring(0, currCmd.length - 2);
      this.state.setCurrTextLineCmd(newCmd);
      this.state.currLinePos.x -= 1;
      this.translateCursor(-1, 0);
      this.render();
    }
  }

  private clearCurrentLine() {
    this.state.setCurrTextLineCmd("");
    this.render();
  }

  private handleEnter() {
    this.moveToNewline();
    const currLineCmd = this.state.getCurrTextLineCmd();
    if (currLineCmd) {
      const output = this.commands.processCommand(currLineCmd);
      this.drawText(output);
      this.state.textLines.push(output);
      this.moveToNewline();
    }
    this.drawNewPromptRow();
  }

  private handleCycleHistory(up: boolean) {
    const cycledCommand = this.commands.cycleCommand(up);
    if (cycledCommand) {
      this.state.setCurrTextLineCmd(cycledCommand);
      this.render();
    }
  }

  private translateCursor(x: number, y: number) {
    const translatedX = Math.max(Math.min(this.state.cursorPos.x + x, this.canvas.width), 0);
    const translatedY = Math.max(Math.min(this.state.cursorPos.y + y, this.canvas.height), 0);
    this.state.cursorPos = new Point(translatedX, translatedY);
    this.state.cursorIndex = translatedX;
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "k") {
      this.clearTerminal();
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key === "u") {
      this.clearCurrentLine();
      e.preventDefault();
      return;
    }
    switch (e.key) {
      case "Enter":
        this.handleEnter();
        break;
      case "Backspace":
        this.handleBackspace();
        break;
      case "ArrowUp":
        this.handleCycleHistory(true);
        break;
      case "ArrowDown":
        this.handleCycleHistory(false);
        break;
      default:
        this.handleKeyPress(e);
    }
  }

  private syncCanvasResolution() {
    if (this.canvas.width != this.canvas.clientWidth) {
      this.canvas.width = this.canvas.clientWidth;
    }
    if (this.canvas.height != this.canvas.clientHeight) {
      this.canvas.height = this.canvas.clientHeight;
    }
  }

  private render() {
    this.state.currLinePos = new Point(0, 0);
    this.drawBg();
    this.drawTextLines();
  }

  private drawTextLines() {
    this.setFontStyle();
    this.state.textLines.forEach((line, index) => {
      this.drawText(line);
      if (index != this.state.textLines.length - 1) {
        this.moveToNewline();
      }
    });
  }

  private drawBg() {
    this.ctx.fillStyle = this.state.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private getLineHeight(textLine: string) {
    const textMetrics = this.ctx.measureText(textLine);
    return textMetrics.fontBoundingBoxAscent +
      textMetrics.fontBoundingBoxDescent +
      this.state.textLinePadding;
  }

  private moveToNewline() {
    const lastLine = this.state.textLines[this.state.textLines.length - 1];
    const textMetrics = this.ctx.measureText(lastLine);
    const lineWidth = textMetrics.width;
    const numRows = Math.max(1, Math.ceil(lineWidth / this.canvas.width));
    this.state.currLinePos.x = 0;
    this.state.currLinePos.y += numRows * this.getLineHeight(lastLine);
  }

  private drawText(textLine: string) {
    this.ctx.fillText(
      textLine,
      this.state.currLinePos.x + this.state.textLinePadding,
      this.state.currLinePos.y + this.state.textLinePadding);
    const textMetrics = this.ctx.measureText(textLine);
    this.state.currLinePos.x += textMetrics.width;
  }

  private drawNewPromptRow() {
    this.setFontStyle();
    this.ctx.fillText(
      this.state.prompt,
      this.state.currLinePos.x + this.state.textLinePadding,
      this.state.currLinePos.y + this.state.textLinePadding);
    const textMetrics = this.ctx.measureText(this.state.prompt);
    this.state.currLinePos.x += textMetrics.width;
    this.state.textLines.push(this.state.prompt);
    this.state.setCurrTextLineCmd("");
  }

  private setFontStyle() {
    this.ctx.font = this.state.getFont();
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = this.state.getFontColor();
  }
}

export { Terminal };
