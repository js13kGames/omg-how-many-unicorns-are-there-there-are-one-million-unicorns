import {link, Material} from "../lib/material.js";
import {GL_POINTS} from "../lib/webgl.js";

interface CrowdLayout {
    Pv: WebGLUniformLocation;
    Time: WebGLUniformLocation;
    PointSize: WebGLUniformLocation;
    Prefix: WebGLUniformLocation;
    Blast: WebGLUniformLocation;
}

const vertex = `#version 300 es
precision highp float;
precision highp int;
uniform mat3x2 pv;
uniform float time;
uniform float point_size;
uniform sampler2D prefix_texture;
uniform vec3 blast;
out vec3 color;

float hash(uint value) {
    value ^= value >> 16;
    value *= 0x7feb352du;
    value ^= value >> 15;
    value *= 0x846ca68bu;
    value ^= value >> 16;
    return float(value) / 4294967295.0;
}

float prefix(int cell) {
    return texelFetch(prefix_texture, ivec2(cell % 64, cell / 64), 0).r;
}

void main() {
    float id = float(gl_VertexID);
    int low = 0;
    int high = 2303;
    for (int step = 0; step < 12; step++) {
        int middle = (low + high) / 2;
        if (prefix(middle) > id) high = middle;
        else low = middle + 1;
    }
    int cell = low;
    float first = cell == 0 ? 0.0 : prefix(cell - 1);
    uint local_id = uint(id - first);
    float x = float(cell % 64) - 31.5 + hash(local_id * 3u + uint(cell) * 101u) * 0.94;
    float y = float(cell / 64) - 17.5 + hash(local_id * 7u + uint(cell) * 53u) * 0.94;
    x += sin(float(local_id % 997u) * 0.31 + time * 1.4) * 0.05;
    y += cos(float(local_id % 991u) * 0.29 + time * 1.2) * 0.05;
    vec3 clip = mat3(pv) * vec3(x, y, 1.0);
    gl_Position = vec4(clip.xy, y / 100.0, 1.0);
    gl_PointSize = point_size;
    float light = blast.z * exp(-distance(vec2(x, y), blast.xy) * 0.55);
    color = vec3(1.0, 0.72 + hash(local_id + uint(cell)) * 0.22, 0.9) + vec3(1.0, 0.48, 0.08) * light;
}`;

const fragment = `#version 300 es
precision mediump float;
in vec3 color;
out vec4 frag_color;
void main() {
    vec2 point = gl_PointCoord * 2.0 - 1.0;
    if (dot(point, point) > 1.0) discard;
    frag_color = vec4(color, 1.0);
}`;

export function mat_crowd(gl: WebGL2RenderingContext): Material<CrowdLayout> {
    const program = link(gl, vertex, fragment);
    return {
        Mode: GL_POINTS,
        Program: program,
        Locations: {
            Pv: gl.getUniformLocation(program, "pv")!,
            Time: gl.getUniformLocation(program, "time")!,
            PointSize: gl.getUniformLocation(program, "point_size")!,
            Prefix: gl.getUniformLocation(program, "prefix_texture")!,
            Blast: gl.getUniformLocation(program, "blast")!,
        },
    };
}
