import { FileSystem, File } from './fileSystem'
import { Storage } from './storage'
import { TerminalCommands } from './terminalCommands'
import { TerminalState } from './terminalState'
import { Point } from './types'

class Terminal {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private fileSystem: FileSystem
  private commands: TerminalCommands
  private state: TerminalState
  private resizeObserver: ResizeObserver
  private cursorInterval: number
  private cursorVisible: boolean
  private renderInProgress: boolean

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
    this.fileSystem = Storage.loadFileSystem();
    this.state = new TerminalState();
    this.state.setCurrDir(this.fileSystem.root);
    this.commands = new TerminalCommands(this.fileSystem, this.state);
    this.loadFont();
    this.registerHandlers();
    this.syncCanvasResolution();
    this.addAndShowReadme();
    this.drawNewPromptRow();
    this.render();
    this.cursorInterval = window.setInterval(() => this.animateCursor(), 800);
  }

  private loadFont() {
    const fontFilename = 'roboto.ttf';
    const font = new FontFace(this.state.fontName, `url(${fontFilename})`);
    font.load().then(() => {
      this.state.fontLoaded = true;
      this.render();
    });
  }

  private addAndShowReadme() {
    if (this.state.currDir.containsFile('readme')) {
      // ~/readme is special file that should not be overwriteable
      this.state.currDir.files = this.state.currDir.files.filter((f) => f.name !== 'readme');
    }
    const readmeText = `
      Vipp Editor
      © ${new Date().getFullYear()} Chip Osur
      Usage: https://github.com/chiposur/vipp
    `;
    const readme = new File('readme', readmeText);
    const root = this.fileSystem.root;
    root.addFile(readme);
    readme.text.split('\n').forEach((line) => {
      this.state.textLines.push(line);
    });
  }

  private registerHandlers() {
    const eventTarget = document.getElementById('terminal');
    eventTarget.addEventListener('keydown', (e: KeyboardEvent) => this.onKeyDown(e));
  }

  private clearTerminal() {
    this.state.textLines = [];
    this.state.currLinePos = this.state.getNewStartingPos();
    this.drawNewPromptRow();
    this.render();
  }

  private clearCurrentLine() {
    this.state.setCurrTextLineCmd('');
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

  private getMaxCharactersPerRow(): number {
    const monospacedCharacter = 'a';
    const textMetrics = this.ctx.measureText(monospacedCharacter);
    return Math.floor(this.canvas.width / textMetrics.width);
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key.length === 1 && this.isUTF16(e.code)) {
      const currCmd = this.state.currTextLineCmd;
      const index = this.state.cursorIndex;
      const newCmd =
        `${currCmd.substring(0, index)}${e.key}${currCmd.substring(index)}`;
      this.state.setCurrTextLineCmd(newCmd);
      this.state.setCursorIndex(index + 1);
      this.render();
    }
  }

  private handleBackspace() {
    const currCmd = this.state.currTextLineCmd;
    if (currCmd) {
      const cursorIndex = this.state.cursorIndex - 1;
      const newCmd =
        currCmd.split('').filter((_, i) => i !== cursorIndex).join('');
      this.state.setCurrTextLineCmd(newCmd);
      this.state.setCursorIndex(cursorIndex);
      this.render();
    }
  }

  private handleEnter() {
    this.moveToNewline();
    const currLineCmd = this.state.currTextLineCmd;
    if (currLineCmd) {
      const commandResults = this.commands.processCommands(currLineCmd);
      commandResults.forEach((r) => {
        if (r.output) {
          r.output.forEach((l) => this.state.textLines.push(l));
        }
        this.moveToNewline();
      });
    }
    this.drawNewPromptRow();
    this.render();
  }

  private handleCycleHistory(up: boolean) {
    const cycledCommand = this.commands.cycleCommand(up);
    if (cycledCommand) {
      this.state.setCurrTextLineCmd(cycledCommand);
      this.state.setCursorIndex(cycledCommand.length);
      this.render();
    }
  }

  private findNextWord(startIndex: number, line: string, incrementor: number) {
    let index = startIndex + incrementor;
    while (index > 0 && index < line.length) {
      const nextIndex = index + incrementor;
      if (nextIndex === 0 || nextIndex === line.length) {
        return nextIndex;
      }
      const nextChar = line[index - 1];
      const currChar = line[index];
      if (nextChar === ' ' && currChar !== ' ') {
        return index;
      }
      index += incrementor;
    }
    return -1;
  }

  private handleTraverseWord(isLeft: boolean) {
    const currLine = this.state.currTextLineCmd;
    const currIndex = this.state.cursorIndex;
    const incrementor = isLeft ? -1 : 1;
    const newIndex = this.findNextWord(currIndex, currLine, incrementor);
    if (newIndex > -1) {
      this.state.setCursorIndex(newIndex);
      this.render();
    }
  }

  private handleTraverseCharacter(isLeft: boolean) {
    const incrementor = isLeft ? -1 : 1;
    const index = this.state.cursorIndex + incrementor;
    this.state.setCursorIndex(index);
    this.render();
  }

  private translateCursor(x: number, y: number) {
    const translatedX = Math.max(Math.min(this.state.cursorPos.x + x, this.canvas.width), 0);
    const translatedY = Math.max(Math.min(this.state.cursorPos.y + y, this.canvas.height), 0);
    this.state.cursorPos = new Point(translatedX, translatedY);
  }

  private readPasteTextComplete(pasteText: string) {
    const currCmd = this.state.currTextLineCmd;
    let newCmd;
    if (this.state.cursorIndex > currCmd.length - 1) {
      newCmd = `${currCmd}${pasteText}`;
    } else {
      newCmd = currCmd.split('').map((val, index) => {
        if (index === this.state.cursorIndex) {
          return `${pasteText}${val}`;
        }
        return val;
      }).join('');
    }
    this.state.setCurrTextLineCmd(newCmd);
    const newCursorIndex = this.state.cursorIndex + pasteText.length;
    this.state.setCursorIndex(newCursorIndex);
    this.render();
  }

  private handlePaste() {
    navigator.clipboard.readText().then((pasteText) => this.readPasteTextComplete(pasteText));
  }

  private deleteToWhitespace() {
    const currLine = this.state.currTextLineCmd;
    const currIndex = this.state.cursorIndex;
    if (currIndex === 0) {
      return;
    }
    const startIndex = currIndex;
    const incrementor = -1;
    let newIndex = this.findNextWord(currIndex, currLine, incrementor);
    if (newIndex === -1) {
      newIndex = 0;
    }
    this.state.setCurrTextLineCmd(
      `${currLine.substring(0, newIndex)}${currLine.substring(startIndex)}`);
    this.state.setCursorIndex(newIndex);
    this.render();
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'ArrowLeft') {
      this.handleTraverseWord(true);
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key === 'ArrowRight') {
      this.handleTraverseWord(false);
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key === 'd') {
      this.deleteToWhitespace();
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key === 'k') {
      this.clearTerminal();
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key === 'u') {
      this.clearCurrentLine();
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key === 'v') {
      this.handlePaste();
      e.preventDefault();
      return;
    }
    switch (e.key) {
      case 'Enter':
        this.handleEnter();
        break;
      case 'Backspace':
        this.handleBackspace();
        break;
      case 'ArrowUp':
        this.handleCycleHistory(true);
        break;
      case 'ArrowDown':
        this.handleCycleHistory(false);
        break;
      case 'ArrowLeft':
        this.handleTraverseCharacter(true);
        break;
      case 'ArrowRight':
        this.handleTraverseCharacter(false);
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
    if (this.detectUnsupportedUserAgent()) {
      window.clearInterval(this.cursorInterval);
      this.drawUnsupportedFrame();
      return;
    }
    if (!this.state.fontLoaded) {
      this.drawFontsLoadingFrame();
      return;
    }
    this.renderInProgress = true;
    this.state.currLinePos = this.state.getNewStartingPos();
    this.drawBg();
    this.drawTextLines();
    this.renderInProgress = false;
  }

  private detectUnsupportedUserAgent(): boolean {
    const userAgent: string = window.navigator.userAgent;
    switch (userAgent) {
      case '/Android/i':
        return true;
      case '/BlackBerry/i':
        return true;
      case '/iPhone/i':
        return true;
      case '/iPad/i':
        return true;
      case '/Opera Mini/i':
        return true;
      case '/IEMobile/i':
        return true;
      default:
        return false;
    }
  }

  private drawCenteredMessageFrame(text: string) {
    this.drawBg();
    this.setFontStyle();
    const textMetrics = this.ctx.measureText(text);
    const x =
      Math.max(0, Math.floor(this.canvas.width / 2) - Math.floor(textMetrics.width / 2));
    const y =
      Math.max(0, Math.floor(this.canvas.height / 2) - Math.floor(this.getLineHeight() / 2));
    this.ctx.fillText(
      text,
      x,
      y,
    );
  }

  private drawFontsLoadingFrame() {
    const text = 'Fonts loading...';
    this.drawCenteredMessageFrame(text);
  }

  private drawUnsupportedFrame() {
    const text = 'Mobile browsers are unsupported.';
    this.drawCenteredMessageFrame(text);
  }

  private setCursorPosFromIndex() {
    this.state.cursorPos = Point.from(this.state.currLinePos);
    const index = this.state.cursorIndex;
    const cmdText = this.state.currTextLineCmd;
    const oldPosWidth =
      this.ctx.measureText(cmdText).width;
    const newPosWidth =
      this.ctx.measureText(cmdText.substring(0, index)).width;
    this.translateCursor(newPosWidth - oldPosWidth, 0);
  }

  private getStartingVisibleTextLineIndex() {
    const visibleEndIndex = this.state.textLines.length - 1;
    let visibleStartIndex = 0;
    let visibleHeight = 0;
    const lineHeight = this.getLineHeight();
    for (let i = visibleEndIndex; i >= 0; i -= 1) {
      visibleHeight += lineHeight;
      if (visibleHeight > this.canvas.height) {
        visibleStartIndex = i + 1;
        break;
      }
    }
    return visibleStartIndex;
  }

  private drawTextLines() {
    const visibleStartIndex = this.getStartingVisibleTextLineIndex();
    this.setFontStyle();
    const visibleLines = this.state.textLines.slice(visibleStartIndex);
    visibleLines.forEach((line, index) => {
      this.drawText(line);
      if (index != visibleLines.length - 1) {
        this.moveToNewline();
      }
    });
    this.setCursorPosFromIndex();
    this.drawCursor();
  }

  private drawBg() {
    this.ctx.fillStyle = this.state.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private getLineHeight() {
    const monospacedCharacter = 'a';
    const textMetrics = this.ctx.measureText(monospacedCharacter);
    return textMetrics.fontBoundingBoxAscent +
      textMetrics.fontBoundingBoxDescent;
  }

  private moveToNewline() {
    const currLinePos = this.state.currLinePos;
    currLinePos.x = this.state.getNewStartingPos().x;
    currLinePos.y += this.getLineHeight();
  }

  private animateCursor() {
    if (!this.renderInProgress) {
      this.cursorVisible = !this.cursorVisible;
      this.render();
    }
  }

  private drawCursor() {
    if (!this.cursorVisible) {
      return;
    }
    const pos = Point.from(this.state.cursorPos);
    pos.x += this.state.cursorPaddingLeft;
    pos.y += this.state.cursorPaddingTop;
    this.ctx.fillStyle = this.state.fontColor;
    const cursorWidth = 2;
    const cursorHeight = 18;
    this.ctx.fillRect(
      pos.x,
      pos.y,
      cursorWidth,
      cursorHeight);
  }

  private drawText(textLine: string) {
    const maxWidth = this.getMaxCharactersPerRow();
    let textToDraw = textLine;
    while (textToDraw.length > 0) {
      const rowTextLength = Math.min(maxWidth, textToDraw.length);
      const rowText = textToDraw.substring(0, rowTextLength);
      this.ctx.fillText(
        rowText,
        this.state.currLinePos.x,
        this.state.currLinePos.y);
      const textMetrics = this.ctx.measureText(textToDraw);
      this.state.currLinePos.x += textMetrics.width;
      textToDraw = textToDraw.substring(rowTextLength);
      if (textToDraw.length > 0) {
        this.moveToNewline();
      }
    }
  }

  private drawNewPromptRow() {
    this.setFontStyle();
    this.ctx.fillText(
      this.state.prompt,
      this.state.currLinePos.x,
      this.state.currLinePos.y);
    const textMetrics = this.ctx.measureText(this.state.prompt);
    this.state.currLinePos.x += textMetrics.width;
    this.state.textLines.push(this.state.prompt);
    this.state.setCurrTextLineCmd('');
    this.state.setCursorIndex(0);
  }

  private setFontStyle() {
    this.ctx.font = this.state.fontLoaded ? this.state.getFont() : this.state.getDefaultFont();
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = this.state.fontColor;
  }
}

export { Terminal };
