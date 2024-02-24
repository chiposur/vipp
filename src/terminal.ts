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
    this.state.currLinePt = new Point(0, 0);
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
      const lastLine = this.state.textLines[this.state.textLines.length - 1];
      const newLastLine = `${lastLine}${e.key}`;
      this.state.setCurrTextLine(newLastLine);
    }
  }

  private handleBackspace() {
    const lastLine = this.state.textLines[this.state.textLines.length - 1];
    const promptLen = this.state.prompt.length;
    if (lastLine.length > promptLen) {
      const newLastLine = lastLine.substring(0, lastLine.length - 1);
      this.state.setCurrTextLine(newLastLine);
      this.state.currLinePt.x -= 1;
      this.render();
    }
  }

  private clearCurrentLine() {
    this.state.setCurrTextLine(this.state.prompt);
    this.render();
  }

  private handleEnter() {
    this.moveToNewline();
    const currLine = this.state.textLines[this.state.textLines.length - 1];
    const promptLen = this.state.prompt.length;
    const hasCommand = currLine.length > promptLen;
    if (hasCommand) {
      const parsedCommand = currLine.substring(promptLen);
      const output = this.commands.processCommand(parsedCommand);
      this.drawText(output);
      this.state.textLines.push(output);
      this.moveToNewline();
    }
    this.drawNewPromptRow();
  }

  private handleCycleHistory(up: boolean) {
    const cycledCommand = this.commands.cycleCommand(up);
    if (cycledCommand) {
      this.clearCurrentLine();
      this.drawText(cycledCommand);
      this.state.setCurrTextLine(`${this.state.prompt}${cycledCommand}`);
    }
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
    this.state.currLinePt = new Point(0, 0);
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
    this.state.currLinePt.x = 0;
    this.state.currLinePt.y += numRows * this.getLineHeight(lastLine);
  }

  private drawText(textLine: string) {
    this.ctx.fillText(
      textLine,
      this.state.currLinePt.x + this.state.textLinePadding,
      this.state.currLinePt.y + this.state.textLinePadding);
    const textMetrics = this.ctx.measureText(textLine);
    this.state.currLinePt.x += textMetrics.width;
  }

  private drawNewPromptRow() {
    this.setFontStyle();
    this.ctx.fillText(
      this.state.prompt,
      this.state.currLinePt.x + this.state.textLinePadding,
      this.state.currLinePt.y + this.state.textLinePadding);
    const textMetrics = this.ctx.measureText(this.state.prompt);
    this.state.currLinePt.x += textMetrics.width;
    this.state.textLines.push(this.state.prompt);
  }

  private setFontStyle() {
    this.ctx.font = this.state.getFont();
    this.ctx.textBaseline = "top";
    this.ctx.fillStyle = this.state.getFontColor();
  }
}

export { Terminal };
