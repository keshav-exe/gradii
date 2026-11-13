import { uniformsFor } from "@/lib/engine/renderer"
import { fragmentFor, VERTEX } from "@/lib/engine/shader"
import { PERIOD } from "@/lib/engine/clock"
import type { Doc } from "@/lib/engine/types"

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`

/**
 * CSS can't run the shader, so this is a close cousin: radial layers for
 * the point styles, native gradients in OKLab for the rest.
 */
export function toCSS(doc: Doc) {
  const c = doc.colors.map((x) => x.hex)
  const p = doc.params[doc.style]
  const list = c.join(", ")
  let bg: string
  switch (doc.style) {
    case "linear":
      bg = `background: linear-gradient(${Math.round((p.angle ?? 0) + 90)}deg in oklab, ${list});`
      break
    case "radial":
      bg = `background: radial-gradient(circle at ${pct(doc.center.x)} ${pct(doc.center.y)} in oklab, ${list});`
      break
    case "conic":
      bg = `background: conic-gradient(from 90deg at ${pct(doc.center.x)} ${pct(doc.center.y)} in oklab, ${list}, ${c[0]});`
      break
    case "waves":
      bg = `background: linear-gradient(${Math.round(180 + (p.angle ?? 0))}deg in oklab, ${list});`
      break
    default: {
      const base = doc.style === "orbs" ? doc.background : c[0]
      const layers = doc.colors
        .map(
          (s) =>
            `    radial-gradient(at ${pct(s.x)} ${pct(s.y)}, ${s.hex} 0px, transparent ${doc.style === "orbs" ? 40 : 55}%)`
        )
        .join(",\n")
      bg = `background-color: ${base};\n  background-image:\n${layers};`
    }
  }
  return `.gradient {\n  ${bg}\n}`
}

/** A self-contained, animated <canvas> running the real shader. */
export function toEmbed(doc: Doc, phase: number) {
  const u = uniformsFor(doc)
  const period = doc.speed > 0 ? PERIOD / doc.speed : 0
  const runtime = `(()=>{const U=${JSON.stringify(u)},P=${period},Z=${phase.toFixed(4)};
const c=document.currentScript.previousElementSibling,g=c.getContext("webgl2");if(!g)return;
const sh=(t,s)=>{const x=g.createShader(t);g.shaderSource(x,s);g.compileShader(x);return x};
const p=g.createProgram();g.attachShader(p,sh(g.VERTEX_SHADER,${JSON.stringify(VERTEX)}));
g.attachShader(p,sh(g.FRAGMENT_SHADER,${JSON.stringify(fragmentFor(doc.style))}));g.linkProgram(p);g.useProgram(p);
const S={},T={[g.FLOAT]:"uniform1fv",[g.FLOAT_VEC2]:"uniform2fv",[g.FLOAT_VEC3]:"uniform3fv",[g.FLOAT_VEC4]:"uniform4fv"};
for(let i=0,n=g.getProgramParameter(p,g.ACTIVE_UNIFORMS);i<n;i++){const a=g.getActiveUniform(p,i),l=g.getUniformLocation(p,a.name);
S[a.name.replace(/\\[0\\]$/,"")]=v=>{v=[].concat(v);a.type===g.INT?g.uniform1i(l,v[0]):g[T[a.type]](l,v)}}
for(const k in U)S[k]&&S[k](U[k]);
const still=matchMedia("(prefers-reduced-motion: reduce)").matches||!P;
const f=t=>{const d=Math.min(devicePixelRatio,2),w=Math.round(c.clientWidth*d),h=Math.round(c.clientHeight*d);
if(c.width!==w||c.height!==h){c.width=w;c.height=h}g.viewport(0,0,w,h);S.u_res([w,h]);S.u_offset([0,0]);S.u_pxScale(d);
S.u_phase(still?Z:(Z+t/1e3/P*6.2831853)%6.2831853);g.drawArrays(g.TRIANGLES,0,3);if(!still)requestAnimationFrame(f)};
requestAnimationFrame(f);if(still)addEventListener("resize",()=>requestAnimationFrame(f))})()`
  return `<!-- ${doc.name || "Gradient"}, made with Gradii (gradii.kshv.me) -->
<canvas style="position:absolute;inset:0;width:100%;height:100%;display:block"></canvas>
<script>${runtime}</script>`
}

export function toHTMLPage(doc: Doc, phase: number) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${doc.name || "Gradient"} · Gradii</title>
<style>html,body{margin:0;height:100%;background:${doc.colors[0]?.hex ?? "#000"}}main{position:relative;height:100%}</style>
</head>
<body>
<main>
${toEmbed(doc, phase)}
</main>
</body>
</html>
`
}
