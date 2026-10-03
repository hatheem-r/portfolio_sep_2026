/* HatheemOS 98: window manager, pages, games, wallpaper, audio. Content lives in js/content.js. */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={get(k){try{return +localStorage.getItem(k)||0}catch(e){return 0}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- pixel helpers ---------- */
const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function dither(g,x0,y0,w,h,colors){
  const img=g.getImageData(x0,y0,w,h), d=img.data, c=colors.map(rgb), n=c.length-1;
  for(let y=0;y<h;y++){ const t=y/Math.max(1,h-1)*n, i=Math.min(n-1,Math.floor(t)), f=t-i;
    for(let x=0;x<w;x++){ const col=(f*16>BAYER[y&3][x&3])?c[i+1]:c[i], k=(y*w+x)*4; d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255; } }
  g.putImageData(img,x0,y0);
}
function sprite(g,rows,x,y,pal,outline){
  if(outline){ g.fillStyle=outline; for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]])
    rows.forEach((r,j)=>[...r].forEach((ch,i)=>{ if(pal[ch]) g.fillRect(x+i+ox,y+j+oy,1,1); })); }
  rows.forEach((r,j)=>[...r].forEach((ch,i)=>{ if(pal[ch]){ g.fillStyle=pal[ch]; g.fillRect(x+i,y+j,1,1);} }));
}
function rng(str){ let h=1779033703; for(const ch of str) h=Math.imul(h^ch.charCodeAt(0),3432918353), h=h<<13|h>>>19;
  return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return ((h^=h>>>16)>>>0)/4294967296; }; }

/* ---------- the man (you) ---------- */
const MAN={
  body:["...HHHHH....","..HHHHHHH...","..HSSSSSH...","..SSSESSS...","..SSSSSSS...","...SSSS.....","..TTTTTTT...",".TTTTTTTTT..",".S.TTTTT.S..","...TTTTT....","...PPPPP....","...PP.PP...."],
  legs:[["...PP..PP...","...KK..KK..."],["....PPP.....","....KKK....."],["..PP....PP..","..KK....KK.."]],
  pal:{H:"#1d1d1d",S:"#c58c5e",T:"#2bb3a3",P:"#2d3a7a",K:"#f2f2f2",E:"#111"}
};

/* ---------- icons (16×16) ---------- */
const ICONS={
  pc:["................","..XXXXXXXXXXXX..","..XWWWWWWWWWWX..","..XWBBBBBBBBWX..","..XWBCCBBBBBWX..","..XWBCBBBBBBWX..","..XWBBBBBBBBWX..","..XWBBBBBBBBWX..","..XWWWWWWWWWWX..","..XXXXXXXXXXXX..",".....XWWWWX.....","...XXXXXXXXXX...","..XWWWWWWWWWWX..","..XWGGWWWWWWWX..","..XXXXXXXXXXXX.."],
  folder:["................","................",".XXXXX..........","XyyyyyX.........","XyyyyyyXXXXXXXX.","XyyyyyyyyyyyyyX.","XXXXXXXXXXXXXXXX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XYYYYYYYYYYYYYYX","XOOOOOOOOOOOOOOX","XXXXXXXXXXXXXXXX"],
  journal:["................","..XXXXXXXXXXX...",".XXWWWWWWWWWX...","..XWBBBBBBWWX...",".XXWWWWWWWWWX...","..XWBBBBBWWWX...",".XXWWWWWWWWWX...","..XWBBBBBBBWX...",".XXWWWWWWWWWX...","..XWBBBBWWWWX...",".XXWWWWWWWWWX...","..XWWWWWWWRRX...",".XXWWWWWWWRRX...","..XXXXXXXXXXX..."],
  joystick:["................","......RRR.......",".....RRrRR......",".....RRRRR......","......RRR.......",".......X........",".......X........",".......X........","...XXXXXXXXX....","..XWWWWWWWWWX...",".XWWRWWWWWWWWX..",".XWRRRWWWWBBWX..",".XWWRWWWWWBBWX..",".XWWWWWWWWWWWX..","..XXXXXXXXXXX..."],
  medal:["...RRR....RRR...","...RRRR..RRRR...","....RRRRRRRR....",".....RRRRRR.....","......RRRR......",".....XXXXXX.....","....XYYYYYYX....","...XYYyyyyYYX...","...XYyyYYyyYX...","...XYyYYYYyYX...","...XYyyYYyyYX...","...XYYyyyyYYX...","....XYYYYYYX....",".....XXXXXX....."],
  trophy:["................","...XXXXXXXXXX...","XXXXyyyyyyyYXXXX","XY.XyyyyyyyYX.YX","XY.XyyyyyyyYX.YX",".XYXYyyyyyYYXYX.","..XXYYyyyYYYXX..","....XYYYYYYX....",".....XYYYYX.....","......XYYX......","......XYYX......",".....XYYYYX.....","....XXXXXXXX....","....XOOOOOOX....","....XXXXXXXX...."],
  mail:["................","................","................","XXXXXXXXXXXXXXXX","XWXWWWWWWWWWWXWX","XWWXWWWWWWWWXWWX","XWWWXWWWWWWXWWWX","XWWWWXWWWWXWWWWX","XWWWWWXRRXWWWWWX","XWWWWXWRRWXWWWWX","XWWWXWWWWWWXWWWX","XWWXWWWWWWWWXWWX","XXXXXXXXXXXXXXXX"],
  doc:["..XXXXXXXXX.....","..XWWWWWWWXX....","..XWWWWWWWXWX...","..XWBBBBBWXXXX..","..XWWWWWWWWWWX..","..XWBBBBBBBBWX..","..XWWWWWWWWWWX..","..XWBBBBBBBWWX..","..XWWWWWWWWWWX..","..XWBBBBBBBBWX..","..XWWWWWWWWWWX..","..XWBBBBBWWWWX..","..XWWWWWWWWWWX..","..XXXXXXXXXXXX.."],
  snake:["XXXXXXXXXXXXXXXX","XLLLLLLLLLLLLLLX","XLDDDDDDLLLLLLLX","XLLLLLLDLLLLLLLX","XLLLLLLDLLLLLLLX","XLLLLLLDDDDDLLLX","XLLLLLLLLLLDLLLX","XLLLLLLLLLLDLLLX","XLLDLLLLLLLDLLLX","XLLLLLLLLLLDLLLX","XLLLLLLDDDDDLLLX","XLLLLLLLLLLLLLLX","XXXXXXXXXXXXXXXX"],
  mine:["................",".......X........","...X...X...X....","....XXXXXXX.....","...XXWWXXXXXX...","...XWWXXXXXXX...",".XXXXXXXXXXXXXX.","...XXXXXXXXXX...","...XXXXXXXXXX...","....XXXXXXXX....","...X...X...X....",".......X........"],
  flag:["................","................",".....RRRX.......","...RRRRRX.......","..RRRRRRX.......","...RRRRRX.......",".....RRRX.......","........X.......","........X.......","........X.......","......XXXX......","....XXXXXXXX...."],
  branch:["................","..XXXX....XXXX..","..XCCX....XCCX..","..XCCX....XCCX..","..XXXX....XXXX..","...XX......XX...","...XX.....XX....","...XX....XX.....","...XX...XX......","...XX..XX.......","...XXXXX........","...XX...........","..XXXX..........","..XCCX..........","..XCCX..........","..XXXX.........."],
  card:["................","................","XXXXXXXXXXXXXXXX","XWWWWWWWWWWWWWWX","XWHHHWWWWWWWWWWX","XWSSSWXXXXXXXWWX","XWSESWWWWWWWWWWX","XWTTTWXXXXXWWWWX","XWTTTWWWWWWWWWWX","XWWWWWXXXXXXXWWX","XWWWWWWWWWWWWWWX","XXXXXXXXXXXXXXXX"],
  save:["XXXXXXXXXXXXXX..","XBBXWWWWWWXBBX..","XBBXWWWWWWXBBX..","XBBXWWWWWWXBBX..","XBBXXXXXXXXBBX..","XBBBBBBBBBBBBX..","XBBBBBBBBBBBBX..","XBBXXXXXXXXBBX..","XBBXWWWWWWXBBX..","XBBXWBBBBWXBBX..","XBBXWWWWWWXBBX..","XXXXXXXXXXXXXX.."],
  speaker:["................",".......X........","......XX........",".....XWX........","XXXXXWWX..B.....","XWWWXWWX...B....","XWWWXWWX.B..B...","XWWWXWWX..B.B...","XWWWXWWX.B..B...","XWWWXWWX...B....","XXXXXWWX..B.....",".....XWX........","......XX........",".......X........"],
  speakeroff:["................",".......X........","......XX........",".....XWX........","XXXXXWWX........","XWWWXWWX.R...R..","XWWWXWWX..R.R...","XWWWXWWX...R....","XWWWXWWX..R.R...","XWWWXWWX.R...R..","XXXXXWWX........",".....XWX........","......XX........",".......X........"],
  picture:["................","XXXXXXXXXXXXXXXX","XCCCCCCCCCCCCCCX","XCCCCCCCCCYYCCCX","XCCCCCCCCCYYCCCX","XCCCCCCCCCCCCCCX","XCCCCGCCCCCCCCCX","XCCCGGGCCCCCCCCX","XCCGGGGGCCCGCCCX","XCGGGGGGGCGGGCCX","XGGGGGGGGGGGGGGX","XGGGGGGGGGGGGGGX","XXXXXXXXXXXXXXXX"]
};
const IPAL={X:"#1a1a1a",W:"#e6e6e6",B:"#2a62c9",C:"#8fd3ff",G:"#33aa44",y:"#ffe79a",Y:"#f2c94c",O:"#8b5a2b",R:"#d23b3b",r:"#ff8a8a",L:"#c7f0d8",D:"#43523d",S:"#c58c5e",T:"#2bb3a3",H:"#1d1d1d",E:"#111"};
const METAL={1:{y:"#fff0a0",Y:"#f2c94c"},2:{y:"#ffffff",Y:"#aab4be"},3:{y:"#f3c08a",Y:"#c27c3e"}};
function icon(name,over){ const c=document.createElement("canvas"); c.width=c.height=16;
  if(name==="runner"){ sprite(c.getContext("2d"),MAN.body.concat(MAN.legs[2]),2,1,MAN.pal); return c; }
  sprite(c.getContext("2d"),ICONS[name],0,0,{...IPAL,...over}); return c; }
const iconURL=n=>icon(n).toDataURL();
function avatar(){ const c=document.createElement("canvas"); c.width=c.height=32; const g=c.getContext("2d");
  dither(g,0,0,32,26,["#3d1a5e","#c2477a","#f0795a","#ffd77a"]);
  g.fillStyle="#fff1a8"; g.fillRect(20,12,6,6); g.fillRect(19,13,8,4);
  g.fillStyle="#2a173f"; g.fillRect(0,26,32,6); g.fillStyle="#f9b45a"; g.fillRect(0,26,32,1);
  sprite(g,MAN.body.concat(MAN.legs[1]),9,12,MAN.pal,"#1a0d2b"); return c; }

function portrait(cls){
  if(CONTENT.photo){ const i=document.createElement("img"); i.src=CONTENT.photo; i.alt="Photo of "+CONTENT.name; i.className="photo"+(cls?" "+cls:""); return i; }
  const c=avatar(); if(cls) c.classList.add(cls); return c; }
function cvButtons(){
  const f=CONTENT.cv?.file, sub=f?(CONTENT.cv.updated?"updated "+CONTENT.cv.updated:f.split("/").pop()):"not added yet";
  const dlInner=`<span data-icon="save"></span><span class="dlt">Download CV<small>${esc(sub)}</small></span><span class="dla" aria-hidden="true">▼</span>`;
  return `<div class="cvbtns">
    <button class="cvview" data-open="cv"><span data-icon="doc"></span><span><b>Read my CV</b><small>opens in a window</small></span></button>
    ${f?`<a class="cvdl" href="${esc(f)}" download>${dlInner}</a>`:`<button class="cvdl" data-open="cv">${dlInner}</button>`}
  </div>`;
}

/* ---------- project thumbnails / image placeholders ---------- */
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
/* cover pool: projects without "thumb" or "cover" get one from here, without repeating while unused ones remain */
const COVERS=["chart","graph","browser","wave","film","terminal","neural","database","city","chat","circuit","globe","rocket"];
let coverMap=null;
function coverFor(p){
  if(!coverMap){ coverMap={}; const used=new Set(CONTENT.projects.filter(x=>x.thumb).map(x=>x.thumb));
    CONTENT.projects.forEach(x=>{ if(x.thumb){ coverMap[x.id]=x.thumb; return; }
      const free=COVERS.filter(c=>!used.has(c)), pool=free.length?free:COVERS, pick=pool[Math.floor(rng(x.id)()*pool.length)];
      coverMap[x.id]=pick; used.add(pick); }); }
  return coverMap[p.id]||"chart"; }
function coverEl(p,w,h){ if(p.cover){ const i=document.createElement("img"); i.src=p.cover; i.alt=""; i.className="thumb"; return i; } return thumb(coverFor(p),p.title,w,h); }
function certArt(seed){ // stand-in until a real certificate image is added (A4 landscape ratio)
  const c=document.createElement("canvas"); c.width=141; c.height=100; const g=c.getContext("2d"), r=rng(seed);
  g.fillStyle="#fff8e1"; g.fillRect(0,0,141,100); g.fillStyle="#c9971f"; g.fillRect(4,4,133,2); g.fillRect(4,94,133,2); g.fillRect(4,4,2,92); g.fillRect(135,4,2,92);
  g.fillStyle="#e4cf8e"; g.fillRect(8,8,125,1); g.fillRect(8,91,125,1); g.fillRect(8,8,1,84); g.fillRect(132,8,1,84);
  g.fillStyle="#3d2a00"; g.font="bold 10px monospace"; g.textAlign="center"; g.fillText("CERTIFICATE",70,24);
  g.fillStyle="#8a7a55"; g.font="6px monospace"; g.fillText("of completion",70,32);
  g.fillStyle="#2a62c9"; g.fillRect(36,44,69,2); g.fillStyle="#b9ad8c"; g.fillRect(28,53,85,1); g.fillRect(40,58,61,1);
  g.fillStyle="#3d2a00"; for(let x=18;x<52;x++) g.fillRect(x,Math.round(80+Math.sin(x*.6+r()*2)*2),1,1); g.fillStyle="#b9ad8c"; g.fillRect(16,84,40,1);
  g.fillStyle="#d23b3b"; g.fillRect(108,86,3,8); g.fillRect(115,86,3,8);
  g.beginPath(); g.arc(113,78,9,0,7); g.fill(); g.fillStyle="#ffd23f"; g.beginPath(); g.arc(113,78,5,0,7); g.fill();
  g.fillStyle="rgba(0,0,0,.55)"; g.fillRect(0,62,141,10); g.fillStyle="#fff"; g.font="7px monospace"; g.fillText("ADD CERTIFICATE IMAGE",70,69);
  return c; }
function placeholder(seed){
  const c=document.createElement("canvas"); c.width=80; c.height=50; const g=c.getContext("2d"), r=rng(seed);
  dither(g,0,0,80,32,[["#3d1a5e","#c2477a","#f9b45a"],["#1d3b6e","#4f86c6","#bfe3ff"],["#2a1450","#7a3274","#ff9a6a"]][Math.floor(r()*3)]);
  const ph=r()*6; g.fillStyle="#2b5a3a"; for(let x=0;x<80;x++){ const h=Math.round(8+5*Math.sin(x*.09+ph)+3*Math.sin(x*.23)); g.fillRect(x,38-h,1,h+12); }
  g.fillStyle="#1a3a26"; g.fillRect(0,40,80,10);
  g.fillStyle="rgba(0,0,0,.55)"; g.fillRect(0,19,80,12); g.fillStyle="#fff"; g.font="9px monospace"; g.textAlign="center"; g.fillText("ADD PHOTO",40,28);
  return c;
}
function mediaEl(img,seed){ if(img&&img.src){ const i=document.createElement("img"); i.src=img.src; i.alt=img.caption||""; i.loading="lazy"; return i; } return placeholder(seed); }

/* ===================================================================== WINDOW MANAGER */
const desk=$("#desk"), tabs=$("#tabs");
const WM={wins:new Map(),active:null,z:10,count:0};
const mobile=()=>innerWidth<700;
const deskSize=()=>({w:desk.clientWidth,h:desk.clientHeight});

const APPS={
  home:{title:"Home",file:"home.exe",icon:"pc",w:740,h:540,render:renderHome,status:"Welcome",fit:true},
  projects:{title:"Projects",file:"C:\\PROJECTS",icon:"folder",w:780,h:540,render:renderProjects,tool:"C:\\PROJECTS"},
  journal:{title:"Journal",file:"journal",icon:"journal",w:640,h:500,render:renderJournal,tool:"C:\\MY DOCUMENTS\\JOURNAL"},
  games:{title:"Games",file:"C:\\GAMES",icon:"joystick",w:620,h:360,render:renderGames,tool:"C:\\GAMES"},
  awards:{title:"Accomplishments",file:"Certificates",icon:"medal",w:740,h:560,render:renderAwards},
  competitions:{title:"Competitions",file:"competitions.xls",icon:"trophy",w:680,h:520,render:renderComps},
  contact:{title:"Contact",file:"Address Book",icon:"mail",w:520,h:420,render:renderContact},
  cv:{title:"Curriculum Vitae",file:"cv.pdf",icon:"doc",w:720,h:620,render:renderCV,flush:true},
  "game-runner":{title:"404 Runner",file:"runner.exe",icon:"runner",w:660,h:330,render:gameRunner,flush:true,status:"Space / ↑ / tap to jump"},
  "game-snake":{title:"Snake",file:"snake.exe",icon:"snake",w:380,h:560,render:gameSnake,flush:true,status:"Arrows / WASD / swipe"},
  "game-mines":{title:"Minesweeper",file:"winmine.exe",icon:"mine",w:300,h:420,render:gameMines,flush:true,status:"Right-click or long-press to flag · F2 new game"}
};
const DESKTOP=["home","projects","journal","games","awards","competitions","contact"];

function resolve(key){
  if(APPS[key]) return APPS[key];
  if(key.startsWith("project-")){ const p=CONTENT.projects.find(x=>x.id===key.slice(8)); if(p) return {title:p.title,file:p.id+".exe",icon:"doc",w:740,h:560,render:(b,w)=>renderProject(b,w,p),tool:"C:\\PROJECTS\\"+p.title.toUpperCase()}; }
  if(key.startsWith("post-")){ const j=CONTENT.journal.find(x=>x.id===key.slice(5)); if(j) return {title:j.title,file:j.id+".doc",icon:"doc",w:640,h:560,render:(b,w)=>renderPost(b,w,j),wp:true}; }
  return null;
}

function openWin(key,spec){
  if(WM.wins.has(key)){ const w=WM.wins.get(key); restore(w); focus(w); return w; }
  spec=spec||resolve(key); if(!spec) return null;
  const el=document.createElement("section"); el.className="win out"; el.setAttribute("role","dialog"); el.setAttribute("aria-label",spec.title);
  el.innerHTML=`<div class="bar"><span class="bi"></span><h1></h1>
    <button class="btn out ctl" data-act="min" aria-label="Minimise" title="Minimise">_</button>
    <button class="btn out ctl" data-act="max" aria-label="Maximise" title="Maximise">□</button>
    <button class="btn out ctl" data-act="close" aria-label="Close" title="Close">×</button></div>
    <div class="menu"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span></div>
    ${spec.tool?`<div class="tool"><span>Address</span><div class="addr in">${esc(spec.tool)}</div></div>`:""}
    ${spec.wp?`<div class="wp"><span class="fake in">Georgia</span><span class="fake in" style="min-width:44px">12</span><b class="out">B</b><i class="out">I</i><u class="out">U</u></div>`:""}
    <div class="wbody in${spec.flush?" flush":""}" tabindex="-1"></div>
    <div class="status"><div class="st"></div><div class="grip"></div></div>
    <div class="rz rz-e" data-rz="e"></div><div class="rz rz-s" data-rz="s"></div><div class="rz rz-se" data-rz="se"></div>`;
  $(".bi",el).appendChild(icon(spec.icon)); $("h1",el).textContent=spec.title+" - "+spec.file;
  const w={key,el,spec,min:false,max:false,api:{},body:$(".wbody",el)};
  const ds=deskSize(), n=WM.count++%7;
  const wd=Math.min(spec.w,ds.w-16), ht=Math.min(spec.h,ds.h-16);
  w.rect={l:Math.max(0,Math.min(110+n*28,ds.w-wd)),t:Math.max(0,Math.min(14+n*26,ds.h-ht)),w:wd,h:ht};
  apply(w,w.rect); desk.appendChild(el); WM.wins.set(key,w);
  const tb=document.createElement("button"); tb.className="btn out"; tb.appendChild(icon(spec.icon));
  tb.insertAdjacentHTML("beforeend",`<span>${esc(spec.title)}</span>`); tb.title=spec.title;
  tb.onclick=()=>{ if(WM.active===w&&!w.min) minimize(w); else { restore(w); focus(w); } };
  tabs.appendChild(tb); w.tb=tb;
  setStatus(w,spec.status||"Ready");
  w.api=spec.render(w.body,w)||{};
  if(mobile()) setMax(w,true);
  wire(w); focus(w);
  if(spec.fit){ fitHeight(w); document.fonts?.ready.then(()=>fitHeight(w)); $$("img",w.body).forEach(i=>i.addEventListener("load",()=>fitHeight(w))); }
  hintUpdate();
  return w;
}
function fitHeight(w){ // size the window to its content, no scrollbar, capped by the screen
  if(w.userSized||w.max||mobile()||!WM.wins.has(w.key)) return;
  const ds=deskSize(), chrome=w.el.offsetHeight-w.body.clientHeight;
  w.rect.h=Math.min(w.body.scrollHeight+chrome+2,ds.h-16); w.rect.t=Math.max(0,Math.min(w.rect.t,ds.h-w.rect.h)); apply(w,w.rect); }
let hintT; function hintUpdate(){ const any=[...WM.wins.values()].some(o=>!o.min), h=$("#hint"); clearTimeout(hintT);
  if(any) h.classList.remove("show"); else hintT=setTimeout(()=>h.classList.add("show"),5000); }
function apply(w,r){ Object.assign(w.el.style,{left:r.l+"px",top:r.t+"px",width:r.w+"px",height:r.h+"px"}); }
function setStatus(w,t){ $(".st",w.el).textContent=t; }
function focus(w){
  if(!w||w.min) return;
  WM.active=w; w.el.style.zIndex=++WM.z;
  if(!w.el.contains(document.activeElement)) (w.api?.focusEl||w.body).focus({preventScroll:true});
  WM.wins.forEach(o=>{ o.el.classList.toggle("inactive",o!==w); o.tb.setAttribute("aria-pressed",o===w); });
  try{ if(location.hash.slice(1)!==w.key) history.replaceState(null,"","#"+w.key); }catch(e){}
}
function topVisible(){ let best=null; WM.wins.forEach(o=>{ if(!o.min&&(!best||+o.el.style.zIndex>+best.el.style.zIndex)) best=o; }); return best; }
function refocus(){ const t=topVisible(); if(t) focus(t); else { WM.active=null; WM.wins.forEach(o=>{ o.tb.setAttribute("aria-pressed",false); o.el.classList.add("inactive"); }); } }
function minimize(w){ w.min=true; w.el.hidden=true; if(WM.active===w) refocus(); else w.tb.setAttribute("aria-pressed",false); hintUpdate(); }
function restore(w){ if(!w.min) return; w.min=false; w.el.hidden=false; hintUpdate(); }
function setMax(w,on){
  w.max=on; w.el.classList.toggle("max",on);
  const b=$('[data-act="max"]',w.el); b.textContent=on?"❐":"□"; b.setAttribute("aria-label",on?"Restore":"Maximise"); b.title=on?"Restore":"Maximise";
  if(on){ const ds=deskSize(); apply(w,{l:0,t:0,w:ds.w,h:ds.h}); } else apply(w,w.rect);
}
function closeWin(w){
  w.api.destroy?.(); w.el.remove(); w.tb.remove(); WM.wins.delete(w.key); hintUpdate();
  if(WM.active===w){ WM.active=null; refocus(); if(!WM.active){ try{history.replaceState(null,"",location.pathname+location.search)}catch(e){} } }
}
function drag(handle,e,onMove){
  handle.setPointerCapture(e.pointerId);
  const mv=ev=>onMove(ev), up=()=>{ handle.removeEventListener("pointermove",mv); handle.removeEventListener("pointerup",up); handle.removeEventListener("pointercancel",up); };
  handle.addEventListener("pointermove",mv); handle.addEventListener("pointerup",up); handle.addEventListener("pointercancel",up);
}
function wire(w){
  const el=w.el, bar=$(".bar",el);
  el.addEventListener("pointerdown",()=>{ if(WM.active!==w) focus(w); },true);
  $$("[data-act]",el).forEach(b=>b.addEventListener("click",e=>{ e.stopPropagation(); const a=b.dataset.act;
    if(a==="min") minimize(w); else if(a==="max"){ if(!mobile()) setMax(w,!w.max); } else closeWin(w); }));
  bar.addEventListener("dblclick",e=>{ if(!e.target.closest("button")&&!mobile()) setMax(w,!w.max); });
  bar.addEventListener("pointerdown",e=>{
    if(e.target.closest("button")||w.max||mobile()||e.button!==0) return;
    const sx=e.clientX, sy=e.clientY, r={...w.rect}, ds=deskSize();
    drag(bar,e,ev=>{ w.rect.l=Math.min(ds.w-60,Math.max(60-r.w,r.l+ev.clientX-sx)); w.rect.t=Math.min(ds.h-26,Math.max(0,r.t+ev.clientY-sy)); apply(w,w.rect); });
  });
  $$(".rz",el).forEach(h=>h.addEventListener("pointerdown",e=>{
    if(w.max||mobile()) return; e.preventDefault(); e.stopPropagation(); focus(w);
    const d=h.dataset.rz, sx=e.clientX, sy=e.clientY, r={...w.rect}, ds=deskSize();
    w.userSized=true;
    drag(h,e,ev=>{ if(d.includes("e")) w.rect.w=Math.max(240,Math.min(ds.w-r.l,r.w+ev.clientX-sx));
                   if(d.includes("s")) w.rect.h=Math.max(170,Math.min(ds.h-r.t,r.h+ev.clientY-sy)); apply(w,w.rect); });
  }));
}
WM.fit=(w,wd,ht)=>{ if(w.max||mobile()) return; const ds=deskSize();
  w.rect.w=Math.min(wd,ds.w); w.rect.h=Math.min(ht,ds.h); w.rect.l=Math.max(0,Math.min(w.rect.l,ds.w-w.rect.w)); w.rect.t=Math.max(0,Math.min(w.rect.t,ds.h-w.rect.h)); apply(w,w.rect); };
let rzT; addEventListener("resize",()=>{ clearTimeout(rzT); rzT=setTimeout(()=>{ const ds=deskSize();
  WM.wins.forEach(w=>{ if(mobile()||w.max) setMax(w,true);
    else { w.rect.w=Math.min(w.rect.w,ds.w); w.rect.h=Math.min(w.rect.h,ds.h); w.rect.l=Math.max(0,Math.min(w.rect.l,ds.w-w.rect.w)); w.rect.t=Math.max(0,Math.min(w.rect.t,ds.h-w.rect.h)); apply(w,w.rect); } }); },120); });
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!$("#startmenu").hidden){ toggleStart(false); return; }
  const w=WM.active; if(w&&!w.min&&w.api.onKey) w.api.onKey(e);
});
document.addEventListener("click",e=>{ const o=e.target.closest("[data-open]"); if(o){ e.preventDefault(); openWin(o.dataset.open); } });
addEventListener("hashchange",()=>{ const k=location.hash.slice(1); if(k&&(!WM.active||WM.active.key!==k)) openWin(k); });

/* desktop icons + start menu */
DESKTOP.forEach(k=>{ const a=APPS[k], b=document.createElement("button"); b.className="ico"; b.dataset.open=k;
  b.appendChild(icon(a.icon)); b.insertAdjacentHTML("beforeend",`<span>${esc(a.title)}</span>`); $("#icons").appendChild(b);
  const li=document.createElement("li"), sb=document.createElement("button"); sb.dataset.open=k; sb.setAttribute("role","menuitem");
  sb.appendChild(icon(a.icon)); sb.insertAdjacentHTML("beforeend",esc(a.title)); li.appendChild(sb); $("#startlist").appendChild(li); });
$("#startlist").insertAdjacentHTML("beforeend",`<li><hr></li><li><button id="shutbtn" role="menuitem">⏻&nbsp; Shut Down…</button></li>`);
function toggleStart(on){ const m=$("#startmenu"); on=on??m.hidden; m.hidden=!on; $("#startbtn").setAttribute("aria-expanded",on); $("#startbtn").setAttribute("aria-pressed",on); }
$("#startbtn").onclick=e=>{ e.stopPropagation(); toggleStart(); };
document.addEventListener("pointerdown",e=>{ if(!e.target.closest("#startmenu,#startbtn")) toggleStart(false); });
$("#startlist").addEventListener("click",e=>{ if(e.target.closest("button")) toggleStart(false); });
$("#shutbtn").onclick=()=>{ $("#shutdown").hidden=false; };
$("#shutdown").onclick=()=>{ $("#shutdown").hidden=true; };
/* background audio: volume is set in CONTENT.music.volume; visitors can only mute/unmute (remembered per visitor).
   Starts on the first click anywhere, because browsers block autoplay. */
(function(){
  const M=CONTENT.music||{}, a=$("#bgm"), btn=$("#volbtn");
  let muted=false; try{ muted=localStorage.getItem("bgm_mute")==="1"; }catch(e){}
  if(M.src) a.src=M.src;
  a.volume=Math.max(0,Math.min(1,M.volume??.3));
  const paint=()=>{ btn.innerHTML=""; btn.appendChild(icon(muted||!M.src?"speakeroff":"speaker"));
    btn.title=!M.src?"No sound set":muted?"Unmute":"Mute"; btn.setAttribute("aria-label",btn.title); btn.setAttribute("aria-pressed",muted); };
  const play=()=>{ if(M.src&&!muted&&a.paused) a.play().catch(()=>{}); };
  a.muted=muted; paint();
  document.addEventListener("pointerdown",function first(){ play(); document.removeEventListener("pointerdown",first,true); },true);
  btn.addEventListener("click",e=>{ e.stopPropagation(); if(!M.src) return; muted=!muted; a.muted=muted;
    try{ localStorage.setItem("bgm_mute",muted?"1":"0"); }catch(_){} paint(); play(); });
})();
function tick(){ $("#clock").textContent=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}); } tick(); setInterval(tick,20000);

/* ===================================================================== PAGES */
function hydrate(b){ $$("[data-icon]",b).forEach(s=>{ const m=s.dataset.metal; s.replaceWith(icon(s.dataset.icon,m?METAL[m]:undefined)); }); }

function renderHome(b){
  const C=CONTENT;
  b.innerHTML=`<div class="stack">
  <div class="marquee" aria-label="News ticker"><span>${esc(C.ticker)}</span></div>
  <div class="hero">
    <div class="stack" style="gap:12px">
      <div><p class="eyebrow">C:\\USERS\\${esc(C.handle.toUpperCase())}&gt; whoami</p>
      <h2 class="wordart">${esc(C.name)}</h2></div>
      <p><b>${esc(C.role)}</b><br>${esc(C.about)}</p>
      <dl class="facts">${C.facts.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
      <div class="socials">${[["GitHub",C.contact.github,"branch"],["LinkedIn",C.contact.linkedin,"card"]].filter(x=>x[1])
        .map(([t,u,ic])=>`<a class="btn out soc" href="${esc(u)}" target="_blank" rel="noopener" aria-label="${t} (opens in a new tab)"><span data-icon="${ic}"></span><span><b>${t}</b><small>${esc(u.replace(/^https?:\/\/(www\.)?/,""))}</small></span></a>`).join("")}</div>
    </div>
    <div class="side"><figure class="avatar out"><span data-avatar></span><figcaption>me.bmp</figcaption></figure>${cvButtons()}</div>
  </div>
  <div class="badges">${C.badges.map(x=>`<div class="b88" style="background:${esc(x.bg)};color:${esc(x.fg)}">${esc(x.top)}<b>${esc(x.big)}</b></div>`).join("")}</div>
  <div class="uc"><span>🚧 UNDER CONSTRUCTION · new stuff added all the time</span></div></div>`;
  $("[data-avatar]",b).replaceWith(portrait()); hydrate(b);
}

function renderProjects(b,w){
  const P=CONTENT.projects;
  b.innerHTML=`<div class="grid">${P.map(p=>`
    <button class="card out" data-open="project-${esc(p.id)}">
      <span class="cbar">${esc(p.id)}.exe</span>
      <span class="tframe in" data-thumb="${esc(p.id)}"></span>
      <span class="cbody">
        <span class="meta">${esc([p.kind,p.year].filter(Boolean).join(" · "))}</span>
        <h3>${esc(p.title)}</h3>
        <span>${esc(p.blurb)}</span>
        <span class="tags">${p.stack.slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</span>
        <span class="cta">Open ▸</span>
      </span>
    </button>`).join("")}</div>`;
  $$("[data-thumb]",b).forEach(s=>{ const p=P.find(x=>x.id===s.dataset.thumb); s.appendChild(coverEl(p)); });
  setStatus(w,P.length+" object(s)");
}

function renderProject(b,w,p){
  const L=p.links||{}, linkBtns=[["repo","Source code"],["demo","Live demo"],["paper","Paper"]].filter(([k])=>L[k])
    .map(([k,t])=>`<a class="btn out" href="${esc(L[k])}" target="_blank" rel="noopener">${t} ↗</a>`).join("");
  const info=[["Type",p.kind],["Year",p.year],...(p.info||[])].filter(([,v])=>v);
  b.innerHTML=`<div class="stack">
    <div class="phead">
      <div class="in" style="padding:2px" data-hero></div>
      <div class="stack" style="gap:10px">
        <div><p class="eyebrow">${esc([p.kind,p.year].filter(Boolean).join(" · "))}</p><h2 class="ph">${esc(p.title)}</h2></div>
        <p class="lede">${esc(p.summary||p.blurb)}</p>
        <div class="tags">${p.stack.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
        ${linkBtns?`<div class="links">${linkBtns}</div>`:""}
      </div>
    </div>
    <div class="pgrid">
      <div class="prose">
        <h3>About this project</h3>
        ${(p.description||[]).map(t=>`<p>${esc(t)}</p>`).join("")}
        ${p.highlights?.length?`<h3 style="margin-top:6px">Highlights</h3><ul>${p.highlights.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`:""}
      </div>
      <aside class="props out"><h3>Properties</h3><dl>${info.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></aside>
    </div>
    ${p.images?.length?`<div class="stack" style="gap:10px"><h3>Screenshots</h3><div class="gallery">${p.images.map((im,k)=>`
      <figure><button class="in" data-view="${k}" aria-label="Open image: ${esc(im.caption)}"></button><figcaption>${esc(im.caption)}</figcaption></figure>`).join("")}</div></div>`:""}
  </div>`;
  $("[data-hero]",b).appendChild(coverEl(p,128,72));
  $$("[data-view]",b).forEach(btn=>{ const k=+btn.dataset.view, im=p.images[k]; btn.appendChild(mediaEl(im,p.id+k));
    btn.onclick=()=>openWin(`img-${p.id}-${k}`,{title:im.caption||"Image",file:"Imaging",icon:"picture",w:620,h:460,flush:true,status:p.title,
      render:vb=>{ vb.innerHTML=`<div class="viewer"></div>`; $(".viewer",vb).appendChild(mediaEl(im,p.id+k)); }}); });
  setStatus(w,(p.images?.length||0)+" image(s) · "+p.stack.length+" tools");
}

function renderJournal(b,w){
  const J=CONTENT.journal;
  b.innerHTML=`<div class="stack"><div><p class="eyebrow">${J.length} entr${J.length===1?"y":"ies"}</p><h2 class="ph">Journal</h2></div>
    <div class="jlist"><div class="jhead"><span>Date</span><span>Story</span><span>Tag</span></div>
    ${J.map(j=>`<button class="jrow" data-open="post-${esc(j.id)}"><span class="d">${esc(j.date)}</span>
      <span><b>${esc(j.title)}</b><small>${esc((j.body[0]||"").slice(0,110))}${(j.body[0]||"").length>110?"…":""}</small></span>
      <span class="chip">${esc(j.tag)}</span></button>`).join("")}</div></div>`;
  setStatus(w,J.length+" document(s)");
}
function renderPost(b,w,j){
  b.innerHTML=`<article class="paper">
    ${j.draft?`<p class="draft">DRAFT · rewrite in your own words</p>`:""}
    <p class="meta">${esc(j.date)} · ${esc(j.tag)}</p>
    <h2>${esc(j.title)}</h2>
    ${j.body.map(t=>`<p>${esc(t)}</p>`).join("")}
    ${(j.images||[]).map((im,k)=>`<figure data-fig="${k}"><figcaption>${esc(im.caption)}</figcaption></figure>`).join("")}
  </article>`;
  $$("[data-fig]",b).forEach(f=>f.prepend(mediaEl(j.images[+f.dataset.fig],j.id+f.dataset.fig)));
  const words=j.body.join(" ").split(/\s+/).length; setStatus(w,words+" words · about "+Math.max(1,Math.round(words/200))+" min read");
}

function renderGames(b,w){
  const best={runner:store.get("hr_hi"),snake:store.get("hs_hi"),mines:store.get("hm_best_beginner")};
  b.innerHTML=`<div class="gtiles">
    ${[["game-runner","runner","404 Runner","Jump over coffee, bugs and 404s.",best.runner?"HI "+best.runner:"no score yet"],
       ["game-snake","snake","Snake","Classic phone snake. Eat, grow, don't bite yourself.",best.snake?"HI "+best.snake:"no score yet"],
       ["game-mines","mine","Minesweeper","Clear the field without hitting a mine.",best.mines?"Best "+best.mines+"s (Beginner)":"no time yet"]]
     .map(([k,ic,t,d,s])=>`<button class="gtile out" data-open="${k}"><span data-icon="${ic}"></span><b>${t}</b><small>${d}</small><span class="hi">${s}</span></button>`).join("")}
  </div>`;
  hydrate(b); setStatus(w,"3 object(s)");
}

function renderAwards(b,w){
  const C=CONTENT.certificates||[], M=CONTENT.accomplishments||[];
  b.innerHTML=`<div class="stack"><div><p class="eyebrow">C:\\MY DOCUMENTS\\CERTIFICATES</p><h2 class="ph">Certificates</h2></div>
    <div class="certgal">${C.map((c,i)=>`<figure class="ccard out"><div class="mat in" data-cert="${i}"></div>
      <figcaption class="ccap"><b>${esc(c.course)}</b><small>${esc([c.issuer,c.date].filter(Boolean).join(" · "))}</small></figcaption></figure>`).join("")}</div>
    ${M.length?`<div class="stack" style="gap:8px"><h3>Milestones</h3><ul class="miles">${M.map(a=>`<li><span data-icon="medal"></span><span class="yr">${esc(a.year)}</span><span><b>${esc(a.title)}</b> <small>${esc([a.org,a.note].filter(Boolean).join(" · "))}</small></span></li>`).join("")}</ul></div>`:""}
  </div>`;
  $$("[data-cert]",b).forEach(m=>{ const c=C[+m.dataset.cert];
    if(c.image){ const i=document.createElement("img"); i.src=c.image; i.alt="Certificate: "+c.course; i.loading="lazy"; m.appendChild(i); } else m.appendChild(certArt(c.course+m.dataset.cert)); });
  hydrate(b); setStatus(w,C.length+" certificate(s)"+(M.length?" · "+M.length+" milestones":""));
}
function renderComps(b,w){
  const cls=n=>n===1?"m1":n===2?"m2":n===3?"m3":"mx", lab=n=>n===1?"1st":n===2?"2nd":n===3?"3rd":"—";
  const won=CONTENT.competitions.filter(c=>c.place>=1&&c.place<=3);
  b.innerHTML=`<div class="stack"><div><p class="eyebrow">competitions.xls</p><h2 class="ph">Competitions</h2></div>
  ${won.length?`<div class="shelf in" aria-label="Trophy shelf"><div class="trophies">${won.map(c=>`
    <div class="trophy"><span data-icon="trophy" data-metal="${c.place}"></span><div class="plaque">${esc(c.name)}<br>${esc(c.result)}</div></div>`).join("")}</div><div class="board"></div></div>`:""}
  <div class="tablewrap"><table><thead><tr><th>Year</th><th>Competition</th><th>Track</th><th>Place</th><th>Result</th></tr></thead><tbody>
  ${CONTENT.competitions.map(c=>`<tr><td class="yr">${esc(c.year)}</td><td><b>${esc(c.name)}</b></td><td>${esc(c.type)}</td><td><span class="medal ${cls(c.place)}">${lab(c.place)}</span></td><td>${esc(c.result)}</td></tr>`).join("")}
  </tbody></table></div></div>`;
  hydrate(b); setStatus(w,CONTENT.competitions.length+" entries");
}
function renderContact(b,w){
  const c=CONTENT.contact;
  const rows=[["Email",c.email,null],["GitHub",c.github,c.github],["LinkedIn",c.linkedin,c.linkedin],["Location",c.location,null]].filter(r=>r[1]);
  b.innerHTML=`<div class="stack">
    <div class="vcard"><div class="out" style="padding:3px;width:max-content" data-av></div>
      <div><p class="eyebrow">Address Book · 1 contact</p><h2 class="ph">${esc(CONTENT.name)}</h2><p>${esc(CONTENT.role)}</p>
        <div class="fields">${rows.map(([k,v,href],i)=>`<div class="field"><label for="cf${i}">${k}</label>
          <div class="val in" id="cf${i}" tabindex="0">${esc(v.replace(/^https?:\/\//,""))}</div>
          ${href?`<a class="btn out" href="${esc(href)}" target="_blank" rel="noopener">Open ↗</a>`:(k==="Email"?`<button class="btn out" data-copy="${esc(v)}">Copy</button>`:"<span></span>")}</div>`).join("")}</div>
      </div></div>
    <div class="stack" style="gap:8px"><h3>Curriculum Vitae</h3>${cvButtons()}</div></div>`;
  $("[data-av]",b).appendChild(portrait("small")); hydrate(b);
  $$("[data-copy]",b).forEach(btn=>btn.onclick=()=>{ const v=btn.dataset.copy, val=btn.previousElementSibling;
    const sel=()=>{ const r=document.createRange(); r.selectNodeContents(val); const s=getSelection(); s.removeAllRanges(); s.addRange(r); setStatus(w,"Selected. Press Ctrl+C to copy."); };
    try{ navigator.clipboard.writeText(v).then(()=>setStatus(w,"Copied "+v),sel); }catch(e){ sel(); } });
}

function renderCV(b,w){
  const f=CONTENT.cv?.file;
  if(f){
    b.innerHTML=`<div class="cvwrap"><div class="cvbar"><a class="btn out" href="${esc(f)}" download>Download</a><a class="btn out" href="${esc(f)}" target="_blank" rel="noopener">Open in new tab ↗</a></div>
      <iframe src="${esc(f)}" title="CV of ${esc(CONTENT.name)}"></iframe></div>`;
    setStatus(w,CONTENT.cv.updated?"Last updated "+CONTENT.cv.updated:f);
  } else {
    b.innerHTML=`<div class="cvwrap" style="padding:20px;background:var(--face)"><article class="paper" style="padding:28px;box-shadow:4px 4px 0 rgba(0,0,0,.25)">
      <p class="draft">NO CV ATTACHED YET</p><h2>${esc(CONTENT.name)}</h2><p>${esc(CONTENT.role)}</p>
      <p>Visitors will read your CV right here, and the Download buttons will save it. To attach it:</p>
      <ol><li>Put your CV as <b>cv.pdf</b> next to index.html.</li><li>In the content block set <b>cv: { file: "cv.pdf", updated: "Oct 2026" }</b>.</li></ol></article></div>`;
    setStatus(w,"No file yet");
  }
}

/* ===================================================================== GAMES */
const live=w=>!w.min&&WM.active===w&&WM.wins.has(w.key);

/* 404 Runner: drawn at 200×60, scaled ×3 */
function gameRunner(body,w){
  body.innerHTML=`<div class="gamewrap"><canvas width="600" height="180" tabindex="0" aria-label="Runner game. Press Space or tap to jump."></canvas>
    <div class="gamehint"><span class="gs">SCORE 00000</span><span class="gh">HI 00000</span><span>SPACE / ↑ / TAP</span></div></div>`;
  const cv=$("canvas",body), G=cv.getContext("2d"); G.imageSmoothingEnabled=false;
  const LW=200,LH=60,GROUND=50, off=document.createElement("canvas"); off.width=LW; off.height=LH; const g=off.getContext("2d");
  const sky=document.createElement("canvas"); sky.width=LW; sky.height=GROUND; const k=sky.getContext("2d");
  dither(k,0,0,LW,GROUND,["#2a1450","#62226f","#c2477a","#f0795a","#f9b45a","#ffe39a"]);
  k.fillStyle="#fff3b0"; for(let y=-9;y<=9;y++){ const hw=Math.round(Math.sqrt(81-y*y)); if(y>2&&y%3===0) continue; k.fillRect(150-hw,32+y,hw*2,1); }
  const MH=14, DIG={4:["X.X","X.X","XXX","..X","..X"],0:["XXX","X.X","X.X","X.X","XXX"]};
  const OBS=[
    {w:6,h:8,draw(x,y){ g.fillStyle="#e8e0d0"; g.fillRect(x+2,y-2,1,1); g.fillRect(x+3,y-3,1,1);
      g.fillStyle="#fff"; g.fillRect(x,y+1,5,1); g.fillStyle="#8a4b22"; g.fillRect(x,y+2,5,6); g.fillRect(x+5,y+3,1,3); g.fillStyle="#b86a35"; g.fillRect(x+1,y+3,1,4); }},
    {w:8,h:6,draw(x,y){ g.fillStyle="#1a1a1a"; g.fillRect(x+2,y+1,4,5); g.fillRect(x,y+2,8,1); g.fillRect(x,y+4,8,1); g.fillStyle="#e33"; g.fillRect(x+3,y,2,1); g.fillStyle="#5dff7a"; g.fillRect(x+3,y+2,1,1); }},
    {w:14,h:9,draw(x,y){ g.fillStyle="#6b1010"; g.fillRect(x,y,14,9); g.fillStyle="#d83a3a"; g.fillRect(x+1,y+1,12,7);
      [4,0,4].forEach((dgt,n)=>DIG[dgt].forEach((r,j)=>[...r].forEach((ch,i)=>{ if(ch==="X"){ g.fillStyle="#fff"; g.fillRect(x+2+n*4+i,y+2+j,1,1);} }))); }}
  ];
  let hi=store.get("hr_hi"), st, alive=true, last;
  const reset=()=>{ st={y:GROUND-MH,vy:0,obs:[],t:0,dist:0,speed:1.7,score:0,next:40,over:false,run:false}; }; reset();
  function jump(){ if(st.over){reset();st.run=true;return;} if(!st.run){st.run=true;return;} if(st.y>=GROUND-MH-.1) st.vy=-3.6; }
  function step(){
    st.t++; st.vy+=.25; st.y=Math.min(GROUND-MH,st.y+st.vy); if(st.y===GROUND-MH) st.vy=0;
    st.speed=1.7+st.t/1800; st.dist+=st.speed; st.score=Math.floor(st.t/5);
    if(--st.next<=0){ st.obs.push({k:OBS[Math.random()*3|0],x:LW+4}); st.next=38+Math.random()*50; }
    st.obs.forEach(o=>o.x-=st.speed); st.obs=st.obs.filter(o=>o.x>-20);
    const mx=22,my=st.y+1,mw=8,mh=MH-1;
    for(const o of st.obs){ const oy=GROUND-o.k.h; if(mx<o.x+o.k.w-1&&mx+mw>o.x+1&&my<oy+o.k.h&&my+mh>oy+1){ st.over=true; st.run=false;
      if(st.score>hi){hi=st.score;store.set("hr_hi",hi)} } }
  }
  const pad=n=>String(n).padStart(5,"0");
  function draw(paused){
    g.drawImage(sky,0,0);
    for(let x=0;x<LW;x++){ const a=x+st.dist*.2, h1=Math.round(9+5*Math.sin(a*.045)+3*Math.sin(a*.13)); g.fillStyle="#7a3274"; g.fillRect(x,GROUND-h1,1,h1);
      const c=x+st.dist*.5, h2=Math.round(4+3*Math.sin(c*.07+1)+1.5*Math.sin(c*.21)); g.fillStyle="#3a1a52"; g.fillRect(x,GROUND-h2,1,h2); }
    g.fillStyle="#2a173f"; g.fillRect(0,GROUND,LW,LH-GROUND); g.fillStyle="#f9b45a"; g.fillRect(0,GROUND,LW,1);
    g.fillStyle="#4a2a63"; for(let i=0;i<16;i++){ const x=Math.round(((i*37-st.dist)%LW+LW)%LW); g.fillRect(x,GROUND+3+(i%3)*2,2+(i%3),1); }
    st.obs.forEach(o=>o.k.draw(Math.round(o.x),GROUND-o.k.h));
    const air=st.y<GROUND-MH-.1, f=air?1:(st.run?(Math.floor(st.t/6)%2?0:2):1);
    sprite(g,MAN.body.concat(MAN.legs[f]),20,Math.round(st.y),MAN.pal,"#1a0d2b");
    G.drawImage(off,0,0,600,180); G.font="24px VT323, monospace"; G.textAlign="center";
    const say=(s,y)=>{ G.fillStyle="#1a0d2b"; G.fillText(s,302,y+2); G.fillStyle="#fff"; G.fillText(s,300,y); };
    if(!st.run&&!st.over){ say("ERROR 404: PAGE NOT FOUND",50); say("press SPACE or tap to run",76); }
    else if(st.over){ say("G A M E   O V E R",50); say("score "+st.score+" · tap to retry",76); }
    else if(paused){ say("PAUSED · click to resume",60); }
    $(".gs",body).textContent="SCORE "+pad(st.score); $(".gh",body).textContent="HI "+pad(hi);
  }
  (function loop(ts){ if(!alive) return; if(last===undefined) last=ts; const on=live(w); let acc=Math.min(ts-last,100);
    while(acc>=16.67){ if(st.run&&on) step(); acc-=16.67; last+=16.67; } if(ts-last>100) last=ts;
    if(!w.min) draw(st.run&&!on); requestAnimationFrame(loop); })(performance.now());
  cv.addEventListener("pointerdown",e=>{ e.preventDefault(); cv.focus(); jump(); });
  return { focusEl:cv, onKey(e){ if(e.code==="Space"||e.code==="ArrowUp"||e.code==="KeyW"){ if(/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return; e.preventDefault(); jump(); } },
           destroy(){ alive=false; } };
}

/* Snake: 20×20 grid on a phone LCD */
function gameSnake(body,w){
  body.innerHTML=`<div class="snake">
    <div class="sscore"><span class="ss">SCORE 0000</span><span class="sh">HI 0000</span></div>
    <div class="lcdbox"><canvas width="160" height="160" aria-label="Snake game"></canvas><div class="lcdmsg"><span>SNAKE<br><small>press SPACE or tap</small></span></div></div>
    <div class="dpad">${["up","left","down","right"].map(d=>`<button class="btn out" data-d="${d}" aria-label="${d}">${{up:"▲",left:"◀",down:"▼",right:"▶"}[d]}</button>`).join("")}</div>
  </div>`;
  const cv=$("canvas",body), g=cv.getContext("2d"), msg=$(".lcdmsg",body), N=20, C=8;
  const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  let s, alive=true, last, acc=0, hi=store.get("hs_hi");
  function food(){ let f; do f={x:Math.random()*N|0,y:Math.random()*N|0}; while(s.body.some(p=>p.x===f.x&&p.y===f.y)); return f; }
  function reset(){ s={body:[{x:8,y:10},{x:7,y:10},{x:6,y:10}],dir:[1,0],q:[],score:0,state:"ready"}; s.food=food(); }
  reset();
  function say(t){ if(t){ msg.hidden=false; msg.innerHTML=`<span>${t}</span>`; } else msg.hidden=true; }
  function start(){ if(s.state==="run") return; if(s.state==="over") reset(); s.state="run"; acc=0; say(""); }
  function turn(d){ if(s.state!=="run"){ start(); return; } const v=DIRS[d], ld=s.q.length?s.q[s.q.length-1]:s.dir;
    if((v[0]===-ld[0]&&v[1]===-ld[1])||(v[0]===ld[0]&&v[1]===ld[1])) return; if(s.q.length<2) s.q.push(v); }
  function stepGame(){
    if(s.q.length) s.dir=s.q.shift();
    const h=s.body[0], n={x:(h.x+s.dir[0]+N)%N,y:(h.y+s.dir[1]+N)%N};
    if(s.body.slice(0,-1).some(p=>p.x===n.x&&p.y===n.y)){ s.state="over"; if(s.score>hi){hi=s.score;store.set("hs_hi",hi)}
      say(`GAME OVER<br>score ${s.score}<br><small>SPACE or tap</small>`); return; }
    s.body.unshift(n);
    if(n.x===s.food.x&&n.y===s.food.y){ s.score+=10; s.food=food(); } else s.body.pop();
  }
  function draw(){
    g.fillStyle="#c7f0d8"; g.fillRect(0,0,160,160);
    g.fillStyle="#b4dcc4"; for(let y=0;y<N;y++) for(let x=0;x<N;x++) g.fillRect(x*C+3,y*C+3,2,2);
    g.fillStyle="#43523d";
    s.body.forEach((p,i)=>{ g.fillRect(p.x*C+1,p.y*C+1,C-2,C-2); if(i===0){ g.fillStyle="#c7f0d8"; g.fillRect(p.x*C+3+s.dir[0],p.y*C+3+s.dir[1],2,2); g.fillStyle="#43523d"; } });
    const f=s.food; g.fillRect(f.x*C+3,f.y*C+1,2,2); g.fillRect(f.x*C+1,f.y*C+3,2,2); g.fillRect(f.x*C+5,f.y*C+3,2,2); g.fillRect(f.x*C+3,f.y*C+5,2,2);
    $(".ss",body).textContent="SCORE "+String(s.score).padStart(4,"0"); $(".sh",body).textContent="HI "+String(hi).padStart(4,"0");
  }
  let paused=false;
  (function loop(ts){ if(!alive) return; if(last===undefined) last=ts; const dt=Math.min(ts-last,200); last=ts;
    if(s.state==="run"){ if(live(w)){ if(paused){ paused=false; say(""); } acc+=dt; const ms=Math.max(65,140-s.score/2); while(acc>=ms&&s.state==="run"){ stepGame(); acc-=ms; } }
      else if(!paused){ paused=true; say("PAUSED<br><small>click to resume</small>"); } }
    if(!w.min) draw(); requestAnimationFrame(loop); })(performance.now());
  $$(".dpad button",body).forEach(b=>b.addEventListener("click",()=>turn(b.dataset.d)));
  let sx,sy; cv.addEventListener("pointerdown",e=>{ sx=e.clientX; sy=e.clientY; });
  cv.addEventListener("pointerup",e=>{ const dx=e.clientX-sx, dy=e.clientY-sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))<20){ start(); return; } turn(Math.abs(dx)>Math.abs(dy)?(dx>0?"right":"left"):(dy>0?"down":"up")); });
  const KEYS={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
  return { onKey(e){ if(KEYS[e.code]){ e.preventDefault(); turn(KEYS[e.code]); } else if(e.code==="Space"||e.code==="Enter"){ e.preventDefault(); start(); } },
           destroy(){ alive=false; } };
}

/* Minesweeper */
function gameMines(body,w){
  const LV={beginner:{c:9,r:9,m:10,label:"Beginner"},intermediate:{c:16,r:16,m:40,label:"Intermediate"}};
  const MINE=iconURL("mine"), FLAG=iconURL("flag");
  let lv="beginner", L, cells, first, over, flags, opened, t0, timer;
  body.innerHTML=`<div class="msw"><div class="lv">${Object.entries(LV).map(([k,v])=>`<button class="btn out" data-lv="${k}">${v.label}</button>`).join("")}</div>
    <div class="ms out"><div class="ms-head in"><span class="led lm">010</span><button class="btn out smiley" aria-label="New game">🙂</button><span class="led lt">000</span></div>
    <div class="ms-grid in" role="grid"></div></div><div class="meta best"></div></div>`;
  const grid=$(".ms-grid",body), face=$(".smiley",body);
  const led=n=>String(Math.max(-99,Math.min(999,n))).padStart(3,"0");
  const nb=i=>{ const x=i%L.c, y=i/L.c|0, out=[]; for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy) continue; const nx=x+dx, ny=y+dy; if(nx>=0&&ny>=0&&nx<L.c&&ny<L.r) out.push(ny*L.c+nx);} return out; };
  const stopT=()=>{ clearInterval(timer); timer=null; };
  function newGame(k){
    if(k) lv=k; L=LV[lv]; stopT(); first=true; over=false; flags=0; opened=0; t0=0;
    cells=Array.from({length:L.c*L.r},()=>({mine:false,open:false,flag:false,n:0}));
    grid.style.gridTemplateColumns=`repeat(${L.c},20px)`;
    grid.innerHTML=cells.map((_,i)=>`<button class="cell" data-i="${i}" aria-label="Hidden cell"></button>`).join("");
    face.textContent="🙂"; $(".lm",body).textContent=led(L.m); $(".lt",body).textContent="000";
    $$("[data-lv]",body).forEach(b=>b.setAttribute("aria-pressed",b.dataset.lv===lv));
    const best=store.get("hm_best_"+lv); $(".best",body).textContent=best?`Best ${L.label}: ${best}s`:`${L.label}: ${L.m} mines`;
    setStatus(w,"Right-click or long-press to flag · F2 new game");
    WM.fit(w,Math.max(300,L.c*20+60),L.r*20+262);
  }
  function plant(safe){ const ban=new Set([safe,...nb(safe)]); let k=0;
    while(k<L.m){ const i=Math.random()*cells.length|0; if(ban.has(i)||cells[i].mine) continue; cells[i].mine=true; k++; }
    cells.forEach((c,i)=>c.n=nb(i).filter(j=>cells[j].mine).length); }
  function paint(i){ const c=cells[i], el=grid.children[i];
    el.className="cell"+(c.open?" open":"")+(c.open&&c.n&&!c.mine?" n"+c.n:"");
    el.innerHTML=c.flag&&!c.open?`<img src="${FLAG}" alt="">`:c.open&&c.mine?`<img src="${MINE}" alt="">`:c.open&&c.n?c.n:"";
    el.setAttribute("aria-label",c.flag&&!c.open?"Flagged":c.open?(c.mine?"Mine":c.n?c.n+" nearby":"Empty"):"Hidden cell"); }
  function open(i){
    const c=cells[i]; if(over||c.open||c.flag) return;
    if(first){ first=false; plant(i); t0=Date.now(); timer=setInterval(()=>{ $(".lt",body).textContent=led(Math.floor((Date.now()-t0)/1000)); },250); }
    if(c.mine){ over=true; stopT(); face.textContent="😵";
      cells.forEach((d,j)=>{ if(d.mine){ d.open=true; paint(j);} }); grid.children[i].classList.add("boom"); setStatus(w,"Boom. Click the face to try again."); return; }
    const stack=[i];
    while(stack.length){ const j=stack.pop(), d=cells[j]; if(d.open||d.flag) continue; d.open=true; opened++; paint(j); if(d.n===0) nb(j).forEach(k=>{ if(!cells[k].open) stack.push(k); }); }
    if(opened===cells.length-L.m){ over=true; stopT(); face.textContent="😎"; const secs=Math.max(1,Math.round((Date.now()-t0)/1000));
      cells.forEach((d,j)=>{ if(d.mine&&!d.flag){ d.flag=true; paint(j);} }); $(".lm",body).textContent="000";
      const best=store.get("hm_best_"+lv); if(!best||secs<best) store.set("hm_best_"+lv,secs);
      $(".best",body).textContent=`Cleared in ${secs}s · best ${Math.min(secs,best||secs)}s`; setStatus(w,"You win!"); }
  }
  function chord(i){ const c=cells[i]; if(!c.open||!c.n||over) return; const around=nb(i); if(around.filter(j=>cells[j].flag).length===c.n) around.forEach(open); }
  function flag(i){ const c=cells[i]; if(over||c.open) return; c.flag=!c.flag; flags+=c.flag?1:-1; paint(i); $(".lm",body).textContent=led(L.m-flags); }
  let press=null, longFired=false;
  grid.addEventListener("pointerdown",e=>{ const b=e.target.closest(".cell"); if(!b||over) return; face.textContent="😮"; longFired=false;
    if(e.pointerType!=="mouse"){ clearTimeout(press); press=setTimeout(()=>{ longFired=true; flag(+b.dataset.i); face.textContent="🙂"; },420); } });
  const upFace=()=>{ clearTimeout(press); if(!over) face.textContent="🙂"; };
  ["pointerup","pointerleave","pointercancel"].forEach(t=>grid.addEventListener(t,upFace));
  grid.addEventListener("click",e=>{ const b=e.target.closest(".cell"); if(!b) return; if(longFired){ longFired=false; return; } const i=+b.dataset.i; cells[i].open?chord(i):open(i); });
  grid.addEventListener("contextmenu",e=>{ e.preventDefault(); const b=e.target.closest(".cell"); if(b&&!longFired) flag(+b.dataset.i); });
  face.onclick=()=>newGame(); $$("[data-lv]",body).forEach(b=>b.onclick=()=>newGame(b.dataset.lv));
  newGame();
  return { destroy(){ stopT(); }, onKey(e){ if(e.key==="F2"){ e.preventDefault(); newGame(); } } };
}

/* ===================================================================== WALLPAPER */
(function(){
  let cv=$("#wall"), g=cv.getContext("2d"), ready=false;
  let W,H,hz,stat,fg,stars,clouds,sun,palms=[],ripples=[],sparks=[],nuts=[];
  function line(f,x0,y0,x1,y1){ const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1); for(let i=0;i<=n;i++) f.fillRect(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),1,1); }
  function palm(f,x0,base,h,lean){
    const ink="#0b0614";
    // trunk: tapered, gently curved, with ring notches
    for(let i=0;i<=h;i++){ const t=i/h, x=x0+lean*t*t, y=Math.round(base-i), wdt=Math.max(2,Math.round(4-2.2*t));
      f.fillStyle=ink; f.fillRect(Math.round(x-wdt/2),y,wdt,1);
      if(i%3===0&&t<.95){ f.fillStyle="#1d1030"; f.fillRect(Math.round(x-wdt/2),y,1,1); } }
    const tx=x0+lean, ty=base-h, L=h*.42;
    // fronds: [horizontal reach, end drop, length factor]
    const fronds=[[-1,.62,1],[-.95,.22,1],[-.62,-.18,.82],[-.08,-.34,.55],[.5,-.2,.8],[.95,.18,1],[1,.6,1],[-.75,.42,.78],[.72,.4,.75]];
    f.fillStyle=ink;
    for(const [dx,dr,lf] of fronds){
      const len=L*lf, ex=tx+dx*len, ey=ty+dr*len, cx=tx+dx*len*.5, cy=ty-len*.32+Math.max(0,dr)*len*.1;
      let px=tx, py=ty; const steps=Math.ceil(len*1.4);
      for(let k=1;k<=steps;k++){ const u=k/steps, x=(1-u)*(1-u)*tx+2*(1-u)*u*cx+u*u*ex, y=(1-u)*(1-u)*ty+2*(1-u)*u*cy+u*u*ey;
        f.fillRect(Math.round(x),Math.round(y),1,u<.4?2:1);
        if(k%2===0&&u>.08){ let gx=x-px, gy=y-py; const m=Math.hypot(gx,gy)||1; gx/=m; gy/=m;
          const ll=Math.max(1.5,(1-u*.8)*len*.14);
          for(const sgn of [1,-1]){ let vx=gx*.55+(-gy)*sgn, vy=gy*.55+gx*sgn+.45; const vm=Math.hypot(vx,vy)||1;
            line(f,Math.round(x),Math.round(y),Math.round(x+vx/vm*ll),Math.round(y+vy/vm*ll)); } }
        px=x; py=y; } }
  }
  function build(){
    const vw=innerWidth||document.documentElement.clientWidth, vh=innerHeight||document.documentElement.clientHeight;
    if(!vw||!vh) return (ready=false);
    try{ buildScene(vw,vh); ready=true; }catch(e){ ready=false; }
    return ready;
  }
  function buildScene(innerWidth,innerHeight){
    const px=innerWidth<700?3:4;
    W=Math.ceil(innerWidth/px); H=Math.ceil(innerHeight/px); cv.width=W; cv.height=H; hz=Math.floor(H*.62);
    stat=document.createElement("canvas"); stat.width=W; stat.height=H; const s=stat.getContext("2d");
    dither(s,0,0,W,hz,["#140c33","#24124a","#3d1a5e","#62226f","#8f2c74","#c13f6f","#e3605f","#f38a4f","#f9b45a","#ffd77a"]);
    dither(s,0,hz,W,H-hz,["#3a1f62","#24164d","#140c33"]);
    const r=Math.max(10,Math.round(Math.min(W,H)*.17)), cx=Math.round(W*.68), cy=hz-Math.round(r*.35); sun={cx,r};
    const bh=Math.max(3,r*.2);
    for(let y=cy-r;y<hz;y++){ const dy=y-cy, hw=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy))), k=(y-(cy-r))/(2*r);
      if(dy>-r*.1){ const q=dy+r*.1, band=Math.floor(q/bh); if(q%bh<band+1) continue; }
      s.fillStyle=k<.3?"#fff3b0":k<.5?"#ffd36b":k<.7?"#ffa04f":"#ff6f61"; s.fillRect(cx-hw,y,hw*2,1); }
    for(let x=0;x<W;x++){
      const h1=Math.round(H*.1*(.55+.3*Math.sin(x*.03)+.15*Math.sin(x*.11+2))); s.fillStyle="#7a3274"; s.fillRect(x,hz-h1,1,h1);
      const h2=Math.round(H*.05*(.5+.35*Math.sin(x*.055+1)+.15*Math.sin(x*.17))); s.fillStyle="#4a1d5c"; s.fillRect(x,hz-h2,1,h2); }
    s.fillStyle="#ff9a6a"; s.fillRect(0,hz,W,1);
    fg=document.createElement("canvas"); fg.width=W; fg.height=H; const f=fg.getContext("2d");
    f.fillStyle="#120a24";
    const lw=Math.round(W*.42); for(let x=0;x<lw;x++){ const h=Math.round(H*.09*Math.pow(1-x/lw,.6))+1; f.fillRect(x,H-h,1,h); }
    const rw=Math.round(W*.22); for(let x=0;x<rw;x++){ const h=Math.round(H*.06*Math.pow(1-x/rw,.7))+1; f.fillRect(W-1-x,H-h,1,h); }
    const ph=Math.round(H*.46);
    palms=[[W*.06,H-H*.06,ph,ph*.16],[W*.17,H-H*.04,ph*.72,-ph*.14],[W*.95,H-H*.04,ph*.8,-ph*.18]].map(([x0,base,h,lean],i)=>{
      [x0,base,h,lean]=[x0,base,h,lean].map(Math.round);
      const c=document.createElement("canvas"); c.width=W; c.height=H; palm(c.getContext("2d"),x0,base,h,lean);
      return {c,x0,base,h,lean,tx:x0+lean,ty:base-h,L:h*.42,a:0,v:0,ph:i*2.1,nuts:[[-2,1],[1,2],[-1,3]].map(([ox,oy])=>({ox,oy,on:true,back:0}))}; });
    ripples=[]; sparks=[]; nuts=[];
    const R=rng("sky"+W);
    stars=Array.from({length:Math.round(W*H/900)},()=>({x:R()*W|0,y:R()*hz*.45|0,p:R()*6.28}));
    clouds=Array.from({length:5},()=>({x:R()*W,y:Math.round(hz*(.18+R()*.42)),w:Math.round(14+R()*22),v:.04+R()*.05}));
  }
  function cloud(x,y,w){ x=Math.round(x);
    g.fillStyle="#b9578a"; g.fillRect(x+1,y+5,w-2,1);
    g.fillStyle="#f19aa6"; g.fillRect(x,y+2,w,3); g.fillRect(x+2,y+1,w-5,1); g.fillRect(x+4,y,Math.round(w*.4),1);
    g.fillStyle="#ffd3c2"; g.fillRect(x+3,y+1,Math.round(w*.45),1); g.fillRect(x+5,y,Math.round(w*.25),1); }
  function draw(t){
    const now=document.getElementById("wall");            // survive the page being re-rendered in place
    if(now&&now!==cv){ cv=now; g=cv.getContext("2d"); ready=false; }
    if(!ready&&!build()) return;
    if(cv.width!==W) { if(!build()) return; }
    g.drawImage(stat,0,0);
    for(const s of stars){ const v=Math.sin(t*.0015+s.p); if(v>-.2){ g.fillStyle=v>.7?"#ffffff":"#b9a2ff"; g.fillRect(s.x,s.y,1,1);} }
    for(const c of clouds){ c.push=(c.push||0)*.93; if(Math.abs(c.push)<.01) c.push=0; c.lift=(c.lift||0)*.92;
      c.x+=(reduce?0:c.v)+c.push; if(c.x>W+4) c.x=-c.w-4; if(c.x<-c.w-6) c.x=W+2; cloud(c.x,Math.round(c.y+c.lift),c.w); }
    for(let y=hz+2;y<H;y+=2){ const d=(y-hz)/(H-hz), w=Math.max(2,sun.r*1.6*(1-d*.6)*(.55+.45*Math.sin(t*.0011+y*.9)));
      g.fillStyle=(y/2)%2?"#ffb36b":"#ff7f6a"; g.fillRect(Math.round(sun.cx-w/2+Math.sin(t*.0007+y*1.3)*2),y,Math.round(w),1); }
    life(t);
    drawRipples(t);
    g.drawImage(fg,0,0);
    drawPalms(t);
    drawSparks(t);
  }
  /* ---- interactive bits ---- */
  function drawRipples(t){
    ripples=ripples.filter(r=>t-r.t0<1500);
    for(const r of ripples) for(let n=0;n<2;n++){ const k=(t-r.t0-n*260)/1240; if(k<0||k>1) continue;
      const rx=2+k*20, ry=rx*.3; g.fillStyle=n?"rgba(185,162,255,"+(1-k)*.8+")":"rgba(255,211,194,"+(1-k)+")";
      for(let a=0;a<6.283;a+=1/rx){ const x=Math.round(r.x+Math.cos(a)*rx), y=Math.round(r.y+Math.sin(a)*ry); if(y>hz) g.fillRect(x,y,1,1); } }
  }
  function drawPalms(t){
    g.imageSmoothingEnabled=false;
    for(const p of palms){
      const target=0;
      p.v+=(target-p.a)*.06; p.v*=.9; p.a+=p.v;
      g.save(); g.translate(p.x0,p.base); g.transform(1,0,-p.a,1,0,0); g.translate(-p.x0,-p.base); g.drawImage(p.c,0,0); g.restore();
      g.fillStyle="#24122f";
      for(const n of p.nuts){ if(!n.on){ if(n.back&&t>n.back){ n.on=true; n.back=0; } continue; }
        const y=p.ty+n.oy; g.fillRect(Math.round(p.tx+n.ox+p.a*(p.base-y)),Math.round(y),2,2); } }
    nuts=nuts.filter(n=>t-n.land<2200||!n.land);
    for(const n of nuts){ if(!n.land){ n.vy+=.18; n.y+=n.vy; n.x+=n.vx; if(n.y>=n.floor){ n.y=n.floor; if(n.vy>1.2){ n.vy*=-.35; n.vx*=.5; } else n.land=t; } }
      g.globalAlpha=n.land?Math.max(0,1-(t-n.land)/2200):1; g.fillStyle="#24122f"; g.fillRect(Math.round(n.x),Math.round(n.y),2,2); g.globalAlpha=1; }
  }
  function drawSparks(t){
    sparks=sparks.filter(s=>t-s.t0<700);
    for(const s of sparks){ const k=(t-s.t0)/700; g.fillStyle=`rgba(255,247,214,${1-k})`; g.fillRect(Math.round(s.x+s.dx*k*7),Math.round(s.y+s.dy*k*7),1,1); }
  }
  function shake(p,dir,t){
    p.v+=.05*dir;
    const on=p.nuts.filter(n=>n.on);
    if(on.length&&Math.random()<.45){ const n=on[Math.random()*on.length|0]; n.on=false; n.back=t+9000;
      const y=p.ty+n.oy; nuts.push({x:p.tx+n.ox+p.a*(p.base-y),y,vx:dir*.25,vy:-.6,floor:p.base-1,land:0}); }
  }
  function boatPos(t){ const k=fx.hop?(t-fx.hop)/520:1, hop=k<1?Math.round(Math.sin(k*Math.PI)*3):0;
    return {bx:Math.round(fx.boat*W), by:hz+2+Math.round(Math.sin(t*.0015))-hop}; }
  const SAYS=()=>CONTENT.boatSays||["ahoy!"];
  let lastSay=-1, bubbleT=0;
  function say(t){ const b=$("#bubble"), list=SAYS(); let i; do i=Math.random()*list.length|0; while(list.length>1&&i===lastSay); lastSay=i;
    b.textContent=list[i]; b.classList.add("on"); bubbleT=t+2600; fx.hop=t; }
  function placeBubble(t){ const b=$("#bubble"); if(!b) return;
    if(bubbleT&&t>bubbleT){ b.classList.remove("on"); bubbleT=0; }
    if(!b.classList.contains("on")) return;
    const {bx,by}=boatPos(t), r=desk.getBoundingClientRect(), sx=innerWidth/W, sy=innerHeight/H;
    b.style.left=((bx+4)*sx-r.left)+"px"; b.style.top=((by-12)*sy-r.top)+"px"; }
  function hit(lx,ly,t){
    const {bx,by}=boatPos(t);
    if(lx>=bx-4&&lx<=bx+13&&ly>=by-12&&ly<=by+5) return {k:"boat"};
    for(const p of palms){
      if(Math.abs(lx-p.tx)<=p.L&&ly>=p.ty-p.L*.45&&ly<=p.ty+p.L*.7) return {k:"palm",p,dir:lx<p.tx?1:-1};
      if(ly>=p.ty&&ly<=p.base){ const tt=(p.base-ly)/p.h; if(Math.abs(lx-(p.x0+p.lean*tt*tt))<=3) return {k:"palm",p,dir:1}; } }
    if(fx.birds&&Math.abs(lx-(fx.birds.x+6))<16&&Math.abs(ly-fx.birds.y)<9) return {k:"birds"};
    if(ly>hz+1){ const d=fg.getContext("2d").getImageData(lx,ly,1,1).data; return d[3]?{k:"sand"}:{k:"sea"}; }
    return {k:"sky"};
  }
  function toLow(e){ return [Math.floor(e.clientX*W/innerWidth),Math.floor(e.clientY*H/innerHeight)]; }
  const isBg=e=>e.target===desk||e.target.id==="icons";
  desk.addEventListener("pointerdown",e=>{
    if(!isBg(e)||!ready) return; const t=performance.now(), [lx,ly]=toLow(e), h=hit(lx,ly,t);
    if(h.k==="boat") say(t);
    else if(h.k==="palm") shake(h.p,h.dir,t);
    else if(h.k==="birds"&&fx.birds) fx.birds.scared=true;
    else if(h.k==="sea") ripples.push({x:lx,y:ly,t0:t});
    else if(h.k==="sky"){ for(const c of clouds){ const cx=c.x+c.w/2, d=Math.hypot(cx-lx,(c.y-ly)*1.5), f=Math.max(0,1-d/70);
        if(f){ c.push+=(cx>=lx?1:-1)*f*1.6; c.lift+=(c.y>=ly?1:-1)*f*3; } }
      for(let i=0;i<7;i++){ const a=i/7*6.283; sparks.push({x:lx,y:ly,dx:Math.cos(a),dy:Math.sin(a),t0:t}); } }
    kick();
  });
  desk.addEventListener("pointermove",e=>{ if(!isBg(e)||!ready){ return; } const [lx,ly]=toLow(e), k=hit(lx,ly,performance.now()).k;
    desk.style.cursor=(k==="boat"||k==="palm"||k==="birds")?"pointer":"default"; });
  let busyUntil=0; function kick(){ busyUntil=performance.now()+3000; }
  /* small signs of life: a sailboat on the horizon, a few birds, the odd shooting star */
  const fx={boat:.55,birds:null,nextBirds:6000,star:null,nextStar:9000,hop:0};
  function life(t){
    if(!reduce) fx.boat+=.0001; if(fx.boat>1.08) fx.boat=-.08;
    const {bx,by}=boatPos(t); placeBubble(t);
    g.fillStyle="#120a24"; g.fillRect(bx,by,9,1); g.fillRect(bx+1,by+1,7,1); g.fillRect(bx+4,by-9,1,9);
    for(let i=0;i<7;i++) g.fillRect(bx+5,by-8+i,Math.ceil(i*.6),1);
    for(let i=0;i<5;i++) g.fillRect(bx+4-Math.ceil(i*.5),by-6+i,Math.ceil(i*.5),1);
    g.fillStyle="#ffb36b"; g.fillRect(bx+5,by-8,1,1); g.fillRect(bx+1,by+2,7,1);
    if(reduce) return;
    if(!fx.birds&&t>fx.nextBirds){ fx.birds={x:-12,y:Math.round(hz*(.22+Math.random()*.2)),t0:t}; }
    if(fx.birds){ const b=fx.birds; b.x+=b.scared?1.3:.35; if(b.scared) b.y-=.35; g.fillStyle="#1a0d2b";
      [[0,0],[6,3],[11,-2]].forEach(([dx,dy],i)=>{ const x=Math.round(b.x+dx), y=b.y+dy+Math.round(Math.sin((t-b.t0)*.002+i)), up=Math.floor(t/260+i)%2;
        if(up){ g.fillRect(x,y,1,1); g.fillRect(x+1,y+1,2,1); g.fillRect(x+3,y,1,1); } else { g.fillRect(x,y+1,1,1); g.fillRect(x+1,y,2,1); g.fillRect(x+3,y+1,1,1); } });
      if(b.x>W+12||b.y<-10){ fx.birds=null; fx.nextBirds=t+18000+Math.random()*20000; } }
    if(!fx.star&&t>fx.nextStar){ fx.star={x:W*(.1+Math.random()*.6),y:hz*(.04+Math.random()*.2),t0:t}; }
    if(fx.star){ const s=fx.star, k=(t-s.t0)/900; if(k>1){ fx.star=null; fx.nextStar=t+12000+Math.random()*16000; }
      else { const len=14, hx=s.x+k*40, hy=s.y+k*16;
        for(let i=0;i<len;i++){ g.fillStyle=`rgba(255,247,214,${(1-i/len)*(1-k)})`; g.fillRect(Math.round(hx-i*2.5),Math.round(hy-i),1,1); } } }
  }
  function placeWelcome(){
    const el=$("#welcome"), wc=CONTENT.welcome; if(!wc){ el.hidden=true; return; }
    $("small",el).textContent=wc.small||""; $("b",el).textContent=wc.big||"";
    if(!sun) return; const px=innerWidth/W, reflRight=(sun.cx+sun.r*.85)*px+16;
    el.classList.remove("compact","off");
    if(el.getBoundingClientRect().left<reflRight) el.classList.add("compact");
    if(el.getBoundingClientRect().left<reflRight) el.classList.add("off");
  }
  build(); draw(0); placeWelcome(); document.fonts?.ready.then(placeWelcome);
  if(window.ResizeObserver) new ResizeObserver(()=>{ clearTimeout(rt); rt=setTimeout(()=>{build();draw(performance.now())},150); }).observe(document.documentElement);
  var rt; addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{build();draw(performance.now());placeWelcome()},150)});
  { let last=0; (function loop(t){ const busy=t<busyUntil||bubbleT||ripples.length||nuts.length; if(t-last>(busy?33:(reduce?1000:90))){ try{ draw(t); }catch(e){} last=t; } requestAnimationFrame(loop); })(0); }
})();

/* ===================================================================== BOOT */
(function(){ let k=""; try{ k=location.hash.slice(1); }catch(e){} openWin("home"); if(k&&k!=="home") openWin(k); })();
