import {link, Material} from "../lib/material.js";
import {GL_POINTS} from "../lib/webgl.js";

interface CrowdLayout {
    Pv: WebGLUniformLocation;
    Time: WebGLUniformLocation;
    PointSize: WebGLUniformLocation;
}

const vertex = `#version 300 es
precision highp float;
precision highp int;
uniform mat3x2 pv;
uniform float time;
uniform float point_size;
out vec3 color;

float hash(uint value) {
    value ^= value >> 16;
    value *= 0x7feb352du;
    value ^= value >> 15;
    value *= 0x846ca68bu;
    value ^= value >> 16;
    return float(value) / 4294967295.0;
}

void main() {
    uint id = uint(gl_VertexID);
    float phase = hash(id);
    float travel = mod(phase * 62.0 + time * (1.8 + hash(id + 17u) * 0.7), 62.0);
    float x = -31.0 + travel;
    float source_y = hash(id + 101u) * 32.0 - 16.0;
    float funnel = 1.0 - smoothstep(8.0, 27.0, x) * 0.94;
    float y = source_y * funnel + sin(float(id % 997u) * 0.31 + time * 1.4) * 0.18;
    vec3 world = vec3(x, y, 1.0);
    vec3 clip = mat3(pv) * world;
    gl_Position = vec4(clip.xy, y / 100.0, 1.0);
    gl_PointSize = point_size;
    color = vec3(1.0, 0.72 + hash(id + 53u) * 0.22, 0.9);
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
        },
    };
}
