import { Terminal } from './terminal';

const canvas = document.getElementById("terminal") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (ctx) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  new Terminal(canvas, ctx);
}
