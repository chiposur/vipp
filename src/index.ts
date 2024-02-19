import { Terminal } from './terminal';

const canvas = document.getElementById("terminal") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
if (ctx) {
  new Terminal(canvas, ctx);
}