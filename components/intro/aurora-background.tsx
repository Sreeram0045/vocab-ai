"use client";

import React, { useRef, useEffect } from "react";
import { useVideoConfig } from "remotion";

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Correct aspect ratio
    st.x *= u_resolution.x / u_resolution.y;

    // Slow movement
    float t = u_time * 0.15;

    // Domain warping for "fluid" feel
    vec2 q = vec2(0.);
    q.x = snoise(st + vec2(t * 0.5, t * 0.2));
    q.y = snoise(st + vec2(0.0));

    vec2 r = vec2(0.);
    r.x = snoise(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
    r.y = snoise(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

    float f = snoise(st + r);

    // Color Palette: Deep Space Black -> Emerald -> Cyan -> White
    // Base dark
    vec3 color = vec3(0.0, 0.02, 0.05);

    // Mix in Emerald Green
    float emerald = smoothstep(0.2, 0.8, f);
    color = mix(color, vec3(0.06, 0.73, 0.5), emerald * 0.4);

    // Mix in Deep Cyan/Blue for depth
    float cyan = smoothstep(0.4, 0.9, f + r.x);
    color = mix(color, vec3(0.0, 0.5, 0.7), cyan * 0.3);

    // Highlights (Silver/White)
    float highlight = smoothstep(0.7, 1.0, f + r.y);
    color = mix(color, vec3(0.9, 1.0, 1.0), highlight * 0.15);

    // Vignette
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float vignette = 1.0 - length(uv - 0.5) * 1.2;
    color *= clamp(vignette, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
`;

interface AuroraBackgroundProps {
  frame: number;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ frame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fps, width, height } = useVideoConfig();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Resize canvas
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);

    // Compile Shaders
    const vertShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertShader, VERTEX_SHADER);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragShader, FRAGMENT_SHADER);
    gl.compileShader(fragShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create Full Screen Quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");

    // Draw Frame
    gl.uniform2f(uResolution, width, height);
    gl.uniform1f(uTime, frame / fps);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

  }, [frame, fps, width, height]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
};
