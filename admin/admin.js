/* HatheemOS 98 · Control Panel
   Edits js/content.js and the files it points to, then saves everything to GitHub as one commit.
   Vercel sees the new commit and redeploys the site, usually within a minute. No server and no build step.
   Sections: Projects, Journal, Certificates, Milestones, Competitions, Profile, CV & Contact, Wallpaper & Sound. */
"use strict";
(() => {
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const el=html=>{ const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstElementChild; };
const kb=n=>n<1048576?Math.max(1,Math.round(n/1024))+" KB":(n/1048576).toFixed(1)+" MB";
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/* The GitHub repository that holds this site (the one Vercel deploys from). */
const REPO={owner:"hatheem-r",repo:"portfolio_sep_2026"};
const SITE="../", CONTENT_PATH="js/content.js";
const TOKEN_URL="https://github.com/settings/personal-access-tokens/new";
const PDFJS="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/";
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const coarse=matchMedia("(pointer: coarse)").matches;
const thisYear=()=>String(new Date().getFullYear());
const thisMonth=()=>MONTHS[new Date().getMonth()]+" "+thisYear();
const today=()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

/* <serializer> : the exact format js/content.js is written in (kept identical for clean diffs) */
const HEADER=`/* =====================================================================
   CONTENT: everything the site shows.
   Easiest way to edit: the Control Panel at /admin/ on the live site.
   Editing by hand also works: keep this valid JSON (double quotes,
   no comments, no trailing commas).
   ===================================================================== */
`;
function inline(v){
  if(Array.isArray(v)) return "["+v.map(inline).join(", ")+"]";
  if(v&&typeof v==="object"){ const k=Object.keys(v); return k.length?"{ "+k.map(x=>JSON.stringify(x)+": "+inline(v[x])).join(", ")+" }":"{}"; }
  return JSON.stringify(v);
}
function pretty(v,ind){
  const one=inline(v);
  if(v===null||typeof v!=="object"||(ind>0&&one.length+ind*2<=112)) return one;
  const pad="  ".repeat(ind+1), end="  ".repeat(ind);
  if(Array.isArray(v)) return v.length?"[\n"+v.map(x=>pad+pretty(x,ind+1)).join(",\n")+"\n"+end+"]":"[]";
  const k=Object.keys(v);
  return k.length?"{\n"+k.map(x=>pad+JSON.stringify(x)+": "+pretty(v[x],ind+1)).join(",\n")+"\n"+end+"}":"{}";
}
function serialize(data){ return HEADER+"const CONTENT = "+pretty(data,0)+";\n"; }
function parseContent(text){
  const m=/const\s+CONTENT\s*=\s*/.exec(text);
  if(m){ try{ return {data:JSON.parse(text.slice(m.index+m[0].length,text.lastIndexOf("}")+1)),strict:true}; }catch(e){} }
  return {data:new Function(text+"\n;return CONTENT;")(),strict:false};   // hand-written JS (comments etc.): still readable
}
/* </serializer> */

/* ---------- pixel icons and project covers (copied from the site's app.js) ---------- */
const ICONS={
  pc:["................","..XXXXXXXXXXXX..","..XWWWWWWWWWWX..","..XWBBBBBBBBWX..","..XWBCCBBBBBWX..","..XWBCBBBBBBWX..","..XWBBBBBBBBWX..","..XWBBBBBBBBWX..","..XWWWWWWWWWWX..","..XXXXXXXXXXXX..",".....XWWWWX.....","...XXXXXXXXXX...","..XWWWWWWWWWWX..","..XWGGWWWWWWWX..","..XXXXXXXXXXXX.."],
  folder:["................","................",".XXXXX..........","XyyyyyX.........","XyyyyyyXXXXXXXX.","XyyyyyyyyyyyyyX.","XXXXXXXXXXXXXXXX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XOOOOOOOOOOOOOOX","XXXXXXXXXXXXXXXX"],
  journal:["................","..XXXXXXXXXXX...",".XXWWWWWWWWWX...","..XWBBBBBBWWX...",".XXWWWWWWWWWX...","..XWBBBBBWWWX...",".XXWWWWWWWWWX...","..XWBBBBBBBWX...",".XXWWWWWWWWWX...","..XWBBBBWWWWX...",".XXWWWWWWWWWX...","..XWWWWWWWRRX...",".XXWWWWWWWRRX...","..XXXXXXXXXXX..."],
  medal:["...RRR....RRR...","...RRRR..RRRR...","....RRRRRRRR....",".....RRRRRR.....","......RRRR......",".....XXXXXX.....","....XYYYYYYX....","...XYYyyyyYYX...","...XYyyYYyyYX...","...XYyYYYYyYX...","...XYyyYYyyYX...","...XYYyyyyYYX...","....XYYYYYYX....",".....XXXXXX....."],
  trophy:["................","...XXXXXXXXXX...","XXXXyyyyyyyYXXXX","XY.XyyyyyyyYX.YX","XY.XyyyyyyyYX.YX",".XYXYyyyyyYYXYX.","..XXYYyyyYYYXX..","....XYYYYYYX....",".....XYYYYX.....","......XYYX......","......XYYX......",".....XYYYYX.....","....XXXXXXXX....","....XOOOOOOX....","....XXXXXXXX...."],
  mail:["................","................","................","XXXXXXXXXXXXXXXX","XWXWWWWWWWWWWXWX","XWWXWWWWWWWWXWWX","XWWWXWWWWWWXWWWX","XWWWWXWWWWXWWWWX","XWWWWWXRRXWWWWWX","XWWWWXWRRWXWWWWX","XWWWXWWWWWWXWWWX","XWWXWWWWWWWWXWWX","XXXXXXXXXXXXXXXX"],
  doc:["..XXXXXXXXX.....","..XWWWWWWWXX....","..XWWWWWWWXWX...","..XWBBBBBWXXXX..","..XWWWWWWWWWWX..","..XWBBBBBBBBWX..","..XWWWWWWWWWWX..","..XWBBBBBBBWWX..","..XWWWWWWWWWWX..","..XWBBBBBBBBWX..","..XWWWWWWWWWWX..","..XWBBBBBWWWWX..","..XWWWWWWWWWWX..","..XXXXXXXXXXXX.."],
  card:["................","................","XXXXXXXXXXXXXXXX","XWWWWWWWWWWWWWWX","XWHHHWWWWWWWWWWX","XWSSSWXXXXXXXWWX","XWSESWWWWWWWWWWX","XWTTTWXXXXXWWWWX","XWTTTWWWWWWWWWWX","XWWWWWXXXXXXXWWX","XWWWWWWWWWWWWWWX","XXXXXXXXXXXXXXXX"],
  save:["XXXXXXXXXXXXXX..","XBBXWWWWWWXBBX..","XBBXWWWWWWXBBX..","XBBXWWWWWWXBBX..","XBBXXXXXXXXBBX..","XBBBBBBBBBBBBX..","XBBBBBBBBBBBBX..","XBBXXXXXXXXBBX..","XBBXWWWWWWXBBX..","XBBXWBBBBWXBBX..","XBBXWWWWWWXBBX..","XXXXXXXXXXXXXX.."],
  picture:["................","XXXXXXXXXXXXXXXX","XCCCCCCCCCCCCCCX","XCCCCCCCCCYYCCCX","XCCCCCCCCCYYCCCX","XCCCCCCCCCCCCCCX","XCCCCGCCCCCCCCCX","XCCCGGGCCCCCCCCX","XCCGGGGGCCCGCCCX","XCGGGGGGGCGGGCCX","XGGGGGGGGGGGGGGX","XGGGGGGGGGGGGGGX","XXXXXXXXXXXXXXXX"],
  speaker:["................",".......X........","......XX........",".....XWX........","XXXXXWWX..B.....","XWWWXWWX...B....","XWWWXWWX.B..B...","XWWWXWWX..B.B...","XWWWXWWX.B..B...","XWWWXWWX...B....","XXXXXWWX..B.....",".....XWX........","......XX........",".......X........"],
  cert:["................","XXXXXXXXXXXXXXXX","XyyyyyyyyyyyyyyX","XyXXXXXXXXXXXXyX","XyyyyyyyyyyyyyyX","XyyBBBBBBBBByyyX","XyyyyyyyyyyyyyyX","XyyBBBBByyyRRRyX",
        "XyyyyyyyyyRRrRRX","XyyBBByyyyRrrrRX","XyyyyyyyyyRRrRRX","XXXXXXXXXXXRRRXX","..........RR.RR.","..........R...R."],
  key:["................","................","................","..XXXX..........",".XYYYYX.........","XYYXXYYXXXXXXXX.","XYX..XYYYYYYYYYX","XYX..XYXXXYXYXX.",
       "XYYXXYYX..X.X...",".XYYYYX.........","..XXXX.........."],
  cpl:["................",".XXXXX..........","XyyyyyX.........","XyyyyyyXXXXXXXX.","XXXXXXXXXXXXXXXX","XYYYYYYYYYYYYYYX","XYYXXXXXXXXXXYYX","XYYXCCCCCCCCXYYX",
       "XYYXCBBCCRRCXYYX","XYYXCBBCCRRCXYYX","XYYXCCCCCCCCXYYX","XYYXXXXXXXXXXYYX","XYYYYYYYYYYYYYYX","XOOOOOOOOOOOOOOX","XXXXXXXXXXXXXXXX"],
  up:["................",".XXXXX..........","XyyyyyX.........","XyyyyyyXXXXXXXX.","XXXXXXXXXXXXXXXX","XYYYYYYXYYYYYYYX","XYYYYYXGXYYYYYYX","XYYYYXGGGXYYYYYX",
      "XYYYXGGGGGXYYYYX","XYYYYYXGXYYYYYYX","XYYYYYXGXYYYYYYX","XYYYYYXGXXXXXYYX","XYYYYYXGGGGGGXYX","XYYYYYYXXXXXXYYX","XXXXXXXXXXXXXXXX"],
  new:["..XXXXXXX.......","..XWWWWWXX..Y...","..XWWWWWXWX.Y...","..XWWWWWXXXYYYYY","..XWWWWWWWX.Y...","..XWWWWWWWX.Y...","..XWWWWWWWWWX...","..XWWWWWWWWWX...",
       "..XWWWWWWWWWX...","..XWWWWWWWWWX...","..XWWWWWWWWWX...","..XXXXXXXXXXX..."],
  del:["................","................","..RR........RR..","..RRR......RRR..","...RRR....RRR...","....RRR..RRR....",".....RRRRRR.....","......RRRR......",
       "......RRRR......",".....RRRRRR.....","....RRR..RRR....","...RRR....RRR...","..RRR......RRR..","..RR........RR.."],
  props:["................","..XXXXXXXXXXX...","..XWWWWWWWWWX...","..XWBBBBBBBWX...","..XWWWWWWWWWX...","..XWBBBBBWWWX...","..XWWWWWWWWWX...","..XWBBBBBBWWX...",
         "..XWWWWWWWWWXXX.","..XWBBBWWWWXYYYX","..XWWWWWWWXYXXYX","..XWWWWWWWXYXXYX","..XXXXXXXXXXYYYX","...........XXX.."],
  clock:[".....XXXXXX.....","...XXWWWWWWXX...","..XWWWWXWWWWWX..",".XWWWWWXWWWWWWX.",".XWWWWWXWWWWWWX.","XWWWWWWXWWWWWWWX","XWWWWWWXWWWWWWWX","XWWWWWWXXXXXWWWX",
         "XWWWWWWWWWWWWWWX","XWWWWWWWWWWWWWWX",".XWWWWWWWWWWWWX.",".XWWWWWWWWWWWWX.","..XWWWWWWWWWWX..","...XXWWWWWWXX...",".....XXXXXX....."],
  warn:[".......XX.......","......XYYX......","......XYYX......",".....XYYYYX.....",".....XYXXYX.....","....XYYXXYYX....","....XYYXXYYX....","...XYYYXXYYYX...",
        "...XYYYXXYYYX...","..XYYYYYYYYYYX..","..XYYYYXXYYYYX..",".XYYYYYXXYYYYYX.",".XYYYYYYYYYYYYX.","XXXXXXXXXXXXXXXX"],
  info:[".....XXXXXX.....","...XXBBBBBBXX...","..XBBBBWWBBBBX..",".XBBBBBWWBBBBBX.",".XBBBBBBBBBBBBX.","XBBBBBWWWBBBBBBX","XBBBBBBWWBBBBBBX","XBBBBBBWWBBBBBBX",
        "XBBBBBBWWBBBBBBX","XBBBBBBWWBBBBBBX",".XBBBBWWWWBBBBX.",".XBBBBBBBBBBBBX.","..XBBBBBBBBBBX..","...XXBBBBBBXX...",".....XXXXXX....."],
  err:[".....XXXXXX.....","...XXRRRRRRXX...","..XRRRRRRRRRRX..",".XRRWWRRRRWWRRX.",".XRRRWWRRWWRRRX.","XRRRRRWWWWRRRRRX","XRRRRRRWWRRRRRRX","XRRRRRRWWRRRRRRX",
       "XRRRRRWWWWRRRRRX",".XRRRWWRRWWRRRX.",".XRRWWRRRRWWRRX.","..XRRRRRRRRRRX..","...XXRRRRRRXX...",".....XXXXXX....."]
};
const IPAL={X:"#1a1a1a",W:"#e6e6e6",B:"#2a62c9",C:"#8fd3ff",G:"#33aa44",y:"#ffe79a",Y:"#f2c94c",O:"#8b5a2b",R:"#d23b3b",r:"#ff8a8a",L:"#c7f0d8",D:"#43523d",S:"#c58c5e",T:"#2bb3a3",H:"#1d1d1d",E:"#111"};
const METAL={1:{y:"#fff0a0",Y:"#f2c94c"},2:{y:"#ffffff",Y:"#aab4be"},3:{y:"#f3c08a",Y:"#c27c3e"}};
function icon(name,metal){
  const c=document.createElement("canvas"); c.width=c.height=16; c.setAttribute("aria-hidden","true");
  const g=c.getContext("2d"), pal={...IPAL,...(METAL[metal]||{})};
  (ICONS[name]||ICONS.doc).forEach((r,j)=>[...r].forEach((ch,i)=>{ if(pal[ch]){ g.fillStyle=pal[ch]; g.fillRect(i,j,1,1); } }));
  return c;
}
function hydrate(root){ $$("span[data-icon]",root).forEach(s=>{ const c=icon(s.dataset.icon,s.dataset.metal); if(s.className) c.className=s.className; s.replaceWith(c); }); }
/* --- copied from js/app.js: cover motifs --- */
const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function dither(g,x0,y0,w,h,colors){
  const img=g.getImageData(x0,y0,w,h), d=img.data, c=colors.map(rgb), n=c.length-1;
  for(let y=0;y<h;y++){ const t=y/Math.max(1,h-1)*n, i=Math.min(n-1,Math.floor(t)), f=t-i;
    for(let x=0;x<w;x++){ const col=(f*16>BAYER[y&3][x&3])?c[i+1]:c[i], k=(y*w+x)*4; d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255; } }
  g.putImageData(img,x0,y0);
}
function rng(str){ let h=1779033703; for(const ch of str) h=Math.imul(h^ch.charCodeAt(0),3432918353), h=h<<13|h>>>19;
  return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return ((h^=h>>>16)>>>0)/4294967296; }; }
function thumb(motif,seed,w=64,h=36){
  const c=document.createElement("canvas"); c.width=w; c.height=h; c.className="thumb";
  const g=c.getContext("2d"), r=rng(seed);
  dither(g,0,0,w,h,["#140c33","#2a1450","#46206a"]);
  g.save(); g.scale(w/64,h/36);
  const R=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)))};
  if(motif==="chart"){ R(6,30,54,1,"#8fd3ff"); R(6,5,1,25,"#8fd3ff");
    for(let i=0;i<8;i++){ const hh=4+i*2.6+r()*4; R(9+i*6,30-hh,4,hh,i===7?"#ffd23f":(i%2?"#5dff7a":"#3fcf5f")); } }
  else if(motif==="graph"){ const N=[]; for(let i=0;i<6;i++) N.push([8+r()*48,6+r()*24]);
    g.fillStyle="#f9b45a"; N.forEach((a,i)=>N.slice(i+1).forEach((b,j)=>{ if((i+j)%2) return;
      const s=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1])); for(let t=0;t<=s;t++) g.fillRect(Math.round(a[0]+(b[0]-a[0])*t/s),Math.round(a[1]+(b[1]-a[1])*t/s),1,1); }));
    N.forEach(([x,y],i)=>{ R(x-1,y-1,3,3,i?"#ff6f9a":"#ffd23f"); R(x,y,1,1,"#fff"); }); }
  else if(motif==="browser"){ R(6,5,52,27,"#c3c3c3"); R(6,5,52,3,"#2a62c9"); R(54,6,2,1,"#fff"); R(8,10,48,20,"#fff");
    R(10,12,20,2,"#333"); R(10,16,15,11,"#f9b45a"); R(12,22,11,5,"#e3605f");
    for(let i=0;i<5;i++) R(28,16+i*2,24-r()*8,1,"#999"); R(28,27,10,2,"#2bb3a3"); }
  else if(motif==="film"){ R(0,4,64,28,"#111"); for(let x=2;x<64;x+=5){ R(x,5,3,2,"#ddd"); R(x,29,3,2,"#ddd"); }
    const cols=[["#ff6f9a","#ffd23f"],["#8fd3ff","#fff"],["#f9b45a","#e3605f"]];
    for(let i=0;i<3;i++){ const x0=3+i*20; R(x0,9,18,18,"#2a1450"); g.fillStyle=cols[i][0];
      for(let k=0;k<14;k++) g.fillRect(x0+2+k,9+16-k,2,1); g.fillStyle=cols[i][1]; for(let k=0;k<8;k++) g.fillRect(x0+4+k*2,12+(k%3),1,1); } }
  else if(motif==="terminal"){ R(6,4,52,28,"#0a0a12"); R(6,4,52,3,"#c3c3c3"); R(52,5,2,1,"#d23b3b");
    for(let i=0;i<5;i++) R(9,10+i*3,6+r()*36,1,i%3?"#5dff7a":"#8fd3ff"); R(9,26,2,1,"#5dff7a"); R(12,25,3,2,"#5dff7a"); }
  else if(motif==="neural"){ const L=[[12,3],[26,4],[40,4],[54,2]].map(([x,n])=>Array.from({length:n},(_,k)=>[x,Math.round(18+(k-(n-1)/2)*7)]));
    g.fillStyle="#5a3a9a"; for(let l=0;l<3;l++) for(const a of L[l]) for(const b of L[l+1]){ const s=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));
      for(let t=0;t<=s;t+=2) g.fillRect(Math.round(a[0]+(b[0]-a[0])*t/s),Math.round(a[1]+(b[1]-a[1])*t/s),1,1); }
    L.flat().forEach(([x,y],i)=>{ R(x-1,y-1,3,3,r()>.5?"#ffd23f":"#ff6f9a"); R(x,y,1,1,"#fff"); }); }
  else if(motif==="database"){ for(let k=0;k<3;k++){ const y=7+k*8; R(18,y,22,7,"#2bb3a3"); R(20,y,18,1,"#8fe8dc"); R(18,y+6,22,1,"#145a52"); R(36,y+3,2,1,"#5dff7a"); }
    for(let i=0;i<5;i++) R(46,10+i*4,4+r()*10,2,i%2?"#f9b45a":"#ffd23f"); }
  else if(motif==="city"){ R(48,5,5,5,"#fff3b0"); R(47,6,1,3,"#fff3b0");
    let x=2; while(x<62){ const w=4+Math.floor(r()*6), hh=8+Math.floor(r()*18); R(x,34-hh,w,hh,"#120a24");
      for(let yy=36-hh;yy<32;yy+=3) for(let xx=x+1;xx<x+w-1;xx+=2) if(r()>.55) R(xx,yy,1,1,"#ffd23f"); x+=w+1; } }
  else if(motif==="chat"){ R(6,5,32,12,"#8fd3ff"); R(10,17,3,2,"#8fd3ff"); for(let i=0;i<3;i++) R(9,8+i*3,10+r()*16,1,"#1b1040");
    R(26,19,32,11,"#ff6f9a"); R(51,30,3,2,"#ff6f9a"); for(let i=0;i<2;i++) R(29,22+i*3,10+r()*16,1,"#fff"); }
  else if(motif==="circuit"){ R(26,11,12,12,"#111"); for(let i=0;i<4;i++){ R(28+i*3,9,1,2,"#c3c3c3"); R(28+i*3,23,1,2,"#c3c3c3"); }
    g.fillStyle="#3fcf5f"; for(let i=0;i<7;i++){ let x=r()<.5?24:39, y=12+Math.floor(r()*10), dir=x<30?-1:1, len=6+r()*14;
      for(let t=0;t<len;t++) g.fillRect(x+dir*t,y,1,1); const ex=x+dir*len; const vy=r()<.5?-1:1, vl=2+r()*8; for(let t=0;t<vl;t++) g.fillRect(Math.round(ex),Math.round(y+vy*t),1,1);
      R(ex-1,y+vy*vl-1,3,3,"#ffd23f"); } }
  else if(motif==="globe"){ const cx=32,cy=18,rr=14; g.fillStyle="#8fd3ff";
    for(let a=0;a<360;a+=3){ const t=a*Math.PI/180; g.fillRect(Math.round(cx+Math.cos(t)*rr),Math.round(cy+Math.sin(t)*rr),1,1);
      for(const k of [.35,.75]) g.fillRect(Math.round(cx+Math.cos(t)*rr*k),Math.round(cy+Math.sin(t)*rr),1,1); }
    for(const dy of [-7,0,7]){ const hw=Math.sqrt(rr*rr-dy*dy); R(cx-hw,cy+dy,hw*2,1,"#2bb3a3"); } R(cx+5,cy-6,2,2,"#ff6f9a"); }
  else if(motif==="rocket"){ for(let i=0;i<14;i++) R(r()*64,r()*36,1,1,"#fff7d6");
    R(31,5,2,1,"#e6e6e6"); R(30,6,4,2,"#e6e6e6"); R(29,8,6,15,"#e6e6e6"); R(31,11,2,2,"#2a62c9"); R(26,19,3,5,"#e3605f"); R(35,19,3,5,"#e3605f");
    R(30,23,4,3,"#ffd23f"); R(31,26,2,4,"#ff6f61"); }
  else { const cols=["#8fd3ff","#ff6f9a","#5dff7a"]; let seg=0,next=12+r()*12;
    for(let x=4;x<60;x++){ if(x>next){seg=(seg+1)%3;next=x+6+r()*14;}
      const a=Math.round(2+Math.abs(Math.sin(x*0.5+r()))*7*(0.5+r()*0.5)); R(x,16-a,1,a*2+1,cols[seg]); R(x,31,1,2,cols[seg]); } }
  g.restore();
  g.fillStyle="rgba(0,0,0,.22)"; for(let y=0;y<h;y+=2) g.fillRect(0,y,w,1);
  return c;
}
const COVERS=["chart","graph","browser","wave","film","terminal","neural","database","city","chat","circuit","globe","rocket"];
/* --- end copy --- */
// same rule the site uses: a project without "thumb" gets an unused motif, picked from its id
function coverMap(P){
  const map={}, used=new Set(P.filter(x=>x.thumb).map(x=>x.thumb));
  P.forEach(x=>{ if(x.thumb){ map[x.id]=x.thumb; return; }
    const free=COVERS.filter(c=>!used.has(c)), pool=free.length?free:COVERS, pick=pool[Math.floor(rng(x.id||"new")()*pool.length)];
    map[x.id]=pick; used.add(pick); });
  return map;
}
function coverNode(p,list){
  if(p.cover){ const i=document.createElement("img"); i.src=resolveSrc(p.cover); i.alt=""; return i; }
  const c=thumb(coverMap(list)[p.id]||p.thumb||"chart",p.title||"x",128,72); c.className="cvc"; return c;
}

/* ---------- storage: the token stays on this device only ---------- */
const mem={
  get(k){ try{ return sessionStorage.getItem(k)??localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v,keep){ try{ (keep?localStorage:sessionStorage).setItem(k,v); (keep?sessionStorage:localStorage).removeItem(k); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); sessionStorage.removeItem(k); }catch(e){} }
};

/* ---------- state ---------- */
const S={ gh:null, owner:"", repo:"", branch:"", head:"", treeSha:"", contentSha:"", files:new Map(),
  original:null, draft:null, origText:"", strict:true,
  pending:new Map(),   // path -> {blob,url}: files added in this session, uploaded on publish
  recent:new Map(),    // path -> url: files published in this session (the site may still be redeploying)
  changes:new Map(), removed:[], moved:new Set(), restored:"",
  view:"home", sel:-1, popup:null, watch:0, liveMsg:"", page:null };
const resetChanges=()=>{ S.changes=new Map(); S.removed=[]; S.moved=new Set(); S.restored=""; };
const isDirty=()=>!!S.draft&&serialize(S.draft)!==S.origText;

/* ---------- small helpers ---------- */
const getPath=(o,k)=>k.split(".").reduce((a,x)=>a==null?undefined:a[x],o);
function setPath(o,k,v){ const ks=k.split("."), last=ks.pop(); let t=o;
  for(const x of ks){ if(t[x]==null||typeof t[x]!=="object") t[x]={}; t=t[x]; }
  if(v===undefined) delete t[last]; else t[last]=v; }
const isEmpty=v=>v==null||v===""||(Array.isArray(v)&&!v.length);
// write a value, but don't add empty keys an item never had (keeps commits small)
const put=(o,k,v)=>{ if(isEmpty(v)&&getPath(o,k)===undefined) return; setPath(o,k,v); };
const slug=s=>String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/&/g," and ")
  .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60).replace(/-+$/,"");
function uniquePath(folder,base,ext){ let n=1,p; do{ p=`${folder}/${base}${n>1?"-"+n:""}.${ext}`; n++; }while(S.files.has(p)||S.pending.has(p)); return p; }
const FILE_RE=/\.(png|jpe?g|webp|gif|avif|svg|pdf|mp3|ogg|wav|m4a)$/i;
function localRefs(data){
  const out=new Set();
  (function walk(v){ if(typeof v==="string"){ const p=v.split(/[?#]/)[0]; if(p&&!/^[a-z][a-z0-9+.-]*:|^\/|\s/i.test(p)&&FILE_RE.test(p)) out.add(p); }
    else if(v&&typeof v==="object") Object.values(v).forEach(walk); })(data);
  return out;
}
function resolveSrc(path){
  if(!path) return "";
  if(/^(https?:|data:|blob:)/.test(path)) return path;
  const p=path.split(/[?#]/)[0];
  return S.pending.get(p)?.url||S.recent.get(p)||SITE+path;
}
const fmtDate=d=>new Date(d).toLocaleString([], {day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"});

/* ---------- GitHub ---------- */
class GHError extends Error{ constructor(status,msg){ super(msg); this.status=status; } }
function GitHub(token,owner,repo){
  const base=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  async function call(method,path,body){
    let r;
    try{ r=await fetch(base+path,{method,cache:"no-store",body:body?JSON.stringify(body):undefined,
      headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json",...(body?{"Content-Type":"application/json"}:{})}}); }
    catch(e){ throw new GHError(0,"Couldn't reach GitHub. Check your internet connection and try again."); }
    if(!r.ok){ let m=""; try{ m=(await r.json()).message||""; }catch(e){} throw new GHError(r.status,m); }
    return r.json();
  }
  return { get:p=>call("GET",p), post:(p,b)=>call("POST",p,b), patch:(p,b)=>call("PATCH",p,b) };
}
function explain(e,writing){
  if(e?.conflict) return "Your site changed on GitHub after you opened the Control Panel.";
  if(!(e instanceof GHError)) return e?.message||String(e);
  if(e.status===0) return e.message;
  if(e.status===401) return "GitHub didn't accept this token. It may be mistyped, expired or deleted.";
  if(e.status===403&&/rate limit/i.test(e.message)) return "GitHub's rate limit was hit. Wait a few minutes and try again.";
  if(writing&&(e.status===403||e.status===404)) return "This token can read your repository but not change it. On GitHub, edit the token and set Contents to “Read and write”.";
  if(e.status===403||e.status===404) return `This token can't open ${S.owner}/${S.repo}. Check the repository name, and that the token has access to this repository.`;
  return "GitHub said: "+(e.message||"error "+e.status);
}
const branchPath=()=>S.branch.split("/").map(encodeURIComponent).join("/");
function b64bytes(b64){ const bin=atob(b64.replace(/\s/g,"")), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return u; }
const b64text=b64=>new TextDecoder().decode(b64bytes(b64));
const blobB64=b=>new Promise((res,rej)=>{ const f=new FileReader(); f.onload=()=>res(String(f.result).split(",")[1]||""); f.onerror=()=>rej(f.error); f.readAsDataURL(b); });
const MIME={png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",webp:"image/webp",gif:"image/gif",svg:"image/svg+xml",avif:"image/avif",pdf:"application/pdf",mp3:"audio/mpeg"};

async function readTree(commitSha){
  const c=await S.gh.get(`/git/commits/${commitSha}`);
  const t=await S.gh.get(`/git/trees/${c.tree.sha}?recursive=1`);
  return {treeSha:c.tree.sha, files:new Map(t.tree.filter(e=>e.type==="blob").map(e=>[e.path,e.sha]))};
}
function normalize(data){
  for(const k of Object.keys(LISTS)) if(!Array.isArray(data[k])) data[k]=[];
  return data;
}
async function readContent(files){
  const sha=files.get(CONTENT_PATH);
  if(!sha) throw new Error(`${CONTENT_PATH} isn't in ${S.owner}/${S.repo}. Is this the right repository?`);
  const blob=await S.gh.get(`/git/blobs/${sha}`);
  try{ const p=parseContent(b64text(blob.content)); normalize(p.data); return {...p,sha}; }
  catch(e){ throw new Error(`${CONTENT_PATH} has a typo the Control Panel can't read (${e.message}). Fix it on GitHub, then reload.`); }
}
async function loadContent(){
  const info=await S.gh.get("");
  S.branch=info.default_branch||"main";
  const ref=await S.gh.get(`/git/ref/heads/${branchPath()}`);
  const head=ref.object.sha, {treeSha,files}=await readTree(head);
  const {data,strict,sha}=await readContent(files);
  Object.assign(S,{head,treeSha,files,contentSha:sha,original:data,draft:clone(data),origText:serialize(data),strict});
  for(const f of S.pending.values()) URL.revokeObjectURL(f.url);
  S.pending.clear(); resetChanges();
}

async function publish(uploads,dels,message,step){
  for(let attempt=0;;attempt++){
    step("Checking GitHub for newer changes…",4);
    const ref=await S.gh.get(`/git/ref/heads/${branchPath()}`), parent=ref.object.sha;
    if(parent!==S.head){   // someone pushed meanwhile: fine, unless content.js itself changed
      const t=await readTree(parent);
      if(t.files.get(CONTENT_PATH)!==S.contentSha) throw Object.assign(new Error("conflict"),{conflict:true});
      Object.assign(S,{head:parent,treeSha:t.treeSha,files:t.files});
    }
    const entries=[], total=uploads.length+1;
    for(const [k,[p,f]] of uploads.entries()){
      step(`Uploading ${p}…`,8+72*k/total);
      const b=await S.gh.post("/git/blobs",{content:await blobB64(f.blob),encoding:"base64"});
      entries.push({path:p,mode:"100644",type:"blob",sha:b.sha});
    }
    step("Saving content.js…",8+72*uploads.length/total);
    const text=serialize(S.draft), cb=await S.gh.post("/git/blobs",{content:text,encoding:"utf-8"});
    entries.push({path:CONTENT_PATH,mode:"100644",type:"blob",sha:cb.sha});
    for(const p of dels) if(S.files.has(p)) entries.push({path:p,mode:"100644",type:"blob",sha:null});
    step("Writing the commit…",86);
    const tree=await S.gh.post("/git/trees",{base_tree:S.treeSha,tree:entries});
    const commit=await S.gh.post("/git/commits",{message,tree:tree.sha,parents:[S.head]});
    step("Updating your site…",94);
    try{ await S.gh.patch(`/git/refs/heads/${branchPath()}`,{sha:commit.sha}); }
    catch(e){ if(e instanceof GHError&&e.status===422&&attempt<1) continue; throw e; }   // lost a race: redo once on the new head
    Object.assign(S,{head:commit.sha,treeSha:tree.sha,contentSha:cb.sha});
    for(const e of entries){ if(e.sha) S.files.set(e.path,e.sha); else S.files.delete(e.path); }
    for(const [p,f] of uploads) S.recent.set(p,f.url);
    for(const [p,f] of S.pending) if(!uploads.some(u=>u[0]===p)) URL.revokeObjectURL(f.url);
    S.pending.clear(); S.original=clone(S.draft); S.origText=text; S.strict=true; resetChanges();
    step("Done",100);
    return {sha:commit.sha,text};
  }
}

/* ---------- images: resize, re-encode, PDF page 1 → picture ---------- */
const EXT={"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif"};
const toBlob=(c,type,q)=>new Promise(r=>c.toBlob(r,type,q));
const isPdf=f=>f.type==="application/pdf"||/\.pdf$/i.test(f.name||"");
function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=src; s.onload=res;
  s.onerror=()=>{ s.remove(); rej(new Error("Couldn't load the PDF reader. Check your connection, or upload a PNG or JPG instead.")); }; document.head.append(s); }); }
async function pdfCanvas(file,max){
  if(!window.pdfjsLib){ await loadScript(PDFJS+"pdf.min.js"); window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+"pdf.worker.min.js"; }
  let doc;
  try{ doc=await window.pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise; }
  catch(e){ throw new Error("Couldn't open this PDF. If it's password-protected, take a screenshot instead."); }
  const page=await doc.getPage(1), v1=page.getViewport({scale:1});
  const vp=page.getViewport({scale:Math.min(4,max/Math.max(v1.width,v1.height))});
  const c=document.createElement("canvas"); c.width=Math.round(vp.width); c.height=Math.round(vp.height);
  const g=c.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0,0,c.width,c.height);
  await page.render({canvasContext:g,viewport:vp}).promise; doc.destroy();
  return c;
}
async function prepareImage(file,max,allowPdf){
  let canvas, original=null;
  if(isPdf(file)){ if(!allowPdf) throw new Error("Pick an image here (PNG, JPG or WebP)."); canvas=await pdfCanvas(file,max); }
  else{
    if(!/^image\//.test(file.type)&&!/\.(png|jpe?g|webp|gif|avif|bmp|hei[cf])$/i.test(file.name)) throw new Error("That file isn't an image.");
    const url=URL.createObjectURL(file), img=new Image(); img.src=url;
    try{ await img.decode(); }
    catch(e){ URL.revokeObjectURL(url); throw new Error(/hei[cf]/i.test(file.type+file.name)?"This browser can't read HEIC photos. Save it as JPG or PNG first.":"Couldn't read this image. Try saving it as PNG or JPG."); }
    const w=img.naturalWidth, h=img.naturalHeight, sc=Math.min(1,max/Math.max(w,h)), ext=EXT[file.type];
    if(sc===1&&ext&&file.size<=700*1024) return {blob:file,ext,url,w,h,size:file.size};   // already small: keep it untouched
    canvas=document.createElement("canvas"); canvas.width=Math.round(w*sc); canvas.height=Math.round(h*sc);
    const g=canvas.getContext("2d"); g.fillStyle="#fff"; g.fillRect(0,0,canvas.width,canvas.height);
    g.imageSmoothingQuality="high"; g.drawImage(img,0,0,canvas.width,canvas.height);
    URL.revokeObjectURL(url);
    if(sc===1&&ext) original=file;
  }
  let blob=await toBlob(canvas,"image/webp",.88), ext="webp";
  if(!blob||blob.type!=="image/webp"){ blob=await toBlob(canvas,"image/jpeg",.88); ext="jpg"; }
  if(original&&original.size<=blob.size){ blob=original; ext=EXT[original.type]; }
  return {blob,ext,url:URL.createObjectURL(blob),w:canvas.width,h:canvas.height,size:blob.size};
}
const pickFiles=(accept,multiple)=>new Promise(res=>{ const i=document.createElement("input"); i.type="file"; i.accept=accept; i.multiple=!!multiple;
  i.onchange=()=>res([...i.files]); i.click(); });

/* ===================================================================== FIELD WIDGETS
   Each type: html(f,item,ctx,id) → markup, init(f,root,item,ctx) → {read(x), check?(x), commit?(x), busy?(), paste?(file), dispose?()}
   read() copies the form into x. commit() turns new files into paths (queued for upload). */
const fid=f=>"f_"+f.k.replace(/[^a-z0-9]/gi,"_");
const suggestions=(f,ctx)=>f.suggest===true?[...new Set((ctx.list||[]).map(x=>getPath(x,f.k)).filter(Boolean))].sort():(f.suggest||[]);
const dl=(id,opts)=>opts.length?`<datalist id="${id}_l">${opts.map(o=>`<option value="${esc(o)}">`).join("")}</datalist>`:"";
const W={};
W.text={
  html:(f,it,ctx,id)=>{ const o=suggestions(f,ctx); return `<input class="inp" id="${id}" name="${f.k}" value="${esc(getPath(it,f.k)??"")}" placeholder="${esc(f.ph||"")}"${f.email?' type="email" inputmode="email" autocapitalize="off"':""}${o.length?` list="${id}_l"`:""}>${dl(id,o)}`; },
  init(f,root){ const i=$("input",root); return {
    read:x=>put(x,f.k,i.value.trim()),
    check:x=>{ const v=getPath(x,f.k); if(f.email&&v&&!/^\S+@\S+\.\S+$/.test(v)) return "That doesn't look like an email address."; } }; }
};
W.url={
  html:(f,it,ctx,id)=>`<input class="inp" id="${id}" name="${f.k}" type="url" inputmode="url" autocapitalize="off" spellcheck="false" value="${esc(getPath(it,f.k)??"")}" placeholder="${esc(f.ph||"https://")}">`,
  init(f,root){ const i=$("input",root); return {
    read:x=>{ let v=i.value.trim(); if(v&&!/^[a-z][a-z0-9+.-]*:/i.test(v)) v="https://"+v; put(x,f.k,v); },
    check:x=>{ const v=getPath(x,f.k); if(v&&!/^https?:\/\/[^\s/]+\.[^\s]+/.test(v)) return "That doesn't look like a web address."; } }; }
};
W.year={
  html:(f,it,ctx,id)=>`<input class="inp yr" id="${id}" name="${f.k}" value="${esc(getPath(it,f.k)??"")}" inputmode="numeric" maxlength="4" placeholder="${thisYear()}">`,
  init(f,root){ const i=$("input",root); return { read:x=>put(x,f.k,i.value.trim()), check:x=>{ const v=getPath(x,f.k); if(v&&!/^\d{4}$/.test(v)) return "Use a 4-digit year, like 2026."; } }; }
};
W.date={
  html:(f,it,ctx,id)=>`<input class="inp dt" id="${id}" name="${f.k}" type="date" value="${esc(getPath(it,f.k)??"")}">`,
  init(f,root){ const i=$("input",root); return { read:x=>put(x,f.k,i.value) }; }
};
function parseMonth(v){ if(!v) return ["",""]; const m=/^(?:([A-Za-z]{3})[a-z]*\.?\s+)?(\d{4})$/.exec(String(v).trim());
  if(!m) return null; const mm=m[1]?MONTHS.find(x=>x.toLowerCase()===m[1].toLowerCase())||"":""; return [mm,m[2]]; }
W.month={
  html:(f,it,ctx,id)=>{ const v=getPath(it,f.k)??"", p=parseMonth(v);
    if(!p) return `<input class="inp" id="${id}" name="${f.k}" value="${esc(v)}">`;
    return `<span class="pair"><select class="inp" id="${id}" aria-label="Month"><option value="">month</option>${MONTHS.map(m=>`<option${m===p[0]?" selected":""}>${m}</option>`).join("")}</select>
      <input class="inp yr" value="${esc(p[1])}" inputmode="numeric" maxlength="4" placeholder="year" aria-label="Year"></span>`; },
  init(f,root){ const s=$("select",root), y=$("input.yr",root), t=$("input:not(.yr)",root); return {
    read:x=>put(x,f.k,t?t.value.trim():[s.value,y.value.trim()].filter(Boolean).join(" ")),
    check:()=>{ if(t) return; const v=y.value.trim(); if(v&&!/^\d{4}$/.test(v)) return "Use a 4-digit year, like 2026."; if(s.value&&!v) return "Add the year too."; } }; }
};
W.place={ nolabel:true,
  html:(f,it)=>{ const v=getPath(it,f.k); return `<div class="places" role="radiogroup" aria-label="${esc(f.label)}">${[["","None"],[1,"1st"],[2,"2nd"],[3,"3rd"]].map(([pv,t])=>
    `<label class="rad"><input type="radio" name="${f.k}" value="${pv}"${String(v??"")===String(pv)?" checked":""}>${pv?`<span data-icon="trophy" data-metal="${pv}"></span>`:""}${t}</label>`).join("")}</div>`; },
  init(f,root){ return { read:x=>{ const c=$("input:checked",root)?.value; setPath(x,f.k,c?+c:null); } }; }
};
W.check={ nolabel:true,
  html:(f,it,ctx,id)=>`<label class="chk"><input type="checkbox" id="${id}" name="${f.k}"${getPath(it,f.k)?" checked":""}> ${esc(f.text||"")}</label>`,
  init(f,root){ const i=$("input",root); return { read:x=>{ if(i.checked) setPath(x,f.k,true); else if(getPath(x,f.k)!==undefined) setPath(x,f.k,undefined); } }; }
};
const area=(f,id,v)=>`<textarea class="inp" id="${id}" name="${f.k}" rows="${f.rows||3}" placeholder="${esc(f.ph||"")}">${esc(v)}</textarea>`;
W.textarea={ html:(f,it,ctx,id)=>area(f,id,getPath(it,f.k)??""), init(f,root){ const t=$("textarea",root); return { read:x=>put(x,f.k,t.value.trim()) }; } };
W.paras={ html:(f,it,ctx,id)=>area(f,id,(getPath(it,f.k)||[]).join("\n\n")),
  init(f,root){ const t=$("textarea",root); return { read:x=>put(x,f.k,t.value.split(/\n\s*\n/).map(s=>s.replace(/\s*\n\s*/g," ").trim()).filter(Boolean)) }; } };
W.lines={ html:(f,it,ctx,id)=>area(f,id,(getPath(it,f.k)||[]).join("\n")),
  init(f,root){ const t=$("textarea",root); return { read:x=>put(x,f.k,t.value.split("\n").map(s=>s.trim()).filter(Boolean)) }; } };
W.tags={ html:(f,it,ctx,id)=>`<input class="inp" id="${id}" name="${f.k}" value="${esc((getPath(it,f.k)||[]).join(", "))}" placeholder="${esc(f.ph||"")}">`,
  init(f,root){ const i=$("input",root); return { read:x=>put(x,f.k,i.value.split(",").map(s=>s.trim()).filter(Boolean)) }; } };

W.pairs={
  html:(f,it,ctx,id)=>`<div class="pairs"><div class="prows"></div><button type="button" class="btn out small" data-add>Add row</button>${dl(id,f.suggest||[])}</div>`,
  init(f,root,it,ctx){
    const rows=$(".prows",root), id=fid(f);
    const add=(k="",v="")=>{ rows.append(el(`<div class="prow"><input class="inp" placeholder="Label" aria-label="Label" value="${esc(k)}"${f.suggest?` list="${id}_l"`:""}>
      <input class="inp" placeholder="Value" aria-label="Value" value="${esc(v)}"><button type="button" class="btn out sq" title="Remove row" aria-label="Remove row">✕</button></div>`)); };
    (getPath(it,f.k)||[]).forEach(([k,v])=>add(k,v));
    $("[data-add]",root).onclick=()=>{ add(); $(".prow:last-child input",rows).focus(); ctx.changed?.(); };
    rows.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b){ b.closest(".prow").remove(); ctx.changed?.(); } });
    return { read:x=>put(x,f.k,$$(".prow",rows).map(r=>$$("input",r).map(i=>i.value.trim())).filter(([k,v])=>k&&v)) };
  }
};
W.range={
  html:(f,it,ctx,id)=>{ const v=getPath(it,f.k)??0; return `<div class="rngw"><input type="range" id="${id}" min="${f.min}" max="${f.max}" step="${f.step}" value="${v}">
    <output>${(+v).toFixed(3)}</output><button type="button" class="btn out small" data-play>▶ Test</button></div>`; },
  init(f,root,it,ctx){
    const r=$("input",root), o=$("output",root), b=$("[data-play]",root); let a=null, t=0;
    const stop=()=>{ if(a){ a.pause(); a=null; } clearTimeout(t); b.textContent="▶ Test"; };
    r.addEventListener("input",()=>{ o.textContent=(+r.value).toFixed(3); if(a) a.volume=+r.value; });
    b.onclick=()=>{ if(a) return stop(); const src=getPath(S.draft,"music.src"); if(!src) return;
      a=new Audio(resolveSrc(src)); a.volume=+r.value; a.play().catch(stop); b.textContent="■ Stop"; t=setTimeout(stop,12000); };
    return { read:x=>setPath(x,f.k,+r.value), dispose:stop };
  }
};
W.welcome={
  html:(f,it)=>{ const w=getPath(it,f.k); return `<div class="welw"><label class="chk"><input type="checkbox"${w?" checked":""}> Show a greeting in the bottom-right corner</label>
    <span class="pair"><input class="inp" placeholder="small line" aria-label="Small line" value="${esc(w?.small??"welcome to")}"><input class="inp" placeholder="big line" aria-label="Big line" value="${esc(w?.big??"My Den")}"></span></div>`; },
  init(f,root){ const [c,s,b]=$$("input",root); const sync=()=>{ s.disabled=b.disabled=!c.checked; }; c.addEventListener("change",sync); sync();
    return { read:x=>setPath(x,f.k,c.checked?{small:s.value.trim(),big:b.value.trim()}:null) }; }
};
W.badges={
  html:()=>`<div class="badgew"><div class="brows"></div><button type="button" class="btn out small" data-add>Add badge</button></div>`,
  init(f,root,it,ctx){
    const rows=$(".brows",root);
    const paint=r=>{ const [t,b,bg,fg]=$$("input",r), p=$(".b88",r); p.style.background=bg.value; p.style.color=fg.value; p.innerHTML=`${esc(t.value)}<b>${esc(b.value)}</b>`; };
    const add=(x={top:"made with",big:"LOVE",bg:"#0b1f8a",fg:"#ffffff"})=>{ const r=el(`<div class="brow"><span class="b88"></span>
      <input class="inp" aria-label="Top line" placeholder="top" value="${esc(x.top)}"><input class="inp" aria-label="Big line" placeholder="BIG" value="${esc(x.big)}">
      <input type="color" aria-label="Background" title="Background" value="${esc(x.bg)}"><input type="color" aria-label="Text colour" title="Text colour" value="${esc(x.fg)}">
      <button type="button" class="btn out sq" title="Remove badge" aria-label="Remove badge">✕</button></div>`); rows.append(r); paint(r); };
    (getPath(it,f.k)||[]).forEach(add);
    rows.addEventListener("input",e=>paint(e.target.closest(".brow")));
    rows.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b){ b.closest(".brow").remove(); ctx.changed?.(); } });
    $("[data-add]",root).onclick=()=>{ add(); ctx.changed?.(); };
    return { read:x=>setPath(x,f.k,$$(".brow",rows).map(r=>{ const [t,b,bg,fg]=$$("input",r); return {top:t.value.trim(),big:b.value.trim(),bg:bg.value,fg:fg.value}; })) };
  }
};
W.id={
  html:(f,it,ctx,id)=>ctx.isNew?`<input class="inp" id="${id}" name="${f.k}" placeholder="made from the ${esc(f.from)}" spellcheck="false" autocapitalize="off"><small class="hint">Page address: <code class="idp"></code></small>`
    :`<input class="inp" id="${id}" value="${esc(it.id)}" readonly><small class="hint">Fixed, because links to this page use it (<code>#${esc(f.prefix+it.id)}</code>).</small>`,
  init(f,root,it,ctx){
    if(!ctx.isNew) return { read(){} };
    const i=$("input",root), code=$(".idp",root), taken=new Set((ctx.list||[]).map(x=>x.id));
    let manual=false;
    const uniq=b=>{ let o=b, n=2; while(taken.has(o)) o=`${b}-${n++}`; return o; };
    const show=()=>{ code.textContent="#"+f.prefix+(i.value||"…"); };
    const sync=()=>{ if(!manual) i.value=uniq(slug(ctx.form.elements[f.from]?.value||"")); show(); };
    i.addEventListener("input",()=>{ manual=!!i.value; show(); });
    ctx.form.addEventListener("input",e=>{ if(e.target.name===f.from) sync(); });
    sync();
    return { read:x=>{ x.id=i.value.trim(); },
      check:x=>{ if(!x.id) return "Type a page name: lowercase letters, numbers and dashes.";
        if(!/^[a-z0-9][a-z0-9-]*$/.test(x.id)) return "Use lowercase letters, numbers and dashes only.";
        if(taken.has(x.id)) return "Another item already uses this name."; } };
  }
};
const folderOf=(f,x)=>typeof f.folder==="function"?f.folder(x):f.folder;
W.image={ nolabel:true,
  html:(f)=>`<div class="imgw${f.square?" sq":""}"><div class="drop in" tabindex="0" role="button" aria-label="Choose ${esc(f.label.toLowerCase())}"></div>
    <div class="imgbtns"><button type="button" class="btn out" data-b="browse">Browse…</button><button type="button" class="btn out" data-b="clear">Remove</button></div>
    <p class="finfo" aria-live="polite"></p></div>`,
  init(f,root,it,ctx){
    const st={cur:getPath(it,f.k)||"",file:null,busy:"",err:""};
    const drop=$(".drop",root), info=$(".finfo",root), clear=$("[data-b=clear]",root);
    const target=()=>{ const n=ctx.peek(); return `${folderOf(f,n)}/${slug(f.base(n))||f.fallback||"image"}.${st.file.ext}`; };
    const shown=()=>st.file?st.file.url:resolveSrc(st.cur);
    const paintInfo=()=>{ info.classList.toggle("bad",!!st.err);
      info.innerHTML=st.err?`<span data-icon="err"></span>${esc(st.err)}`
        :st.file?`New file · ${st.file.w}×${st.file.h} · ${kb(st.file.size)}<br>Saved as <code>${esc(target())}</code>`
        :st.cur?`<code>${esc(st.cur)}</code>`:esc(f.empty||"No image yet.");
      hydrate(info); };
    const paint=()=>{ const cur=shown();
      drop.classList.toggle("has",!!cur&&!st.busy);
      drop.innerHTML=st.busy?`<span class="busy">${esc(st.busy)}<span class="prog in marquee"><i></i></span></span>`
        :cur?`<img src="${esc(cur)}" alt="Preview">`:`<span class="ph"><span data-icon="picture" class="big"></span>Drop ${f.pdf?"an image or PDF":"an image"} here<br><u>or click to browse</u></span>`;
      hydrate(drop); clear.disabled=!cur||!!st.busy; paintInfo(); };
    const set=async file=>{
      st.err=""; st.busy=isPdf(file)?"Reading PDF…":"Preparing image…"; paint();
      try{ const r=await prepareImage(file,f.max,f.pdf); if(st.file) URL.revokeObjectURL(st.file.url); st.file=r; }
      catch(e){ st.err=e.message; }
      st.busy=""; paint(); ctx.changed?.();
    };
    const browse=async()=>{ if(st.busy) return; const [file]=await pickFiles(`image/*${f.pdf?",application/pdf,.pdf":""}`); if(file) set(file); };
    drop.addEventListener("click",browse);
    drop.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); browse(); } });
    $("[data-b=browse]",root).addEventListener("click",browse);
    clear.addEventListener("click",()=>{ if(st.file){ URL.revokeObjectURL(st.file.url); st.file=null; } st.cur=""; st.err=""; paint(); ctx.changed?.(); });
    drop.addEventListener("dragover",e=>{ e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave",()=>drop.classList.remove("over"));
    drop.addEventListener("drop",e=>{ e.preventDefault(); e.stopPropagation(); drop.classList.remove("over"); const fl=e.dataTransfer.files[0]; if(fl) set(fl); });
    ctx.form.addEventListener("input",()=>{ if(st.file) paintInfo(); });
    paint();
    return {
      read:x=>put(x,f.k,st.cur),
      commit:x=>{ if(st.file){ const p=uniquePath(folderOf(f,x),slug(f.base(x))||f.fallback||"image",st.file.ext);
          S.pending.set(p,{blob:st.file.blob,url:st.file.url}); st.cur=p; st.file=null; paint(); }
        put(x,f.k,st.cur); },
      busy:()=>!!st.busy, paste:set, dispose:()=>{ if(st.file) URL.revokeObjectURL(st.file.url); } };
  }
};
W.gallery={
  html:()=>`<div class="gal"><div class="grows"></div><div class="gbtns"><button type="button" class="btn out small" data-add>Add pictures…</button><small class="hint">or drop / paste them here. Reorder with ▲ ▼.</small></div></div>`,
  init(f,root,it,ctx){
    const rowsEl=$(".grows",root), rows=(getPath(it,f.k)||[]).map(im=>({cur:im.src||"",caption:im.caption||"",file:null,busy:false,err:""}));
    const paint=()=>{
      rowsEl.innerHTML=rows.map((r,i)=>`<div class="grow" data-r="${i}">
        <button type="button" class="gth in" data-g="pick" title="Replace picture">${r.busy?`<span class="prog in marquee"><i></i></span>`:(r.file||r.cur)?`<img src="${esc(r.file?r.file.url:resolveSrc(r.cur))}" alt="">`:`<span class="noimg">no image</span>`}</button>
        <div class="gmeta"><input class="inp" data-g="cap" placeholder="Caption" aria-label="Caption" value="${esc(r.caption)}">
          <small class="hint">${r.err?`<span class="bad">${esc(r.err)}</span>`:r.file?`new · ${kb(r.file.size)}`:esc(r.cur||"placeholder (no picture)")}</small></div>
        <span class="gctl"><button type="button" class="btn out sq" data-g="up" title="Move up" aria-label="Move up"${i?"":" disabled"}>▲</button><button type="button" class="btn out sq" data-g="down" title="Move down" aria-label="Move down"${i<rows.length-1?"":" disabled"}>▼</button><button type="button" class="btn out sq" data-g="del" title="Remove" aria-label="Remove">✕</button></span></div>`).join("")
        ||`<p class="hint gempty">No pictures yet.</p>`;
    };
    const load=async(r,file)=>{ r.busy=true; r.err=""; paint();
      try{ const p=await prepareImage(file,f.max,false); if(r.file) URL.revokeObjectURL(r.file.url); r.file=p; } catch(e){ r.err=e.message; }
      r.busy=false; paint(); ctx.changed?.(); };
    const addFiles=files=>files.filter(x=>!isPdf(x)).forEach(file=>{ const r={cur:"",caption:"",file:null,busy:true,err:""}; rows.push(r); load(r,file); });
    $("[data-add]",root).onclick=async()=>addFiles(await pickFiles("image/*",true));
    rowsEl.addEventListener("input",e=>{ if(e.target.dataset.g==="cap") rows[+e.target.closest(".grow").dataset.r].caption=e.target.value; });
    rowsEl.addEventListener("click",async e=>{ const b=e.target.closest("[data-g]"); if(!b||b.dataset.g==="cap") return; const i=+b.closest(".grow").dataset.r, a=b.dataset.g;
      if(a==="pick"){ const [file]=await pickFiles("image/*"); if(file) load(rows[i],file); return; }
      if(a==="del"){ const [r]=rows.splice(i,1); if(r.file) URL.revokeObjectURL(r.file.url); }
      if(a==="up"&&i>0) [rows[i-1],rows[i]]=[rows[i],rows[i-1]];
      if(a==="down"&&i<rows.length-1) [rows[i+1],rows[i]]=[rows[i],rows[i+1]];
      paint(); ctx.changed?.(); });
    root.addEventListener("dragover",e=>{ e.preventDefault(); root.classList.add("over"); });
    root.addEventListener("dragleave",e=>{ if(!root.contains(e.relatedTarget)) root.classList.remove("over"); });
    root.addEventListener("drop",e=>{ e.preventDefault(); e.stopPropagation(); root.classList.remove("over"); addFiles([...e.dataTransfer.files]); });
    paint();
    const out=()=>rows.map(r=>({src:r.cur,caption:r.caption.trim()}));
    return {
      read:x=>put(x,f.k,out()),
      commit:x=>{ for(const r of rows) if(r.file){ const p=uniquePath(folderOf(f,x),slug(r.caption)||f.fallback||"image",r.file.ext);
          S.pending.set(p,{blob:r.file.blob,url:r.file.url}); r.cur=p; r.file=null; }
        put(x,f.k,out()); paint(); },
      busy:()=>rows.some(r=>r.busy), paste:file=>addFiles([file]),
      dispose:()=>rows.forEach(r=>r.file&&URL.revokeObjectURL(r.file.url)) };
  }
};
W.cover={ nolabel:true,
  html:()=>`<div class="covw"><div class="covers" role="radiogroup" aria-label="Cover"></div><p class="finfo"></p></div>`,
  init(f,root,it,ctx){
    const st={mode:it.cover?"custom":it.thumb?"motif":"auto", motif:it.thumb||"", cur:it.cover||"", file:null, busy:false, err:""};
    const box=$(".covers",root), info=$(".finfo",root);
    const autoPick=()=>{ const n=ctx.peek(); delete n.thumb; delete n.cover; const list=(ctx.list||[]).filter(x=>x!==ctx.orig).concat([n]); return coverMap(list)[n.id]||"chart"; };
    const tile=(val,label,node,checked)=>{ const l=el(`<label class="cvt"><input type="radio" name="cover_mode" value="${val}"${checked?" checked":""}><span class="cvbox in"></span><small>${esc(label)}</small></label>`);
      $(".cvbox",l).append(node); return l; };
    const paint=()=>{
      box.innerHTML=""; const title=ctx.form.elements.title?.value||it.title||"x";
      box.append(tile("auto","Automatic",thumb(autoPick(),title,64,36),st.mode==="auto"));
      COVERS.forEach(m=>box.append(tile("motif:"+m,m,thumb(m,title,64,36),st.mode==="motif"&&st.motif===m)));
      const own=st.file?.url||resolveSrc(st.cur);
      box.append(tile("custom","My own image",own?Object.assign(document.createElement("img"),{src:own,alt:""}):el(`<span class="up">${st.busy?"…":"Upload…"}</span>`),st.mode==="custom"));
      info.classList.toggle("bad",!!st.err);
      info.textContent=st.err||(st.mode==="custom"?(st.file?`New file · ${kb(st.file.size)}. Click it again to replace.`:st.cur?st.cur+" · click it again to replace.":"Pick “My own image” to upload one (16:9 looks best)."):st.mode==="auto"?"Picked for you from the pool, without repeating other projects.":"");
    };
    const upload=async()=>{ const [file]=await pickFiles("image/*"); if(!file) return; st.busy=true; paint();
      try{ const r=await prepareImage(file,f.max||1280,false); if(st.file) URL.revokeObjectURL(st.file.url); st.file=r; st.mode="custom"; st.err=""; } catch(e){ st.err=e.message; }
      st.busy=false; paint(); ctx.changed?.(); };
    box.addEventListener("click",e=>{ const t=e.target.closest(".cvt"); if(!t) return; const v=$("input",t).value;
      if(v==="custom"){ e.preventDefault(); st.mode="custom"; if(!st.busy) upload(); paint(); return; }
      setTimeout(()=>{ if(v==="auto") st.mode="auto"; else { st.mode="motif"; st.motif=v.slice(6); } paint(); ctx.changed?.(); }); });
    ctx.form.addEventListener("change",e=>{ if(e.target.name==="title") paint(); });
    paint();
    const apply=x=>{ if(st.mode==="auto"){ delete x.thumb; delete x.cover; }
      else if(st.mode==="motif"){ x.thumb=st.motif; delete x.cover; }
      else if(st.cur) x.cover=st.cur; };
    return { read:apply,
      check:()=>{ if(st.mode==="custom"&&!st.cur&&!st.file) return "Upload an image, or pick another cover."; },
      commit:x=>{ if(st.file){ const p=uniquePath(folderOf(f,x),"cover",st.file.ext); S.pending.set(p,{blob:st.file.blob,url:st.file.url}); st.cur=p; st.file=null; } apply(x); },
      busy:()=>st.busy, dispose:()=>{ if(st.file) URL.revokeObjectURL(st.file.url); } };
  }
};
W.pdf={
  html:()=>`<div class="pdfw"><span data-icon="doc" class="big"></span><div class="pinfo"></div><span class="pbtn"><button type="button" class="btn out small" data-up>Upload new PDF…</button><button type="button" class="btn out small" data-rm>Remove</button></span></div>`,
  init(f,root,it,ctx){
    const st={cur:getPath(it,f.k)||"",file:null}, info=$(".pinfo",root);
    const paint=()=>{ const href=st.file?st.file.url:resolveSrc(st.cur);
      info.innerHTML=st.file?`<b>${esc(f.path)}</b> <small class="hint">new · ${kb(st.file.size)}, uploaded when you publish</small><br><a href="${esc(href)}" target="_blank" rel="noopener">Open ↗</a>`
        :st.cur?`<b>${esc(st.cur)}</b><br><a href="${esc(href)}" target="_blank" rel="noopener">Open ↗</a>`:`<span class="hint">No CV attached. The site shows instructions instead.</span>`;
      $("[data-rm]",root).disabled=!st.cur&&!st.file; };
    $("[data-up]",root).onclick=async()=>{ const [file]=await pickFiles("application/pdf,.pdf"); if(!file) return;
      if(!isPdf(file)){ info.innerHTML=`<span class="bad">Pick a PDF file.</span>`; return; }
      if(st.file) URL.revokeObjectURL(st.file.url);
      st.file={blob:file,url:URL.createObjectURL(file),size:file.size};
      const u=ctx.form.elements[f.updated]; if(u){ u.value=thisMonth(); u.dispatchEvent(new Event("input",{bubbles:true})); }
      paint(); ctx.changed?.(); };
    $("[data-rm]",root).onclick=()=>{ if(st.file){ URL.revokeObjectURL(st.file.url); st.file=null; } st.cur=""; paint(); ctx.changed?.(); };
    paint();
    return { read:x=>setPath(x,f.k,st.file?f.path:st.cur),
      commit:x=>{ if(st.file){ S.pending.set(f.path,{blob:st.file.blob,url:st.file.url}); st.cur=f.path; st.file=null; paint(); } setPath(x,f.k,st.cur); },
      dispose:()=>{ if(st.file) URL.revokeObjectURL(st.file.url); } };
  }
};

/* builds a form from field specs. mode: "tabs" (dialogs), "groups" (full-page sheets) or "plain" */
function buildForm(fields,item,ctx,mode){
  const form=el(`<form class="fform m-${mode}" novalidate autocomplete="off"></form>`);
  let insts=[];
  ctx.form=form; ctx.peek=()=>{ const n=clone(item); insts.forEach(([,i])=>i.read(n)); return n; };
  const row=f=>{ const w=W[f.t], id=fid(f);
    const lab=w.nolabel?`<span class="fl">${esc(f.label)}</span>`:`<label class="fl" for="${id}">${esc(f.label)}${f.req?"<i>*</i>":""}</label>`;
    return `<div class="frow${f.side?" side":""}" data-f="${esc(f.k)}">${f.side?"":lab}<div class="fv">${w.html(f,item,ctx,id)}${f.hint?`<small class="hint">${esc(f.hint)}</small>`:""}</div></div>`; };
  const groups=[...new Set(fields.map(f=>f.g||""))];
  const rowsOf=g=>fields.filter(f=>(f.g||"")===g&&!f.side).map(row).join("");
  function showTab(i){ $$("[data-tab]",form).forEach(t=>t.setAttribute("aria-selected",String(+t.dataset.tab===i))); $$("[data-panel]",form).forEach(p=>p.hidden=+p.dataset.panel!==i); }
  if(mode==="tabs"&&groups.length>1){
    form.innerHTML=`<div class="tabstrip" role="tablist">${groups.map((g,i)=>`<button type="button" role="tab" aria-selected="${!i}" data-tab="${i}">${esc(g)}</button>`).join("")}</div>
      <div class="tabpanels out">${groups.map((g,i)=>`<div class="tabpanel" role="tabpanel" data-panel="${i}"${i?" hidden":""}>${rowsOf(g)}</div>`).join("")}</div>`;
    form.addEventListener("click",e=>{ const t=e.target.closest("[data-tab]"); if(t) showTab(+t.dataset.tab); });
  }else if(mode==="groups"){
    form.innerHTML=groups.map(g=>`<fieldset class="grp"><legend>${esc(g)}</legend>${rowsOf(g)}</fieldset>`).join("");
  }else{
    const side=fields.filter(f=>f.side);
    form.innerHTML=side.length?`<div class="withside"><div class="sidecol">${side.map(row).join("")}</div><div>${fields.filter(f=>!f.side).map(row).join("")}</div></div>`:fields.map(row).join("");
  }
  hydrate(form);
  insts=fields.map(f=>[f,W[f.t].init(f,$(`[data-f="${CSS.escape(f.k)}"]`,form),item,ctx)]);
  return {
    el:form,
    read:x=>insts.forEach(([,i])=>i.read(x)),
    validate(x){
      $$(".ferr",form).forEach(e=>e.remove()); $$(".inp.bad",form).forEach(e=>e.classList.remove("bad"));
      let first=null;
      for(const [f,i] of insts){
        const msg=(f.req&&isEmpty(getPath(x,f.k))?`Please fill in the ${f.label.toLowerCase()}.`:null)||i.check?.(x);
        if(!msg) continue;
        const r=$(`[data-f="${CSS.escape(f.k)}"]`,form); r.querySelector(".fv").append(el(`<div class="ferr" role="alert">${esc(msg)}</div>`));
        const c=$("input.inp,textarea,select",r); c?.classList.add("bad");
        if(!first){ first=r; const p=r.closest("[data-panel]"); if(p) showTab(+p.dataset.panel); if(ctx.focusErrors!==false) c?.focus(); }
      }
      return !first;
    },
    commit:x=>insts.forEach(([,i])=>i.commit?.(x)),
    busy:()=>insts.some(([,i])=>i.busy?.()),
    paste(file){ const t=insts.find(([,i])=>i.paste); if(t){ t[1].paste(file); return true; } return false; },
    dispose:()=>insts.forEach(([,i])=>i.dispose?.())
  };
}

/* ===================================================================== SECTIONS
   Lists open each item in a dialog. Pages are one form that edits the content directly. */
const placeLabel=p=>({1:"1st",2:"2nd",3:"3rd"})[p]||"—";
const LISTS={
  projects:{ title:"Projects", icon:"folder", noun:"project", addAt:"top", layout:"tiles", tiles:"cover", wide:true, tabs:true,
    blurb:"The cards in the Projects folder, and the page each one opens.",
    tip:"Covers come from the pixel pool unless you pick one or upload your own.",
    win:p=>p?"project-"+p.id:"projects",
    name:p=>p.title||"(untitled)", sub:p=>[p.kind,p.year].filter(Boolean).join(" · "),
    blank:()=>({id:"",title:"",year:thisYear(),kind:"",blurb:"",summary:"",info:[],stack:[],links:{repo:"",demo:""},description:[],highlights:[],images:[]}),
    fields:[
      {k:"title",t:"text",label:"Title",req:true,g:"General",ph:"e.g. MARGENT"},
      {k:"id",t:"id",label:"Page name",g:"General",from:"title",prefix:"project-"},
      {k:"kind",t:"text",label:"Kind",g:"General",ph:"e.g. Research, Agents, Full-stack",suggest:true},
      {k:"year",t:"year",label:"Year",g:"General"},
      {k:"blurb",t:"text",label:"Card line",g:"General",ph:"One short line for the card"},
      {k:"summary",t:"textarea",label:"Summary",rows:3,g:"General",hint:"The opening line on the project page."},
      {k:"stack",t:"tags",label:"Stack",g:"General",ph:"Python, LangGraph, React",hint:"Separate with commas. The first four show on the card."},
      {k:"description",t:"paras",label:"About",rows:9,g:"Page",hint:"Leave a blank line between paragraphs."},
      {k:"highlights",t:"lines",label:"Highlights",rows:4,g:"Page",hint:"One per line."},
      {k:"info",t:"pairs",label:"Properties",g:"Page",suggest:["Role","Team","Status","Mentor","Dataset"],hint:"The Properties box beside the text, e.g. Role → Project lead."},
      {k:"links.repo",t:"url",label:"GitHub",g:"Links",ph:"https://github.com/hatheem-r/…",hint:"Adds a button on the project page."},
      {k:"links.demo",t:"url",label:"Live demo",g:"Links"},
      {k:"links.paper",t:"url",label:"Paper",g:"Links"},
      {k:"cover",t:"cover",label:"Cover",g:"Pictures",folder:p=>`images/projects/${p.id}`,max:1280},
      {k:"images",t:"gallery",label:"Screenshots",g:"Pictures",folder:p=>`images/projects/${p.id}`,max:1920,fallback:"screenshot"}
    ]},
  journal:{ title:"Journal", icon:"journal", noun:"story", addAt:"top", layout:"table", wide:true, tabs:true,
    blurb:"Stories in the Journal window: workshops, competitions, things that broke.",
    win:j=>j?"post-"+j.id:"journal",
    cols:[["Date","date"],["Story","title"],["Tag","tag"]],
    name:j=>j.title||"(untitled)", sub:j=>[j.date,j.tag].filter(Boolean).join(" · "),
    flag:j=>j.draft?"DRAFT":"",
    blank:()=>({id:"",date:today(),title:"",tag:"",body:[],images:[]}),
    fields:[
      {k:"title",t:"text",label:"Title",req:true,g:"Story"},
      {k:"id",t:"id",label:"Page name",g:"Story",from:"title",prefix:"post-"},
      {k:"date",t:"date",label:"Date",g:"Story"},
      {k:"tag",t:"text",label:"Tag",g:"Story",ph:"e.g. workshop",suggest:true},
      {k:"draft",t:"check",label:"Draft",text:"Show a DRAFT banner on this story",g:"Story"},
      {k:"body",t:"paras",label:"Story",rows:12,req:true,g:"Story",hint:"Leave a blank line between paragraphs."},
      {k:"images",t:"gallery",label:"Photos",g:"Photos",folder:j=>`images/journal/${j.id}`,max:1920,fallback:"photo"}
    ]},
  certificates:{ title:"Certificates", icon:"cert", noun:"certificate", addAt:"top", layout:"tiles", win:()=>"awards",
    blurb:"Course certificates. They appear uncropped in the gallery inside the Accomplishments window.",
    tip:"Tip: drop a certificate image or PDF anywhere in this window, or paste a screenshot, to add it.",
    name:c=>c.course||"(untitled)", sub:c=>[c.issuer,c.date].filter(Boolean).join(" · "),
    blank:()=>({course:"",issuer:"",date:"",image:""}),
    fields:[
      {k:"image",t:"image",label:"Certificate",side:true,folder:"certs",max:1600,pdf:true,base:c=>[c.course,c.issuer].filter(Boolean).join(" "),fallback:"certificate",
       empty:"No image yet. The site shows a placeholder until you add one."},
      {k:"course",t:"text",label:"Course",req:true,ph:"e.g. Intro to MCP"},
      {k:"issuer",t:"text",label:"Issuer",ph:"e.g. Scrimba",suggest:true},
      {k:"date",t:"month",label:"Completed"}
    ]},
  accomplishments:{ title:"Milestones", icon:"medal", noun:"milestone", addAt:"top", layout:"table", win:()=>"awards",
    blurb:"The milestone list under the certificates: offers, papers, awards, Dean's List.",
    cols:[["Year","year"],["Milestone","title"],["Organisation","org"],["Note","note"]],
    name:c=>c.title||"(untitled)", sub:c=>[c.year,c.org].filter(Boolean).join(" · "),
    blank:()=>({year:thisYear(),title:"",org:"",note:""}),
    fields:[
      {k:"title",t:"text",label:"Milestone",req:true,ph:"e.g. Dean's List"},
      {k:"year",t:"year",label:"Year"},
      {k:"org",t:"text",label:"Organisation",ph:"e.g. University of Moratuwa",suggest:true},
      {k:"note",t:"text",label:"Note",ph:"optional, e.g. Semester 1"}
    ]},
  competitions:{ title:"Competitions", icon:"trophy", noun:"competition", addAt:"bottom", layout:"table", win:()=>"competitions",
    blurb:"Hackathons and contests, listed in the Competitions window. 1st to 3rd place also puts a trophy on the shelf.",
    cols:[["Year","year"],["Competition","name"],["Track","type"],["Place",c=>placeLabel(c.place)],["Result","result"]],
    name:c=>c.name||"(untitled)", sub:c=>[c.year,c.result].filter(Boolean).join(" · "),
    blank:()=>({year:thisYear(),name:"",type:"",place:null,result:""}),
    fields:[
      {k:"name",t:"text",label:"Competition",req:true,ph:"e.g. Octwave 3.0"},
      {k:"year",t:"year",label:"Year"},
      {k:"type",t:"text",label:"Track",ph:"e.g. Machine learning",suggest:true},
      {k:"place",t:"place",label:"Place",hint:"1st to 3rd also puts a trophy on the shelf."},
      {k:"result",t:"text",label:"Result",ph:"e.g. Overall runner-up"}
    ]}
};
const PAGES={
  profile:{ title:"Profile", icon:"card", line:"Update profile", win:"home",
    blurb:"Your name, intro, photo and facts on the Home window.",
    fields:[
      {k:"name",t:"text",label:"Name",req:true,g:"Identity"},
      {k:"role",t:"text",label:"Role",g:"Identity",hint:"The bold line under your name."},
      {k:"handle",t:"text",label:"Handle",g:"Identity",hint:"Shown as C:\\USERS\\HANDLE> whoami."},
      {k:"about",t:"textarea",label:"About",rows:3,g:"About"},
      {k:"facts",t:"pairs",label:"Facts",g:"About",suggest:["Location","Focus","Next"],hint:"The list under your intro, e.g. Location → Sri Lanka."},
      {k:"photo",t:"image",label:"Photo",g:"Photo",folder:"images",base:()=>"me",max:800,square:true,
       empty:"No photo: the site shows the pixel avatar."},
      {k:"ticker",t:"textarea",label:"Ticker",rows:2,g:"Home window",hint:"The scrolling news line at the top. Separate items with ★."}
    ]},
  contact:{ title:"CV & Contact", icon:"mail", line:"Update CV & contact", win:"contact",
    blurb:"Your CV file and the Address Book entries.",
    fields:[
      {k:"cv.file",t:"pdf",label:"CV file",g:"CV",path:"cv.pdf",updated:"cv.updated"},
      {k:"cv.updated",t:"text",label:"Updated",g:"CV",ph:"e.g. Oct 2026",hint:"Shown under the Download button. Filled in when you upload a new CV."},
      {k:"contact.email",t:"text",label:"Email",g:"Contact",email:true},
      {k:"contact.github",t:"url",label:"GitHub",g:"Contact"},
      {k:"contact.linkedin",t:"url",label:"LinkedIn",g:"Contact"},
      {k:"contact.location",t:"text",label:"Location",g:"Contact",hint:"Optional. Shown in the Address Book."},
      {k:"contact.phone",t:"text",label:"Phone",g:"Contact",hint:"Saved, but the site doesn't show it."}
    ]},
  wallpaper:{ title:"Wallpaper & Sound", icon:"speaker", line:"Update wallpaper & sound", win:null,
    blurb:"The wallpaper greeting, the boat's phrases, the badges on Home, and the background sound.",
    fields:[
      {k:"welcome",t:"welcome",label:"Greeting",g:"Wallpaper"},
      {k:"boatSays",t:"lines",label:"Boat says",rows:7,g:"Wallpaper",hint:"One phrase per line. The boat says one when clicked."},
      {k:"badges",t:"badges",label:"Badges",g:"Home window badges",hint:"Little 88×31 buttons under your intro."},
      {k:"music.title",t:"text",label:"Sound name",g:"Background sound"},
      {k:"music.volume",t:"range",label:"Volume",min:0,max:0.1,step:0.001,g:"Background sound",hint:"Visitors can mute it, but not change the volume."}
    ]}
};
for(const P of Object.values(PAGES)) P.keys=[...new Set(P.fields.map(f=>f.k.split(".")[0]))];
const SEC={...LISTS,...PAGES};
const ORDER=["projects","journal","certificates","accomplishments","competitions","profile","contact","wallpaper"];

function changeLines(){
  const out=[];
  if(S.restored) out.push(S.restored);
  for(const [item,{sec,type}] of S.changes) if(S.draft[sec].includes(item)) out.push(`${type==="add"?"Add":"Edit"} ${LISTS[sec].noun}: ${LISTS[sec].name(item)}`);
  for(const r of S.removed) out.push(`Remove ${LISTS[r.sec].noun}: ${r.name}`);
  for(const k of S.moved) out.push(`Reorder ${LISTS[k].title.toLowerCase()}`);
  if(!S.restored) for(const P of Object.values(PAGES)) if(P.keys.some(k=>!same(S.draft[k],S.original[k]))) out.push(P.line);
  return out;
}

/* ---------- dialogs ---------- */
let dlgN=0;
const topModal=()=>$$(".modal").pop()||null;
function dialog({title,icon:ic,body,buttons=[],cls="",onAction}){
  const ov=el(`<div class="modal"><section class="win out dlg ${cls}" role="dialog" aria-modal="true" aria-labelledby="dt${++dlgN}">
    <div class="bar"><span data-icon="${ic}"></span><h1 id="dt${dlgN}">${esc(title)}</h1><button type="button" class="btn out ctl" data-dlg="cancel" aria-label="Close">✕</button></div>
    <div class="dbody"></div><div class="dfoot"></div></section></div>`);
  const dbody=$(".dbody",ov), foot=$(".dfoot",ov);
  if(typeof body==="string") dbody.innerHTML=body; else dbody.append(body);
  const setButtons=bs=>{ foot.innerHTML=bs.map(([t,a,def])=>`<button type="button" class="btn out${def?" def":""}" data-dlg="${a}">${esc(t)}</button>`).join(""); foot.hidden=!bs.length; };
  setButtons(buttons);
  document.body.append(ov); hydrate(ov);
  const prev=document.activeElement;
  let closed=false;
  const close=()=>{ if(closed) return; closed=true; ov.remove(); document.removeEventListener("keydown",key,true); if(prev&&document.contains(prev)) prev.focus(); };
  const act=async a=>{ const r=onAction?await onAction(a,api):true; if(r!==false) close(); };
  ov.addEventListener("click",e=>{ const b=e.target.closest("[data-dlg]"); if(b&&!b.disabled) act(b.dataset.dlg); });
  const key=e=>{
    if(topModal()!==ov) return;
    if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); act("cancel"); }
    else if(e.key==="Enter"&&!e.target.closest("button,textarea,select,a,summary,[role=button],input[type=color],input[type=range]")){ const d=$(".dfoot .def",ov); if(d&&!d.disabled){ e.preventDefault(); act(d.dataset.dlg); } }
    else if(e.key==="Tab"){ const f=$$("button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,a[href],[tabindex='0'],iframe",ov).filter(x=>x.offsetParent);
      if(!f.length) return; const i=f.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey&&i===f.length-1){ e.preventDefault(); f[0].focus(); } }
  };
  document.addEventListener("keydown",key,true);
  const api={el:ov,body:dbody,close,act,setButtons};
  setTimeout(()=>($("[autofocus]",ov)||$(".dbody input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([readonly]),.dbody select",ov)||$(".dfoot .def",ov))?.focus(),0);
  return api;
}
function msgbox(title,html,ic="info",buttons=[["OK","ok",true]]){
  return new Promise(res=>dialog({title,icon:ic,cls:"msg",buttons,
    body:`<div class="msgrow"><span data-icon="${ic}" class="big"></span><div>${html}</div></div>`,
    onAction:a=>{ res(a); return true; }}));
}
function progressBox(text){
  return dialog({title:"Control Panel",icon:"cpl",cls:"msg noclose",body:`<div class="msgrow"><span data-icon="cpl" class="big"></span><div><p class="pstep">${esc(text)}</p><div class="prog in marquee"><i></i></div></div></div>`,onAction:()=>false});
}

/* ---------- menus (File, Help, Start) ---------- */
function popup(anchor,items,up){
  const was=S.popup?.anchor; closePopup(); if(was===anchor) return;
  const m=el(`<ul class="popup out${up?" startpop":""}" role="menu">${items.map((it,i)=>it==="-"?`<li class="sep" role="separator"></li>`
    :`<li><button role="menuitem" data-i="${i}"${it.disabled?" disabled":""}>${it.icon?`<span data-icon="${it.icon}"></span>`:`<i class="noi"></i>`}<span class="ml">${esc(it.label)}</span>${it.key?`<kbd>${it.key}</kbd>`:""}</button></li>`).join("")}</ul>`);
  hydrate(m); document.body.append(m);
  const r=anchor.getBoundingClientRect();
  m.style.left=Math.max(2,Math.min(r.left,innerWidth-m.offsetWidth-2))+"px";
  if(up) m.style.bottom=(innerHeight-r.top)+"px"; else m.style.top=r.bottom+"px";
  m.addEventListener("click",e=>{ const b=e.target.closest("button[data-i]"); if(!b) return; closePopup(); items[+b.dataset.i].run(); });
  m.addEventListener("keydown",e=>{ const bs=$$("button:not([disabled])",m), i=bs.indexOf(document.activeElement);
    if(e.key==="ArrowDown"){ e.preventDefault(); bs[(i+1)%bs.length].focus(); } if(e.key==="ArrowUp"){ e.preventDefault(); bs[(i-1+bs.length)%bs.length].focus(); } });
  anchor.setAttribute("aria-expanded","true"); S.popup={m,anchor};
  setTimeout(()=>$("button:not([disabled])",m)?.focus(),0);
}
function closePopup(){ if(!S.popup) return; S.popup.m.remove(); S.popup.anchor.setAttribute("aria-expanded","false"); S.popup=null; }
document.addEventListener("pointerdown",e=>{ if(S.popup&&!S.popup.m.contains(e.target)&&!S.popup.anchor.contains(e.target)) closePopup(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&S.popup){ const a=S.popup.anchor; closePopup(); a.focus(); } });
const openSite=()=>window.open(SITE,"_blank","noopener");
const fileMenu=()=>[{label:"Publish…",icon:"save",key:"Ctrl+S",disabled:!isDirty(),run:openPublish},
  {label:"Preview",icon:"pc",key:"Ctrl+P",run:()=>openPreview()},
  {label:"History…",icon:"clock",run:openHistory},"-",
  {label:"Reload from GitHub",run:reload},{label:"Discard unpublished changes",icon:"del",disabled:!isDirty(),run:discard},"-",
  {label:"Open my site",icon:"pc",run:openSite},{label:"Sign out",icon:"key",run:signOut}];
const helpMenu=()=>[{label:"How publishing works",icon:"info",run:help},{label:"About Control Panel",icon:"cpl",run:about}];
const startMenu=()=>[{label:"Control Panel",icon:"cpl",run:()=>go("")},"-",...ORDER.map(k=>({label:SEC[k].title,icon:SEC[k].icon,run:()=>go(k)})),"-",
  {label:"History…",icon:"clock",run:openHistory},{label:"Open my site",icon:"pc",run:openSite},{label:"Sign out",icon:"key",run:signOut}];

/* ---------- shell ---------- */
function buildShell(){
  document.body.innerHTML=`
  <section class="win out main" id="main" aria-label="Control Panel" hidden>
    <div class="bar"><span data-icon="cpl"></span><h1>Control Panel</h1>
      <a class="btn out ctl" href="${SITE}" target="_blank" rel="noopener" title="Open your site in a new tab" aria-label="Open your site">↗</a></div>
    <div class="menu" role="menubar"><button class="mb" data-menu="file" aria-haspopup="menu" aria-expanded="false"><u>F</u>ile</button><button class="mb" data-menu="help" aria-haspopup="menu" aria-expanded="false"><u>H</u>elp</button></div>
    <div class="tool">
      <button class="btn out tb" id="upbtn" title="Up to Control Panel"><span data-icon="up"></span><span class="lbl">Up</span></button>
      <button class="btn out tb" id="pvbtn" title="Preview the site with your unpublished changes (Ctrl+P)"><span data-icon="pc"></span><span class="lbl">Preview</span></button>
      <button class="btn out tb" id="pubbtn" disabled title="Publish your changes (Ctrl+S)"><span data-icon="save"></span><span class="lbl">Publish</span><b id="pubn"></b></button>
      <span class="addrlab">Address</span><div class="addr in" id="addr">Control Panel</div>
    </div>
    <div class="cp"><aside class="web" id="web"></aside><div class="pane in" id="pane"></div></div>
    <div class="status"><div class="st" id="st1"></div><div class="st" id="st2" aria-live="polite"></div><div class="grip"></div></div>
  </section>
  <footer class="task out">
    <button class="btn out start" id="startbtn" aria-haspopup="menu" aria-expanded="false"><i></i><b>Start</b></button>
    <div class="tabs"><button class="btn out" aria-pressed="true" id="tab" tabindex="-1"><span data-icon="cpl"></span><span>Control Panel</span></button></div>
    <div class="clock" id="clock"></div>
  </footer>`;
  hydrate(document.body);
  $$("[data-menu]").forEach(b=>b.onclick=()=>popup(b,b.dataset.menu==="file"?fileMenu():helpMenu()));
  $("#startbtn").onclick=()=>{ if(!$("#main").hidden) popup($("#startbtn"),startMenu(),true); };
  $("#upbtn").onclick=()=>go("");
  $("#pvbtn").onclick=()=>openPreview();
  $("#pubbtn").onclick=openPublish;
  const tick=()=>{ $("#clock").textContent=new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}); };
  tick(); setInterval(tick,15000);
  wirePane();
}
function go(v){ history.pushState(null,"",v?"#"+v:location.pathname+location.search); route(); }
function route(){ const k=location.hash.slice(1); S.view=SEC[k]?k:"home"; S.sel=-1; render(); $("#pane").scrollTop=0; }
addEventListener("popstate",()=>{ if(S.draft&&!topModal()) route(); });

function render(){
  const N=SEC[S.view];
  $("#addr").textContent="Control Panel"+(N?"\\"+N.title:"");
  $("#upbtn").disabled=!N;
  document.title=(N?N.title+" · ":"")+"Control Panel";
  renderWeb(); renderPane(); renderStatus();
}
function renderStatus(){
  const dirty=isDirty(), n=Math.max(1,changeLines().length);
  $("#pubbtn").disabled=!dirty; $("#pubn").textContent=dirty?` (${n})`:"";
  $("#st1").textContent=`${S.owner}/${S.repo} · ${S.branch}`;
  $("#st2").textContent=dirty?`${n} unpublished change${n===1?"":"s"}`:(S.liveMsg||"Everything is published");
  $("#st2").classList.toggle("dirty",dirty);
}
function renderWeb(){
  const N=SEC[S.view], web=$("#web");
  if(!N){
    web.innerHTML=`<div class="webhead"><span data-icon="cpl" class="big"></span><h2>Control Panel</h2></div><hr class="wline">
      <p id="webdesc">Use the settings in Control Panel to update your site.</p>
      <p class="muted">Changes wait here until you press <b>Publish</b>. Then Vercel redeploys the site, usually within a minute.</p>
      <p class="muted">Press <b>Preview</b> any time to see the site with your changes before they go live.</p>
      <p><a href="${SITE}" target="_blank" rel="noopener">Open my site ↗</a></p>`;
  }else if(PAGES[S.view]){
    web.innerHTML=`<div class="webhead"><span data-icon="${N.icon}" class="big"></span><h2>${N.title}</h2></div><hr class="wline">
      <p>${esc(N.blurb)}</p><p class="muted">Changes here count as soon as you type. Press <b>Preview</b> to see them on the site, then <b>Publish</b>.</p>`;
  }else{
    const it=S.draft[S.view][S.sel];
    web.innerHTML=`<div class="webhead"><span data-icon="${N.icon}" class="big"></span><h2>${N.title}</h2></div><hr class="wline">
      <p>${esc(N.blurb)}</p>${N.tip?`<p class="muted">${esc(N.tip)}</p>`:""}
      <div class="websel">${it?`<b>${esc(N.name(it))}</b>${N.sub(it)?`<br>${esc(N.sub(it))}`:""}${it.image?`<br><code>${esc(it.image)}</code>`:""}
        <p class="muted">Double-click or press Enter to edit.</p>`:`<p class="muted">Select an item to see its details.</p>`}</div>`;
  }
  hydrate(web);
}
const chip=item=>{ const c=S.changes.get(item); return c?`<em class="chip ${c.type}">${c.type==="add"?"NEW":"EDITED"}</em>`:""; };
function renderPane(){
  const pane=$("#pane"), N=SEC[S.view];
  S.page?.dispose(); S.page=null;
  if(!N){
    pane.innerHTML=`<div class="applets" role="list">${ORDER.map(k=>`<button class="applet" role="listitem" data-go="${k}" data-desc="${esc(SEC[k].blurb)}"><span data-icon="${SEC[k].icon}" class="big"></span><span class="al">${SEC[k].title}</span></button>`).join("")}</div>`;
    hydrate(pane); return;
  }
  if(PAGES[S.view]) return renderPage(pane,S.view);
  const list=S.draft[S.view], dis=S.sel<0?" disabled":"";
  const covers=N.tiles==="cover";
  const body=!list.length?`<div class="empty"><span data-icon="${N.icon}" class="big"></span><p>No ${N.title.toLowerCase()} yet.</p><button class="btn out" data-act="new">New ${N.noun}</button></div>`
    :N.layout==="tiles"?`<div class="tiles${covers?" wide":""}" role="listbox" aria-label="${N.title}">${list.map((c,i)=>`<button class="tile out" role="option" data-i="${i}" aria-selected="${i===S.sel}">
        <span class="mat in${covers?" cov":""}" data-mat="${i}">${covers?"":c.image?`<img src="${esc(resolveSrc(c.image))}" alt="" loading="lazy">`:`<span class="noimg">no image</span>`}</span>
        <span class="cap"><b>${esc(N.name(c))}</b><small>${esc(N.sub(c))||"&nbsp;"}</small></span>${chip(c)}</button>`).join("")}</div>`
    :`<div class="tablewrap"><table class="lv"><thead><tr>${N.cols.map(([h])=>`<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>
        ${list.map((c,i)=>`<tr data-i="${i}" tabindex="0" aria-selected="${i===S.sel}">${N.cols.map(([,f],j)=>{ const v=typeof f==="function"?f(c):c[f];
          return j===1?`<td><b>${esc(v)}</b>${N.flag?.(c)?`<em class="chip flag">${N.flag(c)}</em>`:""}${chip(c)}</td>`:`<td>${esc(v)}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
  pane.innerHTML=`<div class="ltool">
      <button class="btn out" data-act="new"><span data-icon="new"></span>New ${N.noun}</button>
      <button class="btn out" data-act="edit"${dis}><span data-icon="props"></span>Properties</button>
      <button class="btn out" data-act="del"${dis}><span data-icon="del"></span>Delete</button>
      <span class="vsep"></span>
      <button class="btn out sq" data-act="up" title="Move up (Alt+↑)" aria-label="Move up"${dis}>▲</button>
      <button class="btn out sq" data-act="down" title="Move down (Alt+↓)" aria-label="Move down"${dis}>▼</button>
      <span class="count">${list.length} item${list.length===1?"":"s"}</span>
    </div>${body}${S.view==="certificates"?`<div class="dropov" aria-hidden="true"><span>Drop to add a new ${N.noun}</span></div>`:""}`;
  if(covers) $$("[data-mat]",pane).forEach(m=>m.append(coverNode(list[+m.dataset.mat],list)));
  hydrate(pane); syncTools();
}
function renderPage(pane,k){
  const P=PAGES[k];
  const ctx={isNew:false,changed:null,focusErrors:false};
  const F=buildForm(P.fields,S.draft,ctx,"groups");
  pane.innerHTML=`<div class="sheet"></div>`; $(".sheet",pane).append(F.el);
  let t=0;
  const apply=()=>{ clearTimeout(t); t=setTimeout(()=>{
    const next=clone(S.draft); F.read(next); F.validate(next); F.commit(next);
    for(const key of P.keys){ if(next[key]===undefined) delete S.draft[key]; else S.draft[key]=next[key]; }
    renderStatus(); },120); };
  ctx.changed=apply;
  F.el.addEventListener("input",apply); F.el.addEventListener("change",apply);
  S.page={dispose(){ clearTimeout(t); F.dispose(); }};
}
function syncTools(){
  const i=S.sel, n=S.draft[S.view]?.length||0;
  $$("#pane .ltool [data-act]").forEach(b=>{ const a=b.dataset.act;
    b.disabled=a!=="new"&&(i<0||(a==="up"&&i===0)||(a==="down"&&i===n-1)); });
}
function select(i){
  S.sel=i;
  $$("#pane [data-i]").forEach(x=>x.setAttribute("aria-selected",String(+x.dataset.i===i)));
  syncTools(); renderWeb();
}
const focusSel=()=>$(`#pane [data-i="${S.sel}"]`)?.focus();
function wirePane(){
  const pane=$("#pane");
  pane.addEventListener("click",e=>{
    const ap=e.target.closest(".applet"); if(ap){ go(ap.dataset.go); return; }
    if(!LISTS[S.view]) return;
    const a=e.target.closest("[data-act]");
    if(a&&!a.disabled){ const k=S.view, i=S.sel;
      if(a.dataset.act==="new") openEditor(k,-1);
      if(a.dataset.act==="edit") openEditor(k,i);
      if(a.dataset.act==="del") removeItem(k,i);
      if(a.dataset.act==="up") move(k,i,-1);
      if(a.dataset.act==="down") move(k,i,1);
      return; }
    const it=e.target.closest("[data-i]");
    if(it){ select(+it.dataset.i); if(coarse) openEditor(S.view,+it.dataset.i); }
  });
  pane.addEventListener("dblclick",e=>{ const it=e.target.closest("[data-i]"); if(it&&!coarse&&LISTS[S.view]) openEditor(S.view,+it.dataset.i); });
  pane.addEventListener("keydown",e=>{
    const it=e.target.closest("[data-i]"); if(!it||!LISTS[S.view]) return;
    const i=+it.dataset.i, k=S.view, n=S.draft[k].length;
    if(e.key==="Enter"){ e.preventDefault(); select(i); openEditor(k,i); }
    else if(e.key==="Delete"){ e.preventDefault(); select(i); removeItem(k,i); }
    else if(/^Arrow(Up|Down|Left|Right)$/.test(e.key)){
      if(LISTS[k].layout!=="tiles"&&/Left|Right/.test(e.key)) return;
      e.preventDefault(); const d=/Down|Right/.test(e.key)?1:-1;
      if(e.altKey) move(k,i,d); else { select(Math.max(0,Math.min(n-1,i+d))); focusSel(); } }
  });
  const hover=e=>{ const ap=e.target.closest?.(".applet"); const d=$("#webdesc"); if(ap&&d) d.innerHTML=`<b>${esc($(".al",ap).textContent)}</b><br>${esc(ap.dataset.desc)}`; };
  pane.addEventListener("pointerover",hover); pane.addEventListener("focusin",hover);
  // drop a file on the certificates window → new certificate
  let depth=0;
  const files=e=>[...(e.dataTransfer?.types||[])].includes("Files");
  pane.addEventListener("dragenter",e=>{ if(S.view!=="certificates"||!files(e)) return; e.preventDefault(); depth++; pane.classList.add("dropping"); });
  pane.addEventListener("dragleave",()=>{ if(--depth<=0){ depth=0; pane.classList.remove("dropping"); } });
  pane.addEventListener("dragover",e=>{ if(S.view==="certificates"&&files(e)){ e.preventDefault(); e.dataTransfer.dropEffect="copy"; } });
  pane.addEventListener("drop",e=>{ depth=0; pane.classList.remove("dropping"); if(S.view!=="certificates") return; e.preventDefault();
    const f=e.dataTransfer.files[0]; if(f) openEditor("certificates",-1,f); });
}
// stop the browser from opening a file dropped outside a drop zone
addEventListener("dragover",e=>e.preventDefault()); addEventListener("drop",e=>e.preventDefault());
document.addEventListener("paste",e=>{
  const f=[...(e.clipboardData?.files||[])].find(x=>/^image\/|pdf$/.test(x.type)); if(!f) return;
  const top=topModal();
  if(top){ if(top._form?.paste(f)) e.preventDefault(); return; }
  if(S.view==="certificates"&&S.draft){ e.preventDefault(); openEditor("certificates",-1,f); }
});
document.addEventListener("keydown",e=>{
  if(!(e.ctrlKey||e.metaKey)||!S.draft||topModal()) return;
  const k=e.key.toLowerCase();
  if(k==="s"){ e.preventDefault(); openPublish(); }
  if(k==="p"){ e.preventDefault(); openPreview(); }
});
addEventListener("beforeunload",e=>{ if(isDirty()){ e.preventDefault(); e.returnValue=""; } });

/* ---------- list actions ---------- */
async function removeItem(k,i){
  const N=LISTS[k], it=S.draft[k][i]; if(!it) return;
  const pics=localRefs(it).size;
  const a=await msgbox(`Confirm ${N.noun} delete`,`<p>Are you sure you want to delete “${esc(N.name(it))}”?</p>${pics?`<p class="muted">Its picture files are cleaned up when you publish.</p>`:""}`,"warn",[["Yes","yes",true],["No","no"]]);
  if(a!=="yes") return;
  S.draft[k].splice(i,1);
  if(S.changes.get(it)?.type!=="add") S.removed.push({sec:k,name:N.name(it)});
  S.changes.delete(it);
  S.sel=Math.min(i,S.draft[k].length-1); render(); focusSel();
}
function move(k,i,d){
  const L=S.draft[k], j=i+d; if(i<0||j<0||j>=L.length) return;
  [L[i],L[j]]=[L[j],L[i]]; S.moved.add(k); S.sel=j; render(); focusSel();
}
function apply(k,i,orig,next){
  const N=LISTS[k], list=S.draft[k];
  if(i<0){ const at=N.addAt==="top"?0:list.length; list.splice(at,0,next); S.changes.set(next,{sec:k,type:"add"}); S.sel=at; }
  else{ if(same(orig,next)) return;
    const was=S.changes.get(orig); S.changes.delete(orig); list[i]=next; S.changes.set(next,{sec:k,type:was?.type==="add"?"add":"edit"}); S.sel=i; }
  render(); focusSel();
}
function openEditor(k,i,file){
  const N=LISTS[k], isNew=i<0, orig=isNew?null:S.draft[k][i]; if(!isNew&&!orig) return;
  const item=isNew?N.blank():clone(orig);
  const ctx={isNew,orig,list:S.draft[k]};
  const F=buildForm(N.fields,item,ctx,N.tabs?"tabs":"plain");
  const d=dialog({title:`${isNew?"New":"Edit"} ${N.noun}${isNew?"":`: ${N.name(orig)}`}`,icon:N.icon,body:F.el,cls:N.wide||N.fields.some(f=>f.side)?"wide":"",
    buttons:[["OK","ok",true],["Cancel","cancel"]],
    onAction:a=>{
      if(a!=="ok"){ F.dispose(); return true; }
      if(F.busy()) return false;
      const next=clone(item); F.read(next);
      if(!F.validate(next)) return false;
      F.commit(next); apply(k,i,orig,next); return true;
    }});
  d.el._form=F;
  d.el.addEventListener("dragover",e=>e.preventDefault());
  d.el.addEventListener("drop",e=>{ e.preventDefault(); [...e.dataTransfer.files].forEach(x=>F.paste(x)); });
  if(file) F.paste(file);
}

/* ---------- preview: the real site, fed the unpublished content ---------- */
async function previewDoc(){
  const r=await fetch(SITE,{cache:"no-store"}); if(!r.ok) throw new Error("Couldn't load your site's index.html.");
  const html=await r.text();
  const data=clone(S.draft);
  (function swap(o){ for(const k of Object.keys(o)){ const v=o[k];
    if(typeof v==="string"){ const p=v.split(/[?#]/)[0], u=S.pending.get(p)?.url||S.recent.get(p); if(u) o[k]=u; }
    else if(v&&typeof v==="object") swap(v); } })(data);
  const inline=`<script>const CONTENT=${JSON.stringify(data).replace(/</g,"\\u003c")};<\/script>`;
  const doc=html.replace(/<script[^>]*\bsrc=["'][^"']*js\/content\.js[^"']*["'][^>]*><\/script>/i,()=>inline);
  if(doc===html) throw new Error("Couldn't find js/content.js in your site's index.html.");
  return doc.replace(/<head[^>]*>/i,m=>`${m}<base href="${esc(new URL(SITE,location.href).href)}">`);
}
function currentWin(){
  const N=SEC[S.view]; if(!N) return null;
  if(PAGES[S.view]) return N.win;
  return N.win(S.draft[S.view][S.sel]);
}
function openPreview(win=currentWin()){
  if(!S.draft||topModal()) return;
  const body=el(`<div class="pv"><div class="pvbar"><span class="muted">${isDirty()?"Your unpublished changes are shown here. Nothing is live yet.":"No unpublished changes: this is what the site shows now."}</span>
    <button type="button" class="btn out small" data-pv>Refresh</button></div><iframe title="Preview of your site"></iframe></div>`);
  dialog({title:"Preview",icon:"pc",body,cls:"preview",buttons:[["Close","cancel",true]]});
  const frame=$("iframe",body);
  const load=async()=>{
    try{ frame.onload=()=>{ try{ if(win) frame.contentWindow.openWin?.(win); }catch(e){} }; frame.srcdoc=await previewDoc(); }
    catch(e){ $(".pvbar .muted",body).textContent=e.message; }
  };
  $("[data-pv]",body).onclick=load; load();
}

/* ---------- history: every publish is a commit; load an older one back as a draft ---------- */
async function openHistory(){
  if(!S.draft||topModal()) return;
  const d=dialog({title:"History",icon:"clock",cls:"wide hist",buttons:[["Close","cancel",true]],
    body:`<p>Every publish is kept. Load an older version to check it; it only goes live when you publish it.</p><div class="histlist in"><p class="muted pad">Loading…</p></div>`});
  const box=$(".histlist",d.el);
  try{
    const list=await S.gh.get(`/commits?path=${encodeURIComponent(CONTENT_PATH)}&sha=${encodeURIComponent(S.branch)}&per_page=30`);
    box.innerHTML=`<table class="lv hl"><thead><tr><th>When</th><th>Change</th><th></th></tr></thead><tbody>${list.map((c,i)=>`<tr>
      <td class="when">${esc(fmtDate(c.commit.author?.date||c.commit.committer?.date))}</td>
      <td><b>${esc(c.commit.message.split("\n")[0])}</b><br><small class="muted">${esc(c.sha.slice(0,7))} · ${esc(c.commit.author?.name||"")}</small></td>
      <td class="hact">${i===0?`<span class="chip">CURRENT</span>`:`<button class="btn out small" data-restore="${c.sha}" data-when="${esc(c.commit.author?.date||"")}">Load</button>`}
        <a class="btn out small" href="https://github.com/${esc(S.owner)}/${esc(S.repo)}/commit/${c.sha}" target="_blank" rel="noopener">GitHub ↗</a></td></tr>`).join("")}</tbody></table>`;
    box.addEventListener("click",async e=>{ const b=e.target.closest("[data-restore]"); if(!b) return;
      if(isDirty()&&await msgbox("Load older version","<p>This replaces your unpublished changes. Continue?</p>","warn",[["Load","yes",true],["Cancel","no"]])!=="yes") return;
      d.close(); restoreVersion(b.dataset.restore,b.dataset.when); });
  }catch(e){ box.innerHTML=`<p class="ferr pad">${esc(explain(e))}</p>`; }
}
async function restoreVersion(sha,when){
  const box=progressBox("Loading that version…");
  try{
    const t=await readTree(sha), {data}=await readContent(t.files);
    for(const f of S.pending.values()) URL.revokeObjectURL(f.url);
    S.pending.clear();
    // files that version used but were deleted later come back with it
    for(const p of localRefs(data)) if(!S.files.has(p)&&t.files.has(p)){
      const b=await S.gh.get(`/git/blobs/${t.files.get(p)}`), blob=new Blob([b64bytes(b.content)],{type:MIME[p.split(".").pop().toLowerCase()]||""});
      S.pending.set(p,{blob,url:URL.createObjectURL(blob)}); }
    S.draft=data; resetChanges(); S.restored=`Restore the version from ${fmtDate(when)}`; S.sel=-1;
    box.close(); render();
    msgbox("Version loaded",`<p>The version from <b>${esc(fmtDate(when))}</b> is loaded.</p><p>Press <b>Preview</b> to check it, then <b>Publish</b> to make it live. To cancel, use File → Discard unpublished changes.</p>`,"info");
  }catch(e){ box.close(); msgbox("History",`<p>${esc(explain(e))}</p>`,"err"); }
}

/* ---------- publish ---------- */
function openPublish(){
  if(!isDirty()||topModal()) return;
  const lines=changeLines(), newRefs=localRefs(S.draft), oldRefs=localRefs(S.original);
  const uploads=[...S.pending].filter(([p])=>newRefs.has(p));
  const unused=[...oldRefs].filter(p=>!newRefs.has(p)&&S.files.has(p)&&/^(certs|images)\//.test(p));
  const subject=lines.length===1?lines[0]:lines.length?`Update site content (${lines.length} changes)`:"Update site content";
  const body=el(`<div class="pub">
    <p>These changes are saved to <b>${esc(S.owner)}/${esc(S.repo)}</b> on GitHub. Vercel then redeploys your site, usually within a minute.</p>
    <fieldset class="grp"><legend>Changes</legend><ul class="chg">${(lines.length?lines:["Content edits"]).map(l=>`<li>${esc(l)}</li>`).join("")}</ul></fieldset>
    ${uploads.length?`<fieldset class="grp"><legend>Files to upload</legend><ul class="files">${uploads.map(([p,f])=>`<li><span data-icon="${/\.pdf$/i.test(p)?"doc":"picture"}"></span><code>${esc(p)}</code> <small class="muted">${kb(f.blob.size)}</small></li>`).join("")}</ul></fieldset>`:""}
    ${unused.length?`<fieldset class="grp"><legend>Files no longer used</legend>${unused.map(p=>`<label class="chk"><input type="checkbox" name="del" value="${esc(p)}" checked> Delete <code>${esc(p)}</code></label>`).join("")}</fieldset>`:""}
    <label class="msgl" for="pubmsg">Note for the history</label><input class="inp" id="pubmsg" value="${esc(subject)}" maxlength="120">
    <div class="pprog" hidden><p class="pstep">Starting…</p><div class="prog in"><i></i></div></div>
    <p class="perr ferr" role="alert" hidden></p>
  </div>`);
  let state="ask";
  dialog({title:"Publish to the web",icon:"save",body,cls:"pubdlg",buttons:[["Publish","go",true],["Preview first","pv"],["Cancel","cancel"]],
    onAction:async(a,d)=>{
      if(state==="busy") return false;
      if(a==="reload"){ d.close(); connect(true); return false; }
      if(a==="pv"&&state==="ask"){ d.close(); openPreview(); return false; }
      if(a!=="go") return true;
      state="busy";
      $$(".dfoot button",d.el).forEach(b=>b.disabled=true); $(".bar .ctl",d.el)?.setAttribute("disabled","");
      const prog=$(".pprog",body), err=$(".perr",body), bar=$(".prog i",body), stepEl=$(".pstep",body);
      prog.hidden=false; err.hidden=true;
      const dels=$$("[name=del]:checked",body).map(x=>x.value);
      const msg=($("#pubmsg",body).value.trim()||subject)+(lines.length>1?"\n\n"+lines.map(l=>"- "+l).join("\n"):"")+"\n\nPublished from the Control Panel.";
      try{
        const res=await publish(uploads,dels,msg,(t,p)=>{ stepEl.textContent=t; bar.style.width=Math.round(p)+"%"; });
        state="done";
        d.body.innerHTML=`<div class="msgrow"><span data-icon="info" class="big"></span><div><p><b>Published.</b> Vercel is redeploying your site; it's usually live within a minute.</p>
          <p class="links"><a href="${SITE}" target="_blank" rel="noopener">Open my site ↗</a><a href="https://github.com/${esc(S.owner)}/${esc(S.repo)}/commit/${res.sha}" target="_blank" rel="noopener">See the commit on GitHub ↗</a></p></div></div>`;
        hydrate(d.body); d.setButtons([["OK","cancel",true]]); $(".bar .ctl",d.el)?.removeAttribute("disabled"); $(".dfoot .def",d.el).focus();
        watchLive(res.text); render();
      }catch(e){
        state="ask"; prog.hidden=true; err.hidden=false;
        err.innerHTML=`<span data-icon="err"></span>${esc(explain(e,true))}`+(e.conflict?" Reload to get the latest version. Your unpublished changes here will be lost, so note them down first.":" Nothing was changed on your site.");
        hydrate(err);
        if(e.conflict){ state="conflict"; d.setButtons([["Reload","reload",true],["Cancel","cancel"]]); }
        else $$(".dfoot button",d.el).forEach(b=>b.disabled=false);
        $(".bar .ctl",d.el)?.removeAttribute("disabled");
      }
      return false;
    }});
}
function watchLive(text){
  clearInterval(S.watch); let n=0;
  S.liveMsg="Published · waiting for Vercel to redeploy…"; renderStatus();
  S.watch=setInterval(async()=>{
    n++;
    try{ const r=await fetch(SITE+CONTENT_PATH+"?cp="+Date.now(),{cache:"no-store"});
      if(r.ok&&(await r.text())===text){ clearInterval(S.watch); S.liveMsg="✓ Your changes are live on the site"; renderStatus(); return; } }catch(e){}
    if(n>=48){ clearInterval(S.watch); S.liveMsg="Published (the site can take a few more minutes)"; renderStatus(); }
  },5000);
}

/* ---------- session ---------- */
async function reload(){
  if(isDirty()&&await msgbox("Reload from GitHub","<p>Discard your unpublished changes and load the latest version from GitHub?</p>","warn",[["Reload","yes",true],["Cancel","no"]])!=="yes") return;
  connect(true);
}
async function discard(){
  if(await msgbox("Discard changes",`<p>Throw away ${changeLines().length||"all"} unpublished change(s)?</p>`,"warn",[["Discard","yes",true],["Cancel","no"]])!=="yes") return;
  for(const f of S.pending.values()) URL.revokeObjectURL(f.url);
  S.pending.clear(); S.draft=clone(S.original); resetChanges(); S.sel=-1; render();
}
async function signOut(){
  if(isDirty()&&await msgbox("Sign out","<p>You have unpublished changes. Sign out and lose them?</p>","warn",[["Sign out","yes",true],["Cancel","no"]])!=="yes") return;
  mem.del("cp_token"); S.draft=null; S.origText=""; $("#main").hidden=true; showLogin();
}
function help(){ msgbox("How publishing works",`<ol class="steps">
  <li>Open a section and add, edit, reorder or delete things. Pictures are resized and named for you.</li>
  <li>Your edits wait in this window. Press <b>Preview</b> to see the site with them.</li>
  <li>Press <b>Publish</b>. Everything is saved to GitHub as one commit.</li>
  <li>Vercel sees the commit and redeploys the site, usually within a minute. The status bar says when it's live.</li></ol>
  <p class="muted">Every publish stays in History (File menu), so an older version can always be loaded back.</p>`,"info"); }
function about(){ msgbox("About Control Panel",`<p><b>HatheemOS 98 Control Panel</b></p><p>Edits <code>${CONTENT_PATH}</code> in <b>${esc(S.owner)}/${esc(S.repo)}</b> through the GitHub API.</p>
  <p class="muted">Your token is stored only in this browser. Sign out (File menu) to remove it.</p>`,"cpl"); }

function detectRepo(){
  try{ const saved=JSON.parse(localStorage.getItem("cp_repo")||"null"); if(saved?.owner&&saved?.repo) return saved; }catch(e){}
  return {...REPO};
}
function showLogin(msg){
  const r=detectRepo(), tok=mem.get("cp_token")||"";
  dialog({title:"Welcome to Control Panel",icon:"key",cls:"login noclose",buttons:[["OK","ok",true],["Cancel","leave"]],
    body:`<div class="msgrow"><span data-icon="key" class="big"></span><div>
      <p>Type your GitHub token to log on to the Control Panel.</p>
      <div class="form">
        <label class="fl" for="lg_repo">Repository</label><div class="fv"><input class="inp" id="lg_repo" value="${esc(r.owner&&r.repo?r.owner+"/"+r.repo:"")}" placeholder="username/repository" spellcheck="false" autocapitalize="off"></div>
        <label class="fl" for="lg_tok">Token</label><div class="fv"><input class="inp" id="lg_tok" type="password" value="${esc(tok)}" spellcheck="false" autocapitalize="off" autocomplete="off"${r.owner?" autofocus":""}></div>
        <span></span><div class="fv"><label class="chk"><input type="checkbox" id="lg_keep" checked> Remember me on this device</label></div>
      </div>
      ${msg?`<p class="ferr" role="alert"><span data-icon="err"></span>${esc(msg)}</p>`:""}
      <details class="how"><summary>How do I get a token?</summary><ol class="steps">
        <li>Open <a href="${TOKEN_URL}" target="_blank" rel="noopener">GitHub's new token page ↗</a> (a fine-grained token).</li>
        <li>Name it “Control Panel” and pick an expiry. A year is fine; make a new one when it runs out.</li>
        <li>Under <b>Repository access</b>, choose <b>Only select repositories</b> and pick <b>${esc(r.repo||"your portfolio repository")}</b>.</li>
        <li>Under <b>Permissions</b>, set <b>Contents</b> to <b>Read and write</b>.</li>
        <li>Generate it, copy it, and paste it here.</li></ol>
        <p class="muted">The token only works on this one repository, and it is stored only in this browser. Use “Remember me” on your own devices only.</p></details>
    </div></div>`,
    onAction:(a,d)=>{
      if(a==="leave"){ location.href=SITE; return false; }
      if(a!=="ok") return false;   // Esc does nothing here: there is nothing behind this dialog
      const repo=$("#lg_repo",d.el).value.trim().replace(/^https?:\/\/github\.com\//i,"").replace(/\.git$|\/$/g,""), token=$("#lg_tok",d.el).value.trim();
      const m=/^([\w.-]+)\/([\w.-]+)$/.exec(repo);
      const bad=(sel,t)=>{ $$(".ferr",d.el).forEach(x=>x.remove()); const i=$(sel,d.el); i.classList.add("bad"); i.closest(".fv").append(el(`<div class="ferr" role="alert">${esc(t)}</div>`)); i.focus(); return false; };
      if(!m) return bad("#lg_repo","Type it as username/repository, like hatheem-r/portfolio_sep_2026.");
      if(!token) return bad("#lg_tok","Paste your GitHub token.");
      try{ localStorage.setItem("cp_repo",JSON.stringify({owner:m[1],repo:m[2]})); }catch(e){}
      mem.set("cp_token",token,$("#lg_keep",d.el).checked);
      d.close(); connect(); return false;
    }});
}
async function connect(reloading){
  const r=detectRepo(), token=mem.get("cp_token");
  if(!token||!r.owner){ showLogin(); return; }
  Object.assign(S,{owner:r.owner,repo:r.repo,gh:GitHub(token,r.owner,r.repo)});
  $$(".modal").forEach(m=>m.remove());
  const box=progressBox(reloading?"Loading the latest version from GitHub…":"Connecting to GitHub…");
  try{
    await loadContent(); box.close();
    $("#main").hidden=false; S.liveMsg=""; route();
    if(!S.strict) msgbox("Heads up",`<p>Your <code>${CONTENT_PATH}</code> has hand-written parts, like comments, that the Control Panel can't keep.</p><p>The next publish saves it as plain data instead. Nothing visible on the site changes.</p>`,"info");
  }catch(e){
    box.close();
    if(e instanceof GHError&&e.status===401) mem.del("cp_token");
    $("#main").hidden=true; showLogin(explain(e,false));
  }
}

buildShell();
connect();
})();
