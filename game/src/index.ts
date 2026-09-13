import {Crowd, CROWD_LIMIT, ESCAPE_LIMIT, KILL_TARGET} from "./crowd.js";
import {blocked, MAP_HEIGHT, MAP_WIDTH} from "./navigation.js";
import {
    missile_cooldown,
    new_progress,
    parse_progress,
    purchase,
    run_reward,
    tower_interval,
    UPGRADE_KINDS,
    upgrade_cost,
} from "./progress.js";

const stage = document.querySelector<HTMLElement>("#stage")!;
const bg = document.querySelector<HTMLCanvasElement>("#bg")!;
const canvas = document.querySelector<HTMLCanvasElement>("#gl")!;
const fx = document.querySelector<HTMLCanvasElement>("#fx")!;
const gl = canvas.getContext("webgl2")!;
const back = bg.getContext("2d")!;
const front = fx.getContext("2d")!;
if (!gl) throw new Error("WebGL2 required");

const vertex = `#version 300 es
precision highp float;precision highp int;
uniform sampler2D p;uniform vec2 s,o;uniform float z,q;uniform vec3 b;out vec3 c;
float h(uint x){x^=x>>16;x*=0x7feb352du;x^=x>>15;x*=0x846ca68bu;x^=x>>16;return float(x)/4294967295.;}
float P(int i){return texelFetch(p,ivec2(i%64,i/64),0).r;}
void main(){float id=float(gl_VertexID);int l=0,r=2303;for(int i=0;i<12;i++){int m=(l+r)/2;if(P(m)>id)r=m;else l=m+1;}int a=l;float f=a==0?0.:P(a-1);uint n=uint(id-f);float x=float(a%64)+h(n*3u+uint(a)*101u)*.94,y=float(a/64)+h(n*7u+uint(a)*53u)*.94;x+=sin(float(n%997u)*.31+z*1.4)*.05;y+=cos(float(n%991u)*.29+z*1.2)*.05;gl_Position=vec4(vec2(x,y)*s+o,0,1);gl_PointSize=q;float k=b.z*exp(-distance(vec2(x,y),b.xy)*.55);c=vec3(1,.72+h(n+uint(a))*.22,.9)+vec3(1,.48,.08)*k;}`;
const fragment = `#version 300 es
precision mediump float;in vec3 c;out vec4 x;void main(){vec2 p=gl_PointCoord*2.-1.;if(dot(p,p)>1.)discard;x=vec4(c,1);}`;
function shader(type: number, source: string) {
    const value = gl.createShader(type)!;
    gl.shaderSource(value, source);
    gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(value)!);
    return value;
}
const program = gl.createProgram()!;
gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program)!);
const locations = ["p", "s", "o", "z", "q", "b"].map((name) =>
    gl.getUniformLocation(program, name),
);
const texture = gl.createTexture()!;
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, 64, 36, 0, gl.RED, gl.FLOAT, null);

const crowd = new Crowd();
let progress = new_progress();
try {
    progress = parse_progress(
        localStorage.getItem("unicorn-flood-v2") || localStorage.getItem("unicorn-flood-v1"),
    );
} catch {}
let stars = 360;
let speed = 1;
let building = false;
let rewarded = false;
let missile = 0;
let missileDelay = 40;
let earned = 0;
let blast: [number, number, number] = [0, 0, 0];
let scale = 1;
let ox = 0;
let oy = 0;
let hover = [-1, -1];
const start = document.querySelector<HTMLButtonElement>("#start")!;
const build = document.querySelector<HTMLButtonElement>("#build")!;
const speedButton = document.querySelector<HTMLButtonElement>("#speed")!;
const result = document.querySelector<HTMLElement>("#result")!;
const intro = document.querySelector<HTMLElement>("#intro")!;

function apply() {
    crowd.TowerDamage = 250 * 1.5 ** progress.damage;
    crowd.TowerInterval = tower_interval(progress.rate);
    crowd.TowerRange = 12 + progress.range * 1.5;
    crowd.MissileDamage = 20_000;
    missileDelay = missile_cooldown(progress.missile);
    stars = 360 + progress.economy * 60;
}
function save() {
    try {
        localStorage.setItem("unicorn-flood-v2", JSON.stringify(progress));
    } catch {}
}
function resize() {
    const ratio = devicePixelRatio || 1;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    for (const item of [bg, canvas, fx]) {
        item.width = width * ratio;
        item.height = height * ratio;
        item.style.width = `${width}px`;
        item.style.height = `${height}px`;
    }
    back.setTransform(ratio, 0, 0, ratio, 0, 0);
    front.setTransform(ratio, 0, 0, ratio, 0, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    scale = Math.min(width / MAP_WIDTH, height / MAP_HEIGHT);
    ox = (width - MAP_WIDTH * scale) / 2;
    oy = (height - MAP_HEIGHT * scale) / 2;
    drawMap();
}
function drawMap() {
    back.fillStyle = "#34443b";
    back.fillRect(ox, oy, MAP_WIDTH * scale, MAP_HEIGHT * scale);
    back.fillStyle = "#59666b";
    for (let y = 0; y < MAP_HEIGHT; y++)
        for (let x = 0; x < MAP_WIDTH; x++)
            if (blocked(x, y))
                back.fillRect(ox + x * scale + 1, oy + y * scale + 1, scale - 2, scale - 2);
    back.fillStyle = "#222d31";
    back.fillRect(ox + 57 * scale, oy + 15 * scale, 5 * scale, 7 * scale);
}
function point(event: PointerEvent) {
    const rect = fx.getBoundingClientRect();
    return [
        Math.floor((event.clientX - rect.left - ox) / scale),
        Math.floor((event.clientY - rect.top - oy) / scale),
    ];
}
fx.onpointermove = (event) => (hover = point(event));
fx.onpointerdown = (event) => {
    const [x, y] = point(event);
    if (building) {
        if (stars >= 60 && crowd.Build(x, y)) stars -= 60;
    } else if (!crowd.Result && missile <= 0 && crowd.Explode(x + 0.5, y + 0.5)) {
        missile = missileDelay;
        blast = [x + 0.5, y + 0.5, 1];
    }
};
start.onclick = () => {
    intro.hidden = true;
    crowd.Start();
};
build.onclick = () => {
    building = !building;
    build.ariaPressed = String(building);
};
speedButton.onclick = () => {
    speed = speed === 1 ? 2 : 1;
    speedButton.ariaPressed = String(speed === 2);
};
document.querySelector("#retry")!.addEventListener("click", reset);
for (const kind of UPGRADE_KINDS)
    document.querySelector(`#u-${kind}`)!.addEventListener("click", () => {
        if (purchase(progress, kind)) {
            save();
            upgrades();
        }
    });
function upgrades() {
    document.querySelector("#bank")!.textContent = `${progress.stars} RAINBOWS`;
    const names = {
        damage: "DAMAGE +50%",
        rate: "INTERVAL -2%",
        range: "RANGE +1.5",
        missile: "COOLDOWN -10%",
        economy: "START +60",
    };
    for (const kind of UPGRADE_KINDS) {
        const button = document.querySelector<HTMLButtonElement>(`#u-${kind}`)!;
        const cost = upgrade_cost(progress[kind]);
        button.textContent = `${names[kind]} · ${cost}`;
        button.disabled = progress.stars < cost;
    }
}
function end() {
    if (!crowd.Result || rewarded) return;
    rewarded = true;
    const won = crowd.Result > 0;
    const reward = run_reward(crowd.Kills, won);
    progress.stars += reward;
    progress.runs++;
    progress.wins += +won;
    progress.bestKills = Math.max(progress.bestKills, crowd.Kills);
    earned = reward;
    document.body.classList.remove("shake");
    void document.body.offsetWidth;
    document.body.classList.add("shake");
    save();
    document.querySelector("#title")!.textContent = won ? "YOU WIN" : "YOU LOSE";
    document.querySelector("#score")!.textContent =
        `${crowd.Kills.toLocaleString()} KILLED · ${crowd.Arrived.toLocaleString()} ESCAPED · +${reward} RAINBOWS`;
    result.hidden = false;
    upgrades();
}
function reset() {
    crowd.Reset();
    rewarded = false;
    missile = 0;
    blast = [0, 0, 0];
    building = false;
    build.ariaPressed = "false";
    earned = 0;
    document.body.classList.remove("shake");
    result.hidden = true;
    intro.hidden = false;
    apply();
}
function overlay() {
    front.clearRect(0, 0, fx.clientWidth, fx.clientHeight);
    if (building && hover[0] >= 0) {
        const valid =
            blocked(hover[0], hover[1]) &&
            hover[0] < 56 &&
            !crowd.Towers.some(
                (tower) => Math.floor(tower.x) === hover[0] && Math.floor(tower.y) === hover[1],
            );
        front.fillStyle = valid ? "#78d58a88" : "#df736f88";
        front.fillRect(ox + hover[0] * scale, oy + hover[1] * scale, scale, scale);
    }
    for (const tower of crowd.Towers) {
        const x = ox + tower.x * scale,
            y = oy + tower.y * scale;
        front.fillStyle = "#14232d";
        front.beginPath();
        front.arc(x, y, scale * 0.43, 0, Math.PI * 2);
        front.fill();
        front.strokeStyle = "#8ff5ff";
        front.lineWidth = Math.max(2, scale * 0.12);
        front.stroke();
        front.fillStyle = "#dffcff";
        front.fillRect(x - scale * 0.1, y - scale * 0.42, scale * 0.2, scale * 0.45);
    }
    front.lineCap = "round";
    for (const effect of crowd.Effects) {
        front.strokeStyle =
            effect.kind === "laser" ? "#74f6ff" : effect.kind === "missile" ? "#ff781c" : "#fff47a";
        front.lineWidth = Math.max(2, effect.width * scale);
        front.beginPath();
        front.moveTo(ox + effect.fromX * scale, oy + effect.fromY * scale);
        front.lineTo(ox + effect.x * scale, oy + effect.y * scale);
        front.stroke();
    }
}
function hud() {
    document.querySelector("#escape")!.textContent = String(
        Math.max(0, ESCAPE_LIMIT - crowd.Arrived),
    );
    document.querySelector("#kills")!.textContent =
        `${crowd.Kills.toLocaleString()} / ${KILL_TARGET.toLocaleString()}`;
    document.querySelector("#stars")!.textContent = String(stars);
    document.querySelector("#missile")!.textContent = missile ? `${Math.ceil(missile)}s` : "READY";
    document.querySelector("#earned")!.textContent = String(earned);
    document.querySelector<HTMLElement>("#mf")!.style.width =
        `${((missileDelay - missile) / missileDelay) * 100}%`;
    document.querySelector<HTMLElement>("#ef")!.style.width =
        `${(crowd.Arrived / ESCAPE_LIMIT) * 100}%`;
    document.querySelector<HTMLElement>("#kf")!.style.width =
        `${(crowd.Kills / KILL_TARGET) * 100}%`;
    start.disabled = crowd.Running || !!crowd.Result;
    build.disabled = (!!crowd.Result || stars < 60) && !building;
    build.ariaPressed = String(building);
    speedButton.ariaPressed = String(speed === 2);
}
let last = performance.now();
function frame(now: number) {
    const delta = Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    crowd.Tick(delta);
    const nextEarned = Math.floor(crowd.Kills / 5_000);
    if (nextEarned > earned) {
        earned = nextEarned;
        document.body.classList.remove("shake");
        void document.body.offsetWidth;
        document.body.classList.add("shake");
        setTimeout(() => document.body.classList.remove("shake"), 180);
    }
    missile = Math.max(0, missile - delta);
    blast[2] = Math.max(0, blast[2] - delta * 2);
    if (crowd.UpdatePrefix()) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 64, 36, gl.RED, gl.FLOAT, crowd.Prefix);
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(locations[0], 0);
    gl.uniform2f(locations[1], (2 * scale) / fx.clientWidth, (-2 * scale) / fx.clientHeight);
    gl.uniform2f(locations[2], (2 * ox) / fx.clientWidth - 1, 1 - (2 * oy) / fx.clientHeight);
    gl.uniform1f(locations[3], crowd.Time);
    gl.uniform1f(locations[4], Math.min(3, scale * 0.18));
    gl.uniform3f(locations[5], blast[0], blast[1], blast[2] * 6);
    gl.drawArrays(gl.POINTS, 0, crowd.Count);
    overlay();
    hud();
    end();
    requestAnimationFrame(frame);
}
apply();
resize();
window.onresize = resize;
requestAnimationFrame(frame);
