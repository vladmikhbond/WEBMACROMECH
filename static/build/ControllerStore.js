import { glo, doc } from "./globals.js";
import { Mode } from "./Box.js";
import { Ball } from "./Ball.js";
import { Line } from "./Line.js";
import { Link } from "./Link.js";
import { Problem } from "./Problem.js";
// Відповідає за збереження сцен і за задачі
//
export class ControllerStore {
    constructor(box, controller) {
        this.problems = [];
        this.box = box;
        this.controller = controller;
        this.addEventListeners();
        this.loadProblems('opened');
    }
    async loadProblems(prefix) {
        try {
            const response = await fetch(`/${prefix}_probs`);
            if (!response.ok) {
                throw new Error(`Помилка завантаження файлу: ${response.statusText}`);
            }
            const text = await response.text();
            const regex = /TITLE:((.|\r|\n)*?)COND:((.|\r|\n)*?)INIT:((.|\r|\n)*?)ANSWER:((.|\r|\n)*?)---/gm;
            const matches = [...text.matchAll(regex)];
            this.problems = matches.map(m => new Problem(m));
            // UI
            const options = this.problems.map((p, i) => new Option(p.title, i.toString()));
            doc.sceneSelect.innerHTML = '';
            doc.sceneSelect.append(...options);
            doc.sceneSelect.selectedIndex = 0;
            doc.sceneSelect.dispatchEvent(new Event('change'));
        }
        catch (error) {
            console.error('Помилка:', error.message);
        }
    }
    addEventListeners() {
        // Перехід на сторінку управління задачами - /admin
        //
        doc.adminButton.addEventListener("click", (e) => {
            if (e.altKey) {
                const scene = ControllerStore.sceneToJson(this.box);
                const encodedParam = encodeURIComponent(scene);
                window.location.href = '/add_prob/' + encodedParam;
                return;
            }
            if (e.ctrlKey) {
                window.open('/admin'); // Open in the same window
            }
            else {
                window.location.href = '/admin'; // Open in a new window
            }
        });
        doc.saveSceneButton.addEventListener("click", () => {
            let jsonStr = ControllerStore.sceneToJson(this.box);
            const count = (jsonStr.match(/\n/g) || []).length;
            doc.savedSceneArea.value = jsonStr;
            doc.savedSceneArea.rows = Math.min(count, 10);
        });
        doc.loadSceneButton.addEventListener("click", () => {
            ControllerStore.restoreSceneFromJson(doc.savedSceneArea.value, this.box);
            // view 
            this.controller.resetUI();
            this.controller.mode = Mode.Stop;
        });
        // Завантажує сцену обраної користувачем задачі
        //
        const loadSceneOfSelectedProblem = () => {
            // 
            let idx = +doc.sceneSelect.value;
            if (idx == 0) {
                this.controller.clearScene();
                doc.problemBoard.style.display = 'none';
                doc.rangesDiv.style.display = 'block';
                return;
            }
            let problem = this.problems[idx];
            ControllerStore.restoreSceneFromJson(problem.init, this.box);
            // UI & view 
            this.controller.resetUI();
            doc.condDiv.innerHTML = problem.cond;
            doc.problemBoard.style.display = 'block';
            doc.problemBoard.style.backgroundColor = 'rgba(241, 241, 10, 0.1)';
            doc.answerText.style.display = problem.isAnswerNumber ? 'inline' : 'none';
            // якщо відповідь задачі пуста або умова починається з зірочки, показує панель слайдерів
            doc.rangesDiv.style.display =
                problem.answer == '' || problem.cond.slice(0, 1) == '*' ? 'block' : 'none';
            doc.ballBoard.style.display = 'none';
            doc.lineBoard.style.display = 'none';
        };
        doc.sceneSelect.addEventListener("change", loadSceneOfSelectedProblem);
        doc.sceneSelect.addEventListener("click", loadSceneOfSelectedProblem);
        doc.answerButton.addEventListener("click", (e) => {
            this.checkAnswer();
        });
    }
    static sceneToJson(box) {
        box.balls.forEach(b => { b.box = null; b.clearDots(); });
        let o = {
            balls: box.balls.map(b => { return { x: b.x, y: b.y, vx: b.vx, vy: b.vy, m: b.m, radius: b.radius, color: b.color, }; }),
            lines: box.lines,
            links: box.links.map(l => [l.b1.x, l.b1.y, l.b2.x, l.b2.y]),
            g: glo.g, W: glo.W, U: glo.U, Vis: glo.Vis, K: glo.K,
        };
        let json = JSON.stringify(o, null, 2); // 2 - кількість пробілів
        box.balls.forEach(b => b.box = box);
        return json;
    }
    static restoreSceneFromJson(json, box) {
        const o = JSON.parse(json);
        // restore balls
        box.balls = o.balls.map((b) => new Ball(b.x, b.y, b.radius, b.color, b.vx, b.vy, b.m));
        box.balls.forEach(b => b.box = box);
        // restore lines
        box.lines = o.lines.map((l) => new Line(l.x1, l.y1, l.x2, l.y2));
        // restore links
        box.links = [];
        o.links.forEach((arr) => {
            let b1 = box.ballUnderPoint({ x: arr[0], y: arr[1] });
            let b2 = box.ballUnderPoint({ x: arr[2], y: arr[3] });
            if (b1 && b2) {
                box.links.push(new Link(b1, b2));
            }
        });
        // restore globals
        glo.g = o.g;
        glo.W = o.W;
        glo.U = o.U;
        glo.Vis = o.Vis;
        glo.K = o.K;
    }
    checkAnswer() {
        const id = +doc.sceneSelect.value;
        const problem = this.problems[id];
        const balls = this.controller.box.balls;
        const answer = problem.answer;
        let testOk = false;
        // 
        if (problem.isAnswerNumber) {
            const MAX_ERROR = 0.03; // 3%               
            let epsilon = Math.abs((+doc.answerText.value - +problem.answer) / +problem.answer);
            testOk = doc.answerText.value == problem.answer || epsilon < MAX_ERROR;
        }
        else {
            const testFunction = new Function('t, b, b1, canvas_height', `
                let x = Math.round(b.x);
                let y = Math.round(canvas_height - b.y);
                let vx = +b.vx.toFixed(2);
                let vy = -b.vy.toFixed(2);
                let m = b.m;
                if (b1) {                
                    let x1 = Math.round(b1.x);                
                    let y1 = Math.round(canvas_height - b1.y);                
                    let vx1 = b1.vx.toFixed(2);                
                    let vy1 = -b1.vy.toFixed(2);                
                    let m1 = b1.m;
                }
                return ${answer}
            `);
            let sceneJson = ControllerStore.sceneToJson(this.controller.box);
            for (let t = 0; t <= 1000; t++) {
                if (testFunction(t, balls[0], balls[1], doc.canvas.height)) {
                    testOk = true;
                    break;
                }
                this.controller.step();
            }
            ControllerStore.restoreSceneFromJson(sceneJson, this.controller.box);
            this.controller.view.drawAll();
        }
        // doc.problemBoard.style.backgroundColor = testOk ?
        //     'rgba(29, 252, 0, 0.256)' : 
        //     'rgba(241, 241, 10, 0.1)';
        doc.canvas.style.backgroundColor = testOk ?
            'rgba(29, 252, 0, 0.256)' :
            '#fff6e9';
    }
}
