import type { StyleId } from "./types"

/**
 * One fragment shader per style: a shared prelude, the style's colour
 * function (which returns OKLab), and a finishing pass for the effects.
 * Every effect works in artboard pixels, so a 4K export looks like the
 * preview, only sharper. Anything that moves is driven by u_phase (0–2π), so
 * one turn of the phase is a seamless loop.
 */

export const VERTEX = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`

const PRELUDE = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform vec2 u_res;
uniform vec2 u_offset;
uniform float u_pxScale;
uniform vec3 u_colors[8];
uniform vec2 u_points[8];
uniform int u_count;
uniform vec3 u_bg;
uniform vec2 u_center;
uniform float u_p[6];
uniform float u_phase;
uniform float u_seed;

uniform vec2 u_grain;
uniform float u_vignette;
uniform vec3 u_glass;
uniform float u_pixelate;
uniform vec2 u_dither;
uniform vec4 u_adjust;

out vec4 outColor;

#define PI 3.14159265359
#define TAU 6.28318530718

vec2 aspectP(vec2 uv) {
  return (uv - 0.5) * u_res / min(u_res.x, u_res.y);
}

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p, int octaves) {
  float a = 0.5, s = 0.0;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    s += a * snoise(p);
    p = m * p;
    a *= 0.5;
  }
  return s;
}

// A circle through noise space: walking it once is a seamless loop.
vec2 loopOff(float r, float k) {
  return r * vec2(cos(u_phase * k), sin(u_phase * k));
}

vec2 warped(vec2 p, float amount, float scale) {
  if (amount <= 0.0) return p;
  vec2 o = loopOff(0.35, 1.0);
  vec2 s = vec2(u_seed * 7.13, u_seed * 3.71);
  return p + amount * 0.32 * vec2(
    snoise(p * scale + o + s),
    snoise(p * scale - o + s + 31.7)
  );
}

// Each point wanders a figure-eight that closes after one loop.
vec2 drift(int i) {
  float f = float(i) + u_seed * 10.0;
  return 0.07 * vec2(
    sin(u_phase + f * 2.39),
    sin(2.0 * u_phase + f * 1.71)
  );
}

vec3 ramp(float t) {
  if (u_count < 2) return u_colors[0];
  float f = clamp(t, 0.0, 1.0) * float(u_count - 1);
  int i = min(int(floor(f)), u_count - 2);
  float k = f - float(i);
  k = k * k * (3.0 - 2.0 * k);
  return mix(u_colors[i], u_colors[i + 1], k);
}

vec3 rampLoop(float t) {
  if (u_count < 2) return u_colors[0];
  float f = fract(t) * float(u_count);
  int i = int(floor(f));
  int j = i + 1 >= u_count ? 0 : i + 1;
  float k = f - float(i);
  k = k * k * (3.0 - 2.0 * k);
  return mix(u_colors[i], u_colors[j], k);
}

float tri(float t) { return 1.0 - abs(1.0 - mod(t, 2.0)); }
`

const STYLE_FNS: Record<StyleId, string> = {
  mesh: /* glsl */ `
vec3 styleColor(vec2 uv) {
  vec2 p = warped(aspectP(uv), u_p[1], u_p[2]);
  float r = length(p);
  p = rot(u_p[3] * exp(-r * r * 1.6)) * p;
  vec3 acc = vec3(0.0);
  float sum = 0.0;
  float k = u_p[0] * 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= u_count) break;
    vec2 d = p - (aspectP(u_points[i]) + drift(i));
    float w = 1.0 / pow(dot(d, d) + 0.0004, k);
    acc += w * u_colors[i];
    sum += w;
  }
  return acc / sum;
}`,
  fluid: /* glsl */ `
vec3 styleColor(vec2 uv) {
  vec2 p = aspectP(uv) * u_p[0] + vec2(u_seed * 13.1, u_seed * 7.7);
  // The warp layers stay smooth (two octaves, scaled down) so the nesting
  // folds the colour like marble instead of shattering it into static.
  float w = u_p[1] * 0.38;
  int oct = int(u_p[2] + 0.5);
  vec2 o = loopOff(0.55, 1.0);
  vec2 q = vec2(fbm(p + o, 2), fbm(p + vec2(5.2, 1.3) - o, 2));
  vec2 r = vec2(
    fbm(p + w * q + vec2(1.7, 9.2) + o.yx * 0.6, 2),
    fbm(p + w * q + vec2(8.3, 2.8) - o.yx * 0.6, 2)
  );
  float t = fbm(p + w * r, oct);
  return ramp(0.5 + t * 0.62 * u_p[3]);
}`,
  waves: /* glsl */ `
vec3 styleColor(vec2 uv) {
  vec2 p = rot(u_p[3]) * aspectP(uv);
  float f = u_p[0];
  float a = u_p[1];
  float s = u_seed * 6.0;
  float d = a * 0.22 * (
    sin(p.x * f * 2.6 + u_phase + s) +
    0.55 * sin(p.x * f * 4.7 - 2.0 * u_phase + s * 1.7) +
    0.3 * sin(p.x * f * 1.3 + p.y * 2.0 + u_phase + s * 0.3)
  );
  d += a * 0.08 * snoise(p * 1.7 + loopOff(0.3, 1.0) + s);
  float t = (p.y + d) * u_p[2] * 0.9 + 0.5;
  return ramp(tri(t));
}`,
  orbs: /* glsl */ `
vec3 styleColor(vec2 uv) {
  vec2 p = aspectP(uv);
  vec3 col = u_bg;
  for (int i = 0; i < 8; i++) {
    if (i >= u_count) break;
    float h = hash11(float(i) * 7.31 + u_seed * 93.0);
    float r = u_p[0] * 0.5 * (1.0 - u_p[2] * 0.7 * h);
    float soft = max(u_p[1], 0.002);
    float d = length(p - (aspectP(u_points[i]) + drift(i) * 1.6));
    float a = 1.0 - smoothstep(r * (1.0 - soft), r * (1.0 + soft * 1.4), d);
    col = mix(col, u_colors[i], a);
  }
  return col;
}`,
  linear: /* glsl */ `
vec3 styleColor(vec2 uv) {
  vec2 p = warped(aspectP(uv), u_p[1], u_p[2]);
  vec2 dir = vec2(cos(u_p[0]), sin(u_p[0]));
  vec2 half_ = 0.5 * u_res / min(u_res.x, u_res.y);
  float ext = abs(dir.x) * half_.x + abs(dir.y) * half_.y;
  return ramp(dot(p, dir) / (2.0 * ext) + 0.5);
}`,
  radial: /* glsl */ `
vec3 styleColor(vec2 uv) {
  vec2 p = warped(aspectP(uv), u_p[1], u_p[2]);
  float t = length(p - aspectP(u_center)) / max(u_p[0], 0.01);
  return ramp(t);
}`,
  conic: /* glsl */ `
vec3 styleColor(vec2 uv) {
  vec2 p = warped(aspectP(uv), u_p[1], u_p[2]);
  vec2 d = p - aspectP(u_center);
  float t = atan(d.y, d.x) / TAU + 0.5 + u_p[0] * length(d) * 0.5 + u_phase / TAU;
  return rampLoop(t);
}`,
}

const MAIN = /* glsl */ `
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

vec3 oklabToLinear(vec3 c) {
  float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  float l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 frag = gl_FragCoord.xy + u_offset;
  vec2 art = vec2(frag.x, u_res.y - frag.y) / u_pxScale;
  vec2 artRes = u_res / u_pxScale;
  vec2 uv0 = art / artRes;
  vec2 uv = uv0;

  if (u_pixelate >= 2.0) {
    uv = (floor(art / u_pixelate) + 0.5) * u_pixelate / artRes;
  }

  float shade = 0.0;
  if (u_glass.x > 0.001) {
    float m = min(artRes.x, artRes.y);
    vec2 dir = vec2(cos(u_glass.z), sin(u_glass.z));
    vec2 ap = (uv - 0.5) * artRes / m;
    float f = fract(dot(ap, dir) * u_glass.y) - 0.5;
    ap -= dir * f * u_glass.x * 1.6 / u_glass.y;
    uv = ap * m / artRes + 0.5;
    shade = u_glass.x * (0.06 * cos(f * TAU) - 0.05 * smoothstep(0.38, 0.5, abs(f)));
  }

  vec3 lab = styleColor(uv);

  lab.x += u_adjust.x * 0.2 + shade;
  lab.x = (lab.x - 0.5) * (1.0 + u_adjust.y) + 0.5;
  lab.yz = rot(u_adjust.w) * (lab.yz * u_adjust.z);

  vec3 rgb = max(oklabToLinear(lab), 0.0);

  if (u_vignette > 0.0) {
    vec2 v = (uv0 - 0.5) * 2.0;
    rgb *= 1.0 - u_vignette * smoothstep(0.35, 1.45, length(v));
  }

  vec3 c = toSrgb(rgb);

  if (u_grain.x > 0.0) {
    vec2 g = floor(art / u_grain.y);
    float n = hash12(g + u_seed * 101.0) + hash12(g.yx + 17.0 + u_seed * 53.0) - 1.0;
    c += n * u_grain.x * 0.22;
  }

  if (u_dither.x >= 2.0) {
    float lv = u_dither.x - 1.0;
    float th = bayer8(floor(art / u_dither.y)) - 0.5;
    c = floor(c * lv + 0.5 + th) / lv;
  } else {
    // Triangular noise of one step: kills banding in smooth ramps.
    c += (hash12(frag + 0.37) + hash12(frag.yx + 1.71) - 1.0) / 255.0;
  }

  outColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}
`

export function fragmentFor(style: StyleId) {
  return PRELUDE + STYLE_FNS[style] + MAIN
}
