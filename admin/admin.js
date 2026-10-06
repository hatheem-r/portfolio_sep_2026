/* HatheemOS 98 · Control Panel
   Edits js/content.js and the images it points to, then saves everything to GitHub as one commit.
   GitHub Pages rebuilds the site about a minute later. No server and no build step.
   Sections so far: Certificates, Milestones, Competitions. */
"use strict";
(() => {
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const el=html=>{ const t=document.createElement("template"); t.innerHTML=html.trim(); return t.content.firstElementChild; };
const kb=n=>n<1048576?Math.max(1,Math.round(n/1024))+" KB":(n/1048576).toFixed(1)+" MB";
const SITE="../", CONTENT_PATH="js/content.js";
const TOKEN_URL="https://github.com/settings/personal-access-tokens/new";
const PDFJS="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/";
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const coarse=matchMedia("(pointer: coarse)").matches;

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

/* ---------- pixel icons (same sprites as the site) ---------- */
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
  recent:new Map(),    // path -> url: files published in this session (GitHub Pages may still be building)
  changes:new Map(), removed:[], moved:new Set(),
  view:"home", sel:-1, popup:null, watch:0, liveMsg:"" };
const resetChanges=()=>{ S.changes=new Map(); S.removed=[]; S.moved=new Set(); };
const isDirty=()=>!!S.draft&&serialize(S.draft)!==S.origText;

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
function b64text(b64){ const bin=atob(b64.replace(/\s/g,"")), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); return new TextDecoder().decode(u); }
const blobB64=b=>new Promise((res,rej)=>{ const f=new FileReader(); f.onload=()=>res(String(f.result).split(",")[1]||""); f.onerror=()=>rej(f.error); f.readAsDataURL(b); });

async function readTree(commitSha){
  const c=await S.gh.get(`/git/commits/${commitSha}`);
  const t=await S.gh.get(`/git/trees/${c.tree.sha}?recursive=1`);
  return {treeSha:c.tree.sha, files:new Map(t.tree.filter(e=>e.type==="blob").map(e=>[e.path,e.sha]))};
}
async function loadContent(){
  const info=await S.gh.get("");
  S.branch=info.default_branch||"main";
  const ref=await S.gh.get(`/git/ref/heads/${branchPath()}`);
  const head=ref.object.sha, {treeSha,files}=await readTree(head);
  const sha=files.get(CONTENT_PATH);
  if(!sha) throw new Error(`${CONTENT_PATH} isn't in ${S.owner}/${S.repo}. Is this the right repository?`);
  const blob=await S.gh.get(`/git/blobs/${sha}`);
  let parsed;
  try{ parsed=parseContent(b64text(blob.content)); }
  catch(e){ throw new Error(`${CONTENT_PATH} has a typo the Control Panel can't read (${e.message}). Fix it on GitHub, then reload.`); }
  for(const k of Object.keys(SECTIONS)) if(!Array.isArray(parsed.data[k])) parsed.data[k]=[];
  Object.assign(S,{head,treeSha,files,contentSha:sha,original:parsed.data,draft:clone(parsed.data),origText:serialize(parsed.data),strict:parsed.strict});
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

/* ---------- sections: add one here to make it editable ---------- */
const placeLabel=p=>({1:"1st",2:"2nd",3:"3rd"})[p]||"—";
const thisYear=()=>String(new Date().getFullYear());
const SECTIONS={
  certificates:{ title:"Certificates", icon:"cert", noun:"certificate", addAt:"top", layout:"tiles",
    blurb:"Course certificates. They appear uncropped in the gallery inside the Accomplishments window.",
    tip:"Tip: drop a certificate image or PDF anywhere in this window, or paste a screenshot, to add it.",
    name:c=>c.course||"(untitled)", sub:c=>[c.issuer,c.date].filter(Boolean).join(" · "),
    blank:()=>({course:"",issuer:"",date:"",image:""}),
    fields:[
      {k:"image",t:"image",label:"Certificate",folder:"certs",max:1600,slug:c=>[c.course,c.issuer]},
      {k:"course",t:"text",label:"Course",req:true,ph:"e.g. Intro to MCP"},
      {k:"issuer",t:"text",label:"Issuer",ph:"e.g. Scrimba",suggest:true},
      {k:"date",t:"month",label:"Completed"}
    ]},
  accomplishments:{ title:"Milestones", icon:"medal", noun:"milestone", addAt:"top", layout:"table",
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
  competitions:{ title:"Competitions", icon:"trophy", noun:"competition", addAt:"bottom", layout:"table",
    blurb:"Hackathons and contests, listed in the Competitions window. 1st to 3rd place also puts a trophy on the shelf.",
    cols:[["Year","year"],["Competition","name"],["Track","type"],["Place",c=>placeLabel(c.place)],["Result","result"]],
    name:c=>c.name||"(untitled)", sub:c=>[c.year,c.result].filter(Boolean).join(" · "),
    blank:()=>({year:thisYear(),name:"",type:"",place:null,result:""}),
    fields:[
      {k:"name",t:"text",label:"Competition",req:true,ph:"e.g. Octwave 3.0"},
      {k:"year",t:"year",label:"Year"},
      {k:"type",t:"text",label:"Track",ph:"e.g. Machine learning",suggest:true},
      {k:"place",t:"place",label:"Place"},
      {k:"result",t:"text",label:"Result",ph:"e.g. Overall runner-up"}
    ]}
};
const SOON=[["Projects","folder","Project cards and their pages: covers, screenshots, GitHub links."],
  ["Journal","journal","Stories with photos."],
  ["Profile","card","Name, role, about, photo, facts, ticker and wallpaper greeting."],
  ["CV & Contact","mail","Upload a new CV and edit email, LinkedIn and phone."],
  ["Wallpaper & Sound","speaker","Boat phrases, badges and background sound volume."]];

function changeLines(){
  const out=[];
  for(const [item,{sec,type}] of S.changes) if(S.draft[sec].includes(item)) out.push(`${type==="add"?"Add":"Edit"} ${SECTIONS[sec].noun}: ${SECTIONS[sec].name(item)}`);
  for(const r of S.removed) out.push(`Remove ${SECTIONS[r.sec].noun}: ${r.name}`);
  for(const k of S.moved) out.push(`Reorder ${SECTIONS[k].title.toLowerCase()}`);
  return out;
}
function localRefs(data){
  const out=new Set();
  (function walk(v){ if(typeof v==="string"){ const p=v.split(/[?#]/)[0]; if(/^(certs|images)\//.test(p)) out.add(p); }
    else if(v&&typeof v==="object") Object.values(v).forEach(walk); })(data);
  return out;
}
function resolveSrc(path){
  if(!path) return "";
  if(/^(https?:|data:|blob:)/.test(path)) return path;
  const p=path.split(/[?#]/)[0];
  return S.pending.get(p)?.url||S.recent.get(p)||SITE+path;
}
const slug=s=>String(s).normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/&/g," and ")
  .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60).replace(/-+$/,"");
function uniquePath(folder,base,ext){ let n=1,p; do{ p=`${folder}/${base}${n>1?"-"+n:""}.${ext}`; n++; }while(S.files.has(p)||S.pending.has(p)); return p; }

/* ---------- images: resize, re-encode, PDF page 1 → picture ---------- */
const EXT={"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif"};
const toBlob=(c,type,q)=>new Promise(r=>c.toBlob(r,type,q));
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
async function prepareImage(file,max){
  const isPdf=file.type==="application/pdf"||/\.pdf$/i.test(file.name);
  let canvas, original=null;
  if(isPdf) canvas=await pdfCanvas(file,max);
  else{
    if(!/^image\//.test(file.type)&&!/\.(png|jpe?g|webp|gif|avif|bmp|hei[cf])$/i.test(file.name)) throw new Error("That file isn't an image or a PDF.");
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
    else if(e.key==="Enter"&&!e.target.closest("button,textarea,select,a,summary,[role=button]")){ const d=$(".dfoot .def",ov); if(d&&!d.disabled){ e.preventDefault(); act(d.dataset.dlg); } }
    else if(e.key==="Tab"){ const f=$$("button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,a[href],[tabindex='0']",ov).filter(x=>x.offsetParent);
      if(!f.length) return; const i=f.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey&&i===f.length-1){ e.preventDefault(); f[0].focus(); } }
  };
  document.addEventListener("keydown",key,true);
  const api={el:ov,body:dbody,close,act,setButtons};
  setTimeout(()=>($("[autofocus]",ov)||$(".dbody input:not([type=hidden]):not([type=checkbox]):not([type=radio]),.dbody select",ov)||$(".dfoot .def",ov))?.focus(),0);
  return api;
}
function msgbox(title,html,ic="info",buttons=[["OK","ok",true]]){
  return new Promise(res=>dialog({title,icon:ic,cls:"msg",buttons,
    body:`<div class="msgrow"><span data-icon="${ic}" class="big"></span><div>${html}</div></div>`,
    onAction:a=>{ res(a); return true; }}));
}
function progressBox(text){
  const d=dialog({title:"Control Panel",icon:"cpl",cls:"msg noclose",body:`<div class="msgrow"><span data-icon="cpl" class="big"></span><div><p class="pstep">${esc(text)}</p><div class="prog in marquee"><i></i></div></div></div>`,onAction:()=>false});
  return d;
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
const ORDER=["certificates","accomplishments","competitions"];
const openSite=()=>window.open(SITE,"_blank","noopener");
const fileMenu=()=>[{label:"Publish…",icon:"save",key:"Ctrl+S",disabled:!isDirty(),run:openPublish},
  {label:"Reload from GitHub",run:reload},{label:"Discard unpublished changes",icon:"del",disabled:!isDirty(),run:discard},"-",
  {label:"Open my site",icon:"pc",run:openSite},{label:"Sign out",icon:"key",run:signOut}];
const helpMenu=()=>[{label:"How publishing works",icon:"info",run:help},{label:"About Control Panel",icon:"cpl",run:about}];
const startMenu=()=>[{label:"Control Panel",icon:"cpl",run:()=>go("")},...ORDER.map(k=>({label:SECTIONS[k].title,icon:SECTIONS[k].icon,run:()=>go(k)})),"-",
  {label:"Open my site",icon:"pc",run:openSite},{label:"Sign out",icon:"key",run:signOut}];

/* ---------- shell ---------- */
function buildShell(){
  document.body.innerHTML=`
  <section class="win out main" id="main" aria-label="Control Panel" hidden>
    <div class="bar"><span data-icon="cpl"></span><h1>Control Panel</h1>
      <a class="btn out ctl" href="${SITE}" target="_blank" rel="noopener" title="Open your site in a new tab" aria-label="Open your site">↗</a></div>
    <div class="menu" role="menubar"><button class="mb" data-menu="file" aria-haspopup="menu" aria-expanded="false"><u>F</u>ile</button><button class="mb" data-menu="help" aria-haspopup="menu" aria-expanded="false"><u>H</u>elp</button></div>
    <div class="tool">
      <button class="btn out tb" id="upbtn" title="Up to Control Panel"><span data-icon="up"></span><span class="lbl">Up</span></button>
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
  $("#pubbtn").onclick=openPublish;
  const tick=()=>{ $("#clock").textContent=new Date().toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}); };
  tick(); setInterval(tick,15000);
  wirePane();
}
function go(v){ history.pushState(null,"",v?"#"+v:location.pathname+location.search); route(); }
function route(){ const k=location.hash.slice(1); S.view=SECTIONS[k]?k:"home"; S.sel=-1; render(); $("#pane").scrollTop=0; }
addEventListener("popstate",()=>{ if(S.draft&&!topModal()) route(); });

function render(){
  const N=SECTIONS[S.view];
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
function renderWeb(sel){
  const N=SECTIONS[S.view], web=$("#web");
  if(!N){
    web.innerHTML=`<div class="webhead"><span data-icon="cpl" class="big"></span><h2>Control Panel</h2></div><hr class="wline">
      <p id="webdesc">Use the settings in Control Panel to update your site.</p>
      <p class="muted">Changes wait here until you press <b>Publish</b>. Then GitHub rebuilds the site in about a minute.</p>
      <p><a href="${SITE}" target="_blank" rel="noopener">Open my site ↗</a></p>`;
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
  const pane=$("#pane"), N=SECTIONS[S.view];
  if(!N){
    pane.innerHTML=`<div class="applets" role="list">${ORDER.map(k=>`<button class="applet" role="listitem" data-go="${k}" data-desc="${esc(SECTIONS[k].blurb)}"><span data-icon="${SECTIONS[k].icon}" class="big"></span><span class="al">${SECTIONS[k].title}</span></button>`).join("")}
      ${SOON.map(([t,ic,d])=>`<button class="applet soon" role="listitem" aria-disabled="true" data-desc="${esc(d)} Coming in the next update."><span data-icon="${ic}" class="big"></span><span class="al">${t}</span><small>coming soon</small></button>`).join("")}</div>`;
    hydrate(pane); return;
  }
  const list=S.draft[S.view], dis=S.sel<0?" disabled":"";
  const body=!list.length?`<div class="empty"><span data-icon="${N.icon}" class="big"></span><p>No ${N.title.toLowerCase()} yet.</p><button class="btn out" data-act="new">New ${N.noun}</button></div>`
    :N.layout==="tiles"?`<div class="tiles" role="listbox" aria-label="${N.title}">${list.map((c,i)=>`<button class="tile out" role="option" data-i="${i}" aria-selected="${i===S.sel}">
        <span class="mat in">${c.image?`<img src="${esc(resolveSrc(c.image))}" alt="" loading="lazy">`:`<span class="noimg">no image</span>`}</span>
        <span class="cap"><b>${esc(N.name(c))}</b><small>${esc(N.sub(c))||"&nbsp;"}</small></span>${chip(c)}</button>`).join("")}</div>`
    :`<div class="tablewrap"><table class="lv"><thead><tr>${N.cols.map(([h])=>`<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>
        ${list.map((c,i)=>`<tr data-i="${i}" tabindex="0" aria-selected="${i===S.sel}">${N.cols.map(([,f],j)=>{ const v=typeof f==="function"?f(c):c[f];
          return j===1?`<td><b>${esc(v)}</b>${chip(c)}</td>`:`<td>${esc(v)}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
  pane.innerHTML=`<div class="ltool">
      <button class="btn out" data-act="new"><span data-icon="new"></span>New ${N.noun}</button>
      <button class="btn out" data-act="edit"${dis}><span data-icon="props"></span>Properties</button>
      <button class="btn out" data-act="del"${dis}><span data-icon="del"></span>Delete</button>
      <span class="vsep"></span>
      <button class="btn out sq" data-act="up" title="Move up (Alt+↑)" aria-label="Move up"${dis}>▲</button>
      <button class="btn out sq" data-act="down" title="Move down (Alt+↓)" aria-label="Move down"${dis}>▼</button>
      <span class="count">${list.length} item${list.length===1?"":"s"}</span>
    </div>${body}${S.view==="certificates"?`<div class="dropov" aria-hidden="true"><span>Drop to add a new ${N.noun}</span></div>`:""}`;
  hydrate(pane); syncTools();
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
    const ap=e.target.closest(".applet");
    if(ap){ if(ap.dataset.go) go(ap.dataset.go); else msgbox("Coming soon",`<p><b>${esc($(".al",ap).textContent)}</b> will be editable in the next update.</p>`,"info"); return; }
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
    else if(e.target.closest(".tiles,.tablewrap,.empty")===null&&e.target===pane) select(-1);
  });
  pane.addEventListener("dblclick",e=>{ const it=e.target.closest("[data-i]"); if(it&&!coarse) openEditor(S.view,+it.dataset.i); });
  pane.addEventListener("keydown",e=>{
    const it=e.target.closest("[data-i]"); if(!it) return;
    const i=+it.dataset.i, k=S.view, n=S.draft[k].length;
    if(e.key==="Enter"){ e.preventDefault(); select(i); openEditor(k,i); }
    else if(e.key==="Delete"){ e.preventDefault(); select(i); removeItem(k,i); }
    else if(/^Arrow(Up|Down|Left|Right)$/.test(e.key)){
      if(S.view!=="certificates"&&/Left|Right/.test(e.key)) return;
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
  if(top){ const form=$("form.edit",top); if(form?._setImage){ e.preventDefault(); form._setImage(f); } return; }
  if(S.view==="certificates"&&S.draft){ e.preventDefault(); openEditor("certificates",-1,f); }
});
document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){ e.preventDefault(); if(S.draft&&!topModal()) openPublish(); }
});
addEventListener("beforeunload",e=>{ if(isDirty()){ e.preventDefault(); e.returnValue=""; } });

/* ---------- list actions ---------- */
async function removeItem(k,i){
  const N=SECTIONS[k], it=S.draft[k][i]; if(!it) return;
  const a=await msgbox(`Confirm ${N.noun} delete`,`<p>Are you sure you want to delete “${esc(N.name(it))}”?</p>${it.image?`<p class="muted">Its image file is cleaned up when you publish.</p>`:""}`,"warn",[["Yes","yes",true],["No","no"]]);
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
  const N=SECTIONS[k], list=S.draft[k];
  if(i<0){ const at=N.addAt==="top"?0:list.length; list.splice(at,0,next); S.changes.set(next,{sec:k,type:"add"}); S.sel=at; }
  else{ if(JSON.stringify(orig)===JSON.stringify(next)) return;
    const was=S.changes.get(orig); S.changes.delete(orig); list[i]=next; S.changes.set(next,{sec:k,type:was?.type==="add"?"add":"edit"}); S.sel=i; }
  render(); focusSel();
}

/* ---------- item editor ---------- */
function parseMonth(v){ if(!v) return ["",""]; const m=/^(?:([A-Za-z]{3})[a-z]*\.?\s+)?(\d{4})$/.exec(String(v).trim());
  if(!m) return null; const mm=m[1]?MONTHS.find(x=>x.toLowerCase()===m[1].toLowerCase())||"":""; return [mm,m[2]]; }
function fieldHTML(f,item,k){
  const id="f_"+f.k, v=item[f.k]??"";
  const row=(ctl,lab=true)=>`${lab?`<label class="fl" for="${id}">${esc(f.label)}${f.req?"<i>*</i>":""}</label>`:`<span class="fl">${esc(f.label)}</span>`}<div class="fv">${ctl}</div>`;
  if(f.t==="text"){
    const opts=f.suggest?[...new Set(S.draft[k].map(x=>x[f.k]).filter(Boolean))].sort():[];
    return row(`<input class="inp" id="${id}" name="${f.k}" value="${esc(v)}" placeholder="${esc(f.ph||"")}" spellcheck="${f.k==="course"||f.k==="title"||f.k==="note"||f.k==="result"}"${opts.length?` list="${id}_l"`:""}>`
      +(opts.length?`<datalist id="${id}_l">${opts.map(o=>`<option value="${esc(o)}">`).join("")}</datalist>`:""));
  }
  if(f.t==="year") return row(`<input class="inp yr" id="${id}" name="${f.k}" value="${esc(v)}" inputmode="numeric" maxlength="4" placeholder="${thisYear()}">`);
  if(f.t==="month"){
    const p=parseMonth(v);
    if(!p) return row(`<input class="inp" id="${id}" name="${f.k}" value="${esc(v)}">`);
    return row(`<span class="pair"><select class="inp" id="${id}" name="${f.k}_m" aria-label="Month"><option value="">month</option>${MONTHS.map(m=>`<option${m===p[0]?" selected":""}>${m}</option>`).join("")}</select>
      <input class="inp yr" name="${f.k}_y" value="${esc(p[1])}" inputmode="numeric" maxlength="4" placeholder="year" aria-label="Year"></span>`);
  }
  if(f.t==="place") return row(`<div class="places" role="radiogroup" aria-label="Place">${[["","None"],[1,"1st"],[2,"2nd"],[3,"3rd"]].map(([pv,t])=>
      `<label class="rad"><input type="radio" name="${f.k}" value="${pv}"${String(v??"")===String(pv)?" checked":""}>${pv?`<span data-icon="trophy" data-metal="${pv}"></span>`:""}${t}</label>`).join("")}</div>
      <small class="muted">1st to 3rd also puts a trophy on the shelf.</small>`,false);
  return "";
}
function readForm(form,N,item){
  const E=form.elements;
  for(const f of N.fields){
    if(f.t==="text"||f.t==="year") item[f.k]=E[f.k].value.trim();
    if(f.t==="month") item[f.k]=E[f.k+"_m"]?[E[f.k+"_m"].value,E[f.k+"_y"].value.trim()].filter(Boolean).join(" "):E[f.k].value.trim();
    if(f.t==="place"){ const c=$(`[name="${f.k}"]:checked`,form)?.value; item[f.k]=c?+c:null; }
  }
}
function validate(form,N,item){
  $$(".ferr",form).forEach(x=>x.remove()); $$(".bad",form).forEach(x=>x.classList.remove("bad"));
  let first=null;
  const fail=(name,msg)=>{ const inp=form.elements[name]; if(!inp||inp.classList.contains("bad")) return; inp.classList.add("bad"); inp.setAttribute("aria-invalid","true");
    inp.closest(".fv").append(el(`<div class="ferr" role="alert">${esc(msg)}</div>`)); first=first||inp; };
  for(const f of N.fields){
    if(f.req&&!String(item[f.k]??"").trim()) fail(f.k,`Please type the ${f.label.toLowerCase()} name.`.replace(" name name"," name"));
    if(f.t==="year"&&item[f.k]&&!/^\d{4}$/.test(item[f.k])) fail(f.k,"Use a 4-digit year, like 2026.");
    if(f.t==="month"&&form.elements[f.k+"_m"]){ const y=form.elements[f.k+"_y"].value.trim();
      if(y&&!/^\d{4}$/.test(y)) fail(f.k+"_y","Use a 4-digit year, like 2026."); else if(form.elements[f.k+"_m"].value&&!y) fail(f.k+"_y","Add the year too."); }
  }
  first?.focus(); return !first;
}
function openEditor(k,i,file){
  const N=SECTIONS[k], isNew=i<0, orig=isNew?null:S.draft[k][i]; if(!isNew&&!orig) return;
  const item=isNew?N.blank():clone(orig), imgF=N.fields.find(f=>f.t==="image"), st={file:null,cleared:false,busy:"",err:""};
  const form=el(`<form class="edit${imgF?" withimg":""}" novalidate autocomplete="off"></form>`);
  form.innerHTML=(imgF?`<div class="imgcol">
      <div class="drop in" tabindex="0" role="button" aria-label="Choose the ${esc(imgF.label.toLowerCase())} image"></div>
      <div class="imgbtns"><button type="button" class="btn out" data-img="browse">Browse…</button><button type="button" class="btn out" data-img="clear">Remove</button></div>
      <input type="file" accept="image/*,application/pdf,.pdf" hidden>
      <p class="finfo" aria-live="polite"></p></div>`:"")
    +`<div class="form">${N.fields.filter(f=>f.t!=="image").map(f=>fieldHTML(f,item,k)).join("")}</div>`;
  dialog({title:`${isNew?"New":"Edit"} ${N.noun}`,icon:N.icon,body:form,cls:imgF?"wide":"",buttons:[["OK","ok",true],["Cancel","cancel"]],
    onAction:a=>{
      if(a!=="ok"){ if(st.file) URL.revokeObjectURL(st.file.url); return true; }
      if(st.busy) return false;
      const next=clone(item); readForm(form,N,next);
      if(!validate(form,N,next)) return false;
      if(imgF){
        if(st.file){ const p=uniquePath(imgF.folder,slug(imgF.slug(next).filter(Boolean).join(" "))||N.noun,st.file.ext);
          S.pending.set(p,{blob:st.file.blob,url:st.file.url}); next[imgF.k]=p; }
        else if(st.cleared) next[imgF.k]="";
      }
      apply(k,i,orig,next); return true;
    }});
  if(imgF) wireImage(form,imgF,item,st,N);
  if(file) form._setImage(file);
}
function wireImage(form,f,item,st,N){
  const drop=$(".drop",form), inp=$("input[type=file]",form), info=$(".finfo",form), clear=$("[data-img=clear]",form);
  const current=()=>st.file?st.file.url:(!st.cleared&&item[f.k]?resolveSrc(item[f.k]):"");
  const target=()=>{ const n=clone(item); readForm(form,N,n); return `${f.folder}/${slug(f.slug(n).filter(Boolean).join(" "))||N.noun}.${st.file.ext}`; };
  const paintInfo=()=>{
    info.classList.toggle("bad",!!st.err);
    info.innerHTML=st.err?`<span data-icon="err"></span>${esc(st.err)}`
      :st.file?`New file · ${st.file.w}×${st.file.h} · ${kb(st.file.size)}<br>Saved as <code>${esc(target())}</code>`
      :current()?`<code>${esc(item[f.k])}</code>`:"No image yet. The site shows a placeholder until you add one.";
    hydrate(info);
  };
  const paint=()=>{
    const cur=current();
    drop.classList.toggle("has",!!cur&&!st.busy);
    drop.innerHTML=st.busy?`<span class="busy">${esc(st.busy)}<span class="prog in marquee"><i></i></span></span>`
      :cur?`<img src="${esc(cur)}" alt="Preview">`:`<span class="ph"><span data-icon="picture" class="big"></span>Drop an image or PDF here<br><u>or click to browse</u></span>`;
    hydrate(drop); clear.disabled=!cur||!!st.busy; paintInfo();
  };
  form._setImage=async file=>{
    st.err=""; st.busy=(file.type==="application/pdf"||/\.pdf$/i.test(file.name))?"Reading PDF…":"Preparing image…"; paint();
    try{ const r=await prepareImage(file,f.max); if(st.file) URL.revokeObjectURL(st.file.url); st.file=r; st.cleared=false; }
    catch(e){ st.err=e.message; }
    st.busy=""; paint();
    if(!st.err){ const first=$(".form input",form); if(first&&!first.value) first.focus(); }
  };
  drop.addEventListener("click",()=>{ if(!st.busy) inp.click(); });
  drop.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); if(!st.busy) inp.click(); } });
  inp.addEventListener("change",()=>{ if(inp.files[0]) form._setImage(inp.files[0]); inp.value=""; });
  $("[data-img=browse]",form).addEventListener("click",()=>inp.click());
  clear.addEventListener("click",()=>{ if(st.file){ URL.revokeObjectURL(st.file.url); st.file=null; } st.cleared=true; st.err=""; paint(); });
  form.addEventListener("input",()=>{ if(st.file) paintInfo(); });
  const ov=form.closest(".modal");
  ov.addEventListener("dragover",e=>{ e.preventDefault(); drop.classList.add("over"); });
  ov.addEventListener("dragleave",e=>{ if(!ov.contains(e.relatedTarget)) drop.classList.remove("over"); });
  ov.addEventListener("drop",e=>{ e.preventDefault(); e.stopPropagation(); drop.classList.remove("over"); const fl=e.dataTransfer.files[0]; if(fl) form._setImage(fl); });
  paint();
}

/* ---------- publish ---------- */
function openPublish(){
  if(!isDirty()||topModal()) return;
  const lines=changeLines(), newRefs=localRefs(S.draft), oldRefs=localRefs(S.original);
  const uploads=[...S.pending].filter(([p])=>newRefs.has(p));
  const unused=[...oldRefs].filter(p=>!newRefs.has(p)&&S.files.has(p));
  const subject=lines.length===1?lines[0]:lines.length?`Update site content (${lines.length} changes)`:"Update site content";
  const body=el(`<div class="pub">
    <p>These changes are saved to <b>${esc(S.owner)}/${esc(S.repo)}</b> on GitHub. Your site shows them about a minute later.</p>
    <fieldset class="grp"><legend>Changes</legend><ul class="chg">${(lines.length?lines:["Content edits"]).map(l=>`<li>${esc(l)}</li>`).join("")}</ul></fieldset>
    ${uploads.length?`<fieldset class="grp"><legend>Files to upload</legend><ul class="files">${uploads.map(([p,f])=>`<li><span data-icon="picture"></span><code>${esc(p)}</code> <small class="muted">${kb(f.blob.size)}</small></li>`).join("")}</ul></fieldset>`:""}
    ${unused.length?`<fieldset class="grp"><legend>Files no longer used</legend>${unused.map(p=>`<label class="chk"><input type="checkbox" name="del" value="${esc(p)}" checked> Delete <code>${esc(p)}</code></label>`).join("")}</fieldset>`:""}
    <label class="msgl" for="pubmsg">Note for the history</label><input class="inp" id="pubmsg" value="${esc(subject)}" maxlength="120">
    <div class="pprog" hidden><p class="pstep">Starting…</p><div class="prog in"><i></i></div></div>
    <p class="perr ferr" role="alert" hidden></p>
  </div>`);
  let state="ask";
  dialog({title:"Publish to the web",icon:"save",body,cls:"pubdlg",buttons:[["Publish","go",true],["Cancel","cancel"]],
    onAction:async(a,d)=>{
      if(state==="busy") return false;
      if(a==="reload"){ d.close(); connect(true); return false; }
      if(a!=="go") return true;
      state="busy";
      $$(".dfoot button",d.el).forEach(b=>b.disabled=true); $(".dbody .ctl",d.el)?.setAttribute("disabled","");
      const prog=$(".pprog",body), err=$(".perr",body), bar=$(".prog i",body), stepEl=$(".pstep",body);
      prog.hidden=false; err.hidden=true;
      const dels=$$("[name=del]:checked",body).map(x=>x.value);
      const msg=($("#pubmsg",body).value.trim()||subject)+(lines.length>1?"\n\n"+lines.map(l=>"- "+l).join("\n"):"")+"\n\nPublished from the Control Panel.";
      try{
        const res=await publish(uploads,dels,msg,(t,p)=>{ stepEl.textContent=t; bar.style.width=Math.round(p)+"%"; });
        state="done";
        d.body.innerHTML=`<div class="msgrow"><span data-icon="info" class="big"></span><div><p><b>Published.</b> Your site updates in about a minute.</p>
          <p class="links"><a href="${SITE}" target="_blank" rel="noopener">Open my site ↗</a><a href="https://github.com/${esc(S.owner)}/${esc(S.repo)}/commit/${res.sha}" target="_blank" rel="noopener">See the commit on GitHub ↗</a></p></div></div>`;
        hydrate(d.body); d.setButtons([["OK","cancel",true]]); $(".dfoot .def",d.el).focus();
        watchLive(res.text); render();
      }catch(e){
        state="ask"; prog.hidden=true; err.hidden=false;
        err.innerHTML=`<span data-icon="err"></span>${esc(explain(e,true))}`+(e.conflict?" Reload to get the latest version. Your unpublished changes here will be lost, so note them down first.":" Nothing was changed on your site.");
        hydrate(err);
        if(e.conflict) d.setButtons([["Reload","reload",true],["Cancel","cancel"]]);
        else $$(".dfoot button",d.el).forEach(b=>b.disabled=false);
        $(".dbody .ctl",d.el)?.removeAttribute("disabled");
      }
      return false;
    }});
}
function watchLive(text){
  clearInterval(S.watch); let n=0;
  S.liveMsg="Published · waiting for GitHub Pages…"; renderStatus();
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
  <li>Open a section and add, edit, reorder or delete items. Images are resized and named for you.</li>
  <li>Your edits wait in this window. Nothing on the site changes yet.</li>
  <li>Press <b>Publish</b>. Everything is saved to GitHub as one commit.</li>
  <li>GitHub Pages rebuilds the site in about a minute. The status bar says when it's live.</li></ol>
  <p class="muted">Every publish stays in your repository's history, so an older version can always be recovered.</p>`,"info"); }
function about(){ msgbox("About Control Panel",`<p><b>HatheemOS 98 Control Panel</b></p><p>Edits <code>${CONTENT_PATH}</code> in <b>${esc(S.owner)}/${esc(S.repo)}</b> through the GitHub API.</p>
  <p class="muted">Your token is stored only in this browser. Sign out (File menu) to remove it.</p>`,"cpl"); }

function detectRepo(){
  try{ const saved=JSON.parse(localStorage.getItem("cp_repo")||"null"); if(saved?.owner&&saved?.repo) return saved; }catch(e){}
  const m=/^([a-z0-9-]+)\.github\.io$/i.exec(location.hostname);
  if(!m) return {owner:"",repo:""};
  const seg=location.pathname.split("/").filter(Boolean), i=seg.indexOf("admin");
  return {owner:m[1],repo:i>0?seg[i-1]:`${m[1]}.github.io`};
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
