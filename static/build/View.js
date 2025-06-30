import { glo, doc } from "./globals.js";
import { Geometry as G } from "./Geometry.js";
export var PrettyMode;
(function (PrettyMode) {
    PrettyMode[PrettyMode["Draft"] = 0] = "Draft";
    PrettyMode[PrettyMode["Beauty"] = 1] = "Beauty";
})(PrettyMode || (PrettyMode = {}));
;
export var TraceMode;
(function (TraceMode) {
    TraceMode[TraceMode["No"] = 0] = "No";
    TraceMode[TraceMode["Yes"] = 1] = "Yes";
})(TraceMode || (TraceMode = {}));
;
export class View {
    constructor(box) {
        this._prettyMode = PrettyMode.Beauty;
        this.traceMode = TraceMode.No;
        this.box = box;
    }
    set prettyMode(mode) {
        this._prettyMode = mode;
        doc.canvas.style.backgroundColor = mode == PrettyMode.Beauty ? '#fff6e9' : 'white';
    }
    get prettyMode() {
        return this._prettyMode;
    }
    clearTrace() {
        const ctx2 = doc.canvas2.getContext("2d");
        ctx2.clearRect(0, 0, doc.canvas2.width, doc.canvas2.height);
    }
    drawAll(lineWidth = 0.5) {
        if (this.prettyMode)
            return this.drawPretty();
        const ctx = doc.canvas.getContext("2d");
        ctx.clearRect(0, 0, doc.canvas.width, doc.canvas.height);
        ctx.lineWidth = lineWidth;
        // draw box
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        // draw balls
        for (let b of this.box.balls) {
            ctx.lineWidth = this.box.selected === b ? 3 * lineWidth : lineWidth;
            ctx.strokeStyle = b.color;
            ctx.beginPath();
            let x = this.box.x + b.x, y = this.box.y + b.y;
            if (glo.showBallDeform && b.dots && b.dots.length > 0) {
                // show the deformation of the ball
                // let dot = b.dots[0];                                // it is a deformation 
                // let alpha = Math.atan2(dot.y - b.y, dot.x - b.x);   //
                // let kr = (G.distance(dot, b) / b.radius);           //
                ctx.save();
                ctx.translate(x, y);
                // ctx.rotate(alpha);                                  //
                // ctx.scale(kr, 1/kr);                                //
                // ctx.rotate(-alpha);                                 //
                ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
                ctx.restore();
            }
            else {
                ctx.arc(x, y, b.radius, 0, Math.PI * 2);
            }
            // draw velocity
            ctx.strokeRect(x + b.vx * glo.Kvelo - 0.5, y + b.vy * glo.Kvelo - 0.5, 1, 1);
            ctx.moveTo(x, y);
            ctx.lineTo(x + b.vx * glo.Kvelo, y + b.vy * glo.Kvelo);
            ctx.stroke();
            // draw trace
            if (this.traceMode === TraceMode.Yes) {
                const ctx2 = doc.canvas2.getContext("2d");
                ctx2.fillStyle = "gray";
                ctx2.fillRect(x - 0.5, y - 0.5, 1, 1);
            }
        }
        // draw dots of balls
        for (let b of this.box.balls) {
            if (!b.dots)
                continue;
            for (let d of b.dots) {
                //if (!d) continue;
                ctx.strokeStyle = 'black';
                let x = this.box.x + d.x, y = this.box.y + d.y;
                ctx.strokeRect(x - 0.5, y - 0.5, 1, 1);
            }
        }
        // draw lines
        ctx.strokeStyle = "blue";
        for (let l of this.box.lines) {
            ctx.lineWidth = this.box.selected === l ? 3 * lineWidth : lineWidth;
            ctx.beginPath();
            ctx.moveTo(this.box.x + l.x1, this.box.y + l.y1);
            ctx.lineTo(this.box.x + l.x2, this.box.y + l.y2);
            ctx.stroke();
        }
        // draw links
        for (let l of this.box.links) {
            ctx.lineWidth = this.box.selected === l ? 3 * lineWidth : lineWidth;
            ctx.strokeStyle = l.transparent ? "lightgray" : "gray";
            ctx.beginPath();
            ctx.moveTo(this.box.x + l.x1, this.box.y + l.y1);
            ctx.lineTo(this.box.x + l.x2, this.box.y + l.y2);
            ctx.stroke();
        }
    }
    drawPretty() {
        const ctx = doc.canvas.getContext("2d");
        ctx.clearRect(0, 0, doc.canvas.width, doc.canvas.height);
        // draw box
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        // draw links
        ctx.lineWidth = 4;
        ctx.lineCap = "square"; //  "butt" | "round" | "square";
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        for (let link of this.box.links) {
            if (link.transparent)
                continue;
            ctx.moveTo(this.box.x + link.x1, this.box.y + link.y1);
            ctx.lineTo(this.box.x + link.x2, this.box.y + link.y2);
        }
        ctx.stroke();
        // draw balls
        for (let b of this.box.balls) {
            ctx.save();
            let img = b.color === "red" ? doc.redBallImg :
                b.color === "blue" ? doc.blueBallImg :
                    b.color === "gold" ? doc.goldBallImg :
                        doc.greenBallImg;
            let x = this.box.x + b.x, y = this.box.y + b.y;
            if (glo.showBallDeform && b.dots && b.dots.length > 0) {
                let dot = b.dots[0];
                // show the deformation of the ball
                let alpha = Math.atan2(dot.y - b.y, dot.x - b.x);
                let kr = G.distance(dot, b) / b.radius;
                // зменшення деформації в 5 разів
                kr = 1 - (1 - kr) / 5;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(alpha);
                ctx.scale(kr, 1 / kr);
                ctx.rotate(-alpha);
                ctx.translate(-b.radius, -b.radius);
                let k = 2 * b.radius / img.width;
                ctx.scale(k, k);
            }
            else {
                ctx.translate(x - b.radius, y - b.radius);
                let k = 2 * b.radius / img.height;
                ctx.scale(k, k);
            }
            ctx.drawImage(img, 0, 0);
            ctx.restore();
            // draw trace
            if (this.traceMode === TraceMode.Yes) {
                const ctx2 = doc.canvas2.getContext("2d");
                ctx2.fillStyle = "gray";
                ctx2.fillRect(x - 0.5, y - 0.5, 1, 1);
            }
        }
        // draw lines
        ctx.lineWidth = 4;
        ctx.lineCap = "round"; //  "butt" | "round" | "square";
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        for (let line of this.box.lines) {
            ctx.moveTo(this.box.x + line.x1, this.box.y + line.y1);
            ctx.lineTo(this.box.x + line.x2, this.box.y + line.y2);
        }
        ctx.stroke();
    }
    // -------------------- gray things -------------------
    drawGrayLine(p0, p) {
        const ctx = doc.canvas.getContext("2d");
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(this.box.x + p0.x, this.box.y + p0.y);
        ctx.lineTo(this.box.x + p.x, this.box.y + p.y);
        ctx.stroke();
    }
    drawGrayCircle(p0, p) {
        const ctx = doc.canvas.getContext("2d");
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        let x = this.box.x + p0.x, y = this.box.y + p0.y;
        let r = Math.round(G.distance(p0, p));
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        // print sum energy
        ctx.fillText("R = " + r, this.box.x + p.x, this.box.y + p.y);
    }
    // -----------------------------------------------------
    showTimeAndEnergy() {
        //let seconds = (glo.chronos/ 1000 * glo.INTERVAL).toFixed(0);
        let [ek, eg, ed] = this.box.energy;
        doc.infoSpan.innerHTML = `T=${glo.chronos} &nbsp;&nbsp; E=${(ek + eg + ed).toFixed()}`;
    }
}
