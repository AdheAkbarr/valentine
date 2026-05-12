/* ============================================
   ANGELINA'S 22ND BIRTHDAY — script.js v2.0
   ============================================ */
(function () {
"use strict";
gsap.registerPlugin(ScrollTrigger);

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
let currentScene = 1;
let sceneInitialized = {};
let PHOTOS = { bloom:[], timeline:[], gift:[], letter:[], gallery:[] };
let CONFIG = { name:"Angelina Meirella", age:22, date:"May 13, 2026", signature:"Your BB ♥" };

/* ─── PHOTO BUBBLE HELPERS (Comment 3) ─── */
function spawnPhotoBubble(parent, src, opts={}) {
    const size = opts.size || (70 + Math.random()*50);
    const bubble = document.createElement('div');
    bubble.className = 'photo-bubble' + (opts.extraClass ? ' '+opts.extraClass : '');
    bubble.style.width = size+'px'; bubble.style.height = size+'px';
    const inner = document.createElement('div');
    inner.className = 'photo-bubble-inner';
    inner.style.backgroundImage = `url('${src}')`;
    bubble.appendChild(inner);
    const x = opts.x != null ? opts.x : (Math.random()*90)+'%';
    const y = opts.y != null ? opts.y : (Math.random()*90)+'%';
    bubble.style.left = x; bubble.style.top = y;
    if(opts.opacity != null) bubble.style.opacity = opts.opacity;
    parent.appendChild(bubble);
    gsap.fromTo(bubble,{scale:0,opacity:0},{scale:1,opacity:opts.opacity||1,duration:0.6,ease:'back.out(1.7)'});
    const drift = opts.drift || 30;
    const dur = opts.duration || (8+Math.random()*8);
    gsap.to(bubble,{y:'+='+(drift*(Math.random()>.5?1:-1)),x:'+='+(drift*(Math.random()>.5?1:-1)),
        duration:dur,ease:'sine.inOut',yoyo:true,repeat:-1});
    if(opts.interactive !== false) initTilt([bubble]);
    return bubble;
}
function spawnPhotoBubbleField(parent, srcs, count, area={}) {
    if(!srcs||!srcs.length) return;
    const radius = area.radius||200;
    const ox = area.originX||'50%', oy = area.originY||'50%';
    const actualCount = Math.min(count||6, srcs.length);
    for(let i=0;i<actualCount;i++){
        const angle = (i/actualCount)*Math.PI*2 + (Math.random()-.5)*.5;
        const r = radius*.5 + Math.random()*radius*.5;
        const cx = Math.cos(angle)*r, cy = Math.sin(angle)*r;
        const size = area.sizeMin ? area.sizeMin+Math.random()*(area.sizeMax-area.sizeMin) : 70+Math.random()*50;
        const folder = area.folder||'';
        const src = folder ? `assets/photos/${folder}/${srcs[i%srcs.length]}` : srcs[i%srcs.length];
        setTimeout(()=>{
            spawnPhotoBubble(parent, src, {
                size, x:`calc(${ox} + ${cx}px)`, y:`calc(${oy} + ${cy}px)`,
                extraClass:area.extraClass||'', drift:area.drift||30,
                duration:area.durationRange?area.durationRange[0]+Math.random()*(area.durationRange[1]-area.durationRange[0]):undefined,
                opacity:area.opacity||1, interactive:area.interactive!==false
            });
        }, i*(area.stagger||200));
    }
}

/* ─── POLAROID STACK (Comment 6) ─── */
function renderPolaroidStack(srcs) {
    const stack = $('#polaroidStack');
    if(!stack||!srcs||!srcs.length) return;
    stack.innerHTML = '';
    srcs.forEach(src=>{
        const div = document.createElement('div');
        div.className = 'polaroid';
        const img = document.createElement('img');
        img.src = `assets/photos/gift/${src}`; img.loading='lazy';
        div.appendChild(img); stack.appendChild(div);
    });
    gsap.from('.polaroid',{opacity:0,y:60,scale:0.7,stagger:0.15,ease:'back.out(1.7)',duration:0.8});
}

/* ─── GALLERY SCENE (Comment 8) ─── */
let galleryImages=[], lightboxIdx=0;
function playSceneGallery() {
    const grid=$('#galleryGrid');
    if(!grid) return;
    gsap.to('#galleryTitle',{opacity:1,y:0,duration:.9,ease:'power3.out',delay:.3});
    grid.innerHTML='';
    galleryImages = PHOTOS.gallery.map(f=>`assets/photos/gallery/${f}`);
    if(!galleryImages.length){
        grid.innerHTML='<p style="color:var(--tosca-pale);opacity:.6;">Add photos to assets/photos/gallery/ and update photos.json</p>';
        return;
    }
    galleryImages.forEach((src,i)=>{
        const tile=document.createElement('div');
        tile.className='gallery-tile';
        tile.style.backgroundImage=`url('${src}')`;
        tile.addEventListener('click',()=>openLightbox(i));
        grid.appendChild(tile);
    });
    const tiles = [...grid.querySelectorAll('.gallery-tile')];
    tiles.forEach((tile,i)=>{
        const dir=Math.floor(Math.random()*4);
        const from = [{x:0,y:-window.innerHeight*0.6},{x:0,y:window.innerHeight*0.6},{x:-window.innerWidth*0.6,y:0},{x:window.innerWidth*0.6,y:0}][dir];
        gsap.fromTo(tile,{...from,opacity:0,scale:0.4,rotation:(Math.random()-.5)*180},{x:0,y:0,opacity:1,scale:1,rotation:0,duration:1.1,delay:0.05+i*0.07,ease:'back.out(1.4)',onComplete:()=>{
            gsap.to(tile,{y:'+='+(8+Math.random()*10),rotation:(Math.random()-.5)*3,duration:3+Math.random()*2,ease:'sine.inOut',yoyo:true,repeat:-1});
        }});
        tile.addEventListener('mouseenter',()=>burstSparkles(tile));
    });
    initTilt(tiles);
}
function openLightbox(idx) {
    lightboxIdx=idx;
    const lb=$('#galleryLightbox'),img=$('#lightboxImg');
    img.src=galleryImages[idx]; lb.classList.add('is-open');
}
function closeLightbox(){$('#galleryLightbox').classList.remove('is-open');}
function lightboxNav(dir){
    lightboxIdx=(lightboxIdx+dir+galleryImages.length)%galleryImages.length;
    $('#lightboxImg').src=galleryImages[lightboxIdx];
}

/* ─── SCENE TRANSITION ─── */
function goToScene(n) {
    const curSel = typeof currentScene === 'string' ? `#scene${currentScene.charAt(0).toUpperCase()+currentScene.slice(1)}` : `#scene${currentScene}`;
    const nxtSel = typeof n === 'string' ? `#scene${n.charAt(0).toUpperCase()+n.slice(1)}` : `#scene${n}`;
    const cur = $(curSel), nxt = $(nxtSel);
    if (!nxt || currentScene === n) return;
    gsap.timeline()
        .to(cur, { opacity:0, duration:0.7, ease:"power2.inOut",
            onComplete:() => { cur.classList.remove("active"); cur.style.visibility="hidden"; }})
        .set(nxt, { visibility:"visible", opacity:0 })
        .to(nxt, { opacity:1, duration:0.7, ease:"power2.inOut",
            onComplete:() => { nxt.classList.add("active"); currentScene=n; initScene(n); }});
}
function initScene(n) {
    if(sceneInitialized[n]) return;
    sceneInitialized[n] = true;
    const fns = { 1:playScene1, 2:playScene2, 3:playScene3, gallery:playSceneGallery, 4:playScene4, 5:playScene5 };
    fns[n] && fns[n]();
}

/* ─── SPLIT TEXT (word-by-word reveal) ─── */
function splitWords(el) {
    const text = el.innerText;
    el.innerHTML = text.split(" ").map(w =>
        `<span class="word"><span class="word-inner">${w}</span></span>`
    ).join(" ");
    return el.querySelectorAll(".word-inner");
}

/* ─── 3D TILT ─── */
function initTilt(cards) {
    cards.forEach(card => {
        card.addEventListener("mousemove", e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top)  / r.height - 0.5;
            gsap.to(card, { rotateY:x*18, rotateX:-y*18, scale:1.04,
                duration:0.4, ease:"power2.out",
                boxShadow:`${-x*20}px ${y*20}px 40px rgba(0,0,0,0.4),0 0 30px rgba(64,224,208,0.15)` });
        });
        card.addEventListener("mouseleave", () => {
            gsap.to(card, { rotateY:0, rotateX:0, scale:1,
                duration:0.5, ease:"power3.out", boxShadow:"" });
        });
    });
}

/* ─── MAGNETIC BUTTONS ─── */
function initMagnetic() {
    $$(".btn-magnetic").forEach(btn => {
        btn.addEventListener("mousemove", e => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width/2) * 0.35;
            const y = (e.clientY - r.top  - r.height/2) * 0.35;
            gsap.to(btn, { x, y, duration:0.3, ease:"power2.out" });
        });
        btn.addEventListener("mouseleave", () =>
            gsap.to(btn, { x:0, y:0, duration:0.5, ease:"elastic.out(1,0.4)" }));
    });
}

/* ─── SPARKLE CANVAS (Scene 1) ─── */
function initSparkleCanvas() {
    const cv = $("#sparkleCanvas1"), ctx = cv.getContext("2d");
    const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
    resize(); addEventListener("resize", resize);
    let mx=-9999, my=-9999;
    window.addEventListener("mousemove", e => { mx=e.clientX; my=e.clientY; });
    window.addEventListener("mouseleave", () => { mx=-9999; my=-9999; });
    const pts = Array.from({length:70}, () => ({
        x:Math.random()*innerWidth, y:Math.random()*innerHeight,
        r:Math.random()*2+0.5, vx:(Math.random()-.5)*.2,
        vy:-(Math.random()*.35+.1), a:Math.random()*.5+.2,
        ph:Math.random()*Math.PI*2
    }));
    (function loop() {
        ctx.clearRect(0,0,cv.width,cv.height);
        pts.forEach(p => {
            let dx = p.x - mx, dy = p.y - my, dist2 = dx*dx + dy*dy, R = 120;
            if (dist2 < R*R) {
                let dist = Math.sqrt(dist2), force = (R - dist) / R;
                p.vx += (dx/dist) * force * 1.8;
                p.vy += (dy/dist) * force * 1.8;
            }
            p.vx *= 0.96; p.vy *= 0.96;
            p.ph += .02; p.x += p.vx; p.y += p.vy;
            if (p.y < -10) { p.y = cv.height+10; p.x = Math.random()*cv.width; }
            const a = p.a*(0.5+0.5*Math.sin(p.ph));
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fillStyle = `rgba(64,224,208,${a})`; ctx.fill();
            ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3.5,0,Math.PI*2);
            ctx.fillStyle = `rgba(64,224,208,${a*.12})`; ctx.fill();
        });
        requestAnimationFrame(loop);
    })();
}

/* ─── BURST SPARKLES HELPER ─── */
function burstSparkles(el) {
    const rect = el.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        const spark = document.createElement('span');
        spark.className = 'name-spark';
        spark.textContent = '✨';
        spark.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width) + 'px';
        spark.style.top = (rect.top + rect.height / 2 + (Math.random() - 0.5) * rect.height) + 'px';
        document.body.appendChild(spark);
        gsap.fromTo(spark,
            { scale: 0, opacity: 0, x: 0, y: 0 },
            { scale: 1 + Math.random(), opacity: 0, x: (Math.random() - 0.5) * 180, y: (Math.random() - 0.5) * 120,
              duration: 1.4, ease: 'power2.out', onComplete: () => spark.remove() });
    }
}

/* ─── SCENE 1 ─── */
function playScene1() {
    const tl = gsap.timeline({ delay:.4 });
    tl.fromTo(".spotlight",{scale:0,opacity:0},{scale:1,opacity:1,duration:1.8,ease:"power2.out"})
      .to(".pre-title",{opacity:1,duration:1,ease:"power2.out"},"-=0.8");

    // Word-by-word reveal for .line1 only (skip .script-name to preserve gradient)
    const line1El = $(".line1 .split-text");
    if (line1El) {
        const words1 = splitWords(line1El);
        tl.fromTo(words1,{y:"110%"},{y:"0%",duration:0.9,
            stagger:0.08,ease:"power4.out"},"-=0.3");
        tl.set(".line1",{opacity:1},`<`);
    }

    // Reveal .script-name (line2) as a whole block to preserve background-clip shimmer
    const scriptNameEl = $('.script-name');
    if (scriptNameEl) {
        tl.fromTo(scriptNameEl,{opacity:0,y:40,scale:0.85},{opacity:1,y:0,scale:1,
            duration:1.2,ease:"back.out(1.7)"},"-=0.5");
        tl.set(".line2",{opacity:1},`<`);
    }

    tl.to(".title-ornament",{opacity:1,duration:.8},"-=.2")
      .call(()=>burstSparkles($('.script-name')))
      .to("#btnBegin",{opacity:1,scale:1,duration:.8,ease:"back.out(1.7)"},"-=.2");
}

/* ─── STORM CANVAS (Scene 2) ─── */
let stormIntensity = 1, stormId = null;
function initStormCanvas() {
    const cv = $("#stormCanvas"), ctx = cv.getContext("2d");
    cv.width = innerWidth; cv.height = innerHeight;
    const drops = Array.from({length:220}, () => ({
        x:Math.random()*cv.width, y:Math.random()*cv.height,
        len:Math.random()*22+10, spd:Math.random()*8+4,
        a:Math.random()*.3+.1
    }));
    let ltAlpha=0, ltTimer=0;
    function frame() {
        ctx.clearRect(0,0,cv.width,cv.height);
        ltTimer++;
        if (ltTimer > 130+Math.random()*220) { ltAlpha=.3+Math.random()*.25; ltTimer=0; }
        if (ltAlpha > 0) {
            ctx.fillStyle=`rgba(180,230,230,${ltAlpha*stormIntensity})`;
            ctx.fillRect(0,0,cv.width,cv.height); ltAlpha*=.82;
        }
        drops.forEach(d => {
            ctx.globalAlpha=d.a*stormIntensity;
            ctx.strokeStyle="rgba(100,200,200,.3)"; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(d.x-1,d.y+d.len); ctx.stroke();
            d.y+=d.spd*stormIntensity; d.x-=.5*stormIntensity;
            if(d.y>cv.height){d.y=-d.len;d.x=Math.random()*cv.width;}
        });
        ctx.globalAlpha=1;
        stormId=requestAnimationFrame(frame);
    }
    frame();
}
function fadeStorm() {
    const obj={v:stormIntensity};
    gsap.to(obj,{v:0,duration:2.5,ease:"power2.inOut",
        onUpdate:()=>{stormIntensity=obj.v;}});
}

/* ─── SCENE 2 ─── */
function playScene2() {
    stormIntensity=1;
    initStormCanvas();
    const tl = gsap.timeline({delay:.4});
    tl.to("#stormText1",{opacity:1,duration:1.5,ease:"power2.out"})
      .to("#stormText1",{opacity:0,duration:1,ease:"power2.in"},"+=2")
      .to("#stormText2",{opacity:1,duration:1.5,ease:"power2.out"})
      .to("#stormText2",{opacity:0,duration:1,ease:"power2.in"},"+=2")
      .call(()=>fadeStorm())
      .to("#scene2",{background:"linear-gradient(180deg,#0d2626,#004D4D,#006D6F)",duration:2.5},"+=0")
      .to("#bloomContainer",{opacity:1,duration:.5})
      .call(()=>{ $(".flower-glow-ring").style.opacity="0.5"; })
      .to(".petal.outer",{opacity:1,scale:1,duration:1.2,stagger:0.07,ease:"back.out(2)"})
      .to(".petal.mid", {opacity:1,scale:1,duration:1,  stagger:0.06,ease:"back.out(2)"},"-=0.8")
      .to(".petal.inner",{opacity:1,scale:1,duration:.8, stagger:0.05,ease:"back.out(2)"},"-=0.6")
      .to(".flower", { scale: 1.04, duration: 1.6, ease:"sine.inOut", repeat:-1, yoyo:true }, ">")
      .to(".flower-center",{opacity:1,scale:1,duration:.6,ease:"back.out(2)"},"-=0.3")
      .to(".flower-glow-ring",{opacity:.5,duration:.5},"-=.5")
      .call(()=>spawnPhotoBubbleField($('#bloomContainer'), PHOTOS.bloom, 8, {radius:260, originX:'50%', originY:'50%', extraClass:'bloom-bubble', sizeMin:70, sizeMax:120, stagger:200, folder:'bloom'}))
      .to("#bloomCaption",{opacity:1,y:0,duration:.8,ease:"power2.out"})
      .to("#btnContinue",{opacity:1,duration:.6,ease:"power2.out"});

    // Parallax on flower
    const fl=$("#flower");
    document.addEventListener("mousemove",e=>{
        if(currentScene!==2)return;
        const dx=(e.clientX-innerWidth/2)/innerWidth*2;
        const dy=(e.clientY-innerHeight/2)/innerHeight*2;
        gsap.to(fl,{x:dx*18,y:dy*18,rotateX:-dy*8,rotateY:dx*8,
            duration:.6,ease:"power2.out"});
    });
}

/* ─── FLOATING PARTICLE (Scene 3) ─── */
function initParticle3() {
    const cv=$("#particleCanvas3"),ctx=cv.getContext("2d");
    cv.width=innerWidth;cv.height=innerHeight;
    const pts=Array.from({length:45},()=>({
        x:Math.random()*cv.width,y:Math.random()*cv.height,
        r:Math.random()*2+.5,vx:(Math.random()-.5)*.25,
        vy:(Math.random()-.5)*.25,a:Math.random()*.4+.1,
        ph:Math.random()*Math.PI*2
    }));
    (function loop(){
        ctx.clearRect(0,0,cv.width,cv.height);
        pts.forEach(p=>{
            p.ph+=.015;p.x+=p.vx;p.y+=p.vy;
            if(p.x<0)p.x=cv.width;if(p.x>cv.width)p.x=0;
            if(p.y<0)p.y=cv.height;if(p.y>cv.height)p.y=0;
            const a=p.a*(0.5+0.5*Math.sin(p.ph));
            ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
            ctx.fillStyle=`rgba(64,224,208,${a})`;ctx.fill();
        });
        if(currentScene===3)requestAnimationFrame(loop);
    })();
}

/* ─── SCENE 3: ScrollTrigger Timeline ─── */
function playScene3() {
    initParticle3();
    const scroll = $("#scene3Scroll");

    // Title reveal
    gsap.to("#timelineTitle",{opacity:1,y:0,duration:.9,ease:"power3.out",delay:.3});
    gsap.to("#timelineSub",  {opacity:1,y:0,duration:.7,ease:"power3.out",delay:.55});

    // ScrollTrigger: line grows
    gsap.to("#timelineLine",{
        height:"100%", duration:1.5, ease:"none",
        scrollTrigger:{
            trigger:"#timeline", scroller:scroll,
            start:"top 80%", end:"bottom 20%",
            scrub:1
        }
    });

    // Travel dot follows scroll
    gsap.to("#travelDot",{opacity:1,duration:.3,delay:.8});
    const nodes=[...$$("#timeline .timeline-node")];
    const totalNodes=nodes.length;

    // Inject timeline thumbnails (Comment 5)
    nodes.forEach((node,i)=>{
        const src = PHOTOS.timeline[i];
        if(src){
            const img = new Image();
            img.src = `assets/photos/timeline/${src}`;
            img.loading='lazy'; img.decoding='async';
            img.className='node-thumb-img';
            node.querySelector('.node-card').prepend(img);
        }
    });

    nodes.forEach((node,i)=>{
        // Node slide-in
        gsap.to(node,{
            opacity:1, x:0, duration:.8, ease:"power3.out",
            scrollTrigger:{
                trigger:node, scroller:scroll,
                start:"top 85%", toggleActions:"play none none none"
            }
        });
        // Travel dot jumps to each node
        gsap.to("#travelDot",{
            top:`${(i+1)*100/totalNodes}%`,duration:.6,ease:"power2.inOut",
            scrollTrigger:{
                trigger:node,scroller:scroll,
                start:"top 60%",toggleActions:"play none none none",
                onEnter: () => {
                    node.classList.add("is-active");
                    gsap.delayedCall(0.6, () => node.classList.remove("is-active"));
                    const ping = document.createElement("div");
                    ping.className = "travel-ping";
                    node.querySelector(".node-dot").appendChild(ping);
                    setTimeout(()=>ping.remove(), 1100);
                }
            }
        });
        // Spawn emoji at node
        gsap.set(node,{position:"relative"});
        gsap.delayedCall(.3+i*.15,()=>{
            if(currentScene!==3)return;
            const ico=node.getAttribute("data-icon");
            const sp=document.createElement("span");
            sp.textContent=ico;
            sp.style.cssText="position:absolute;font-size:1.6rem;top:0;left:50%;"+
                "transform:translateX(-50%);pointer-events:none;z-index:20;";
            node.appendChild(sp);
            gsap.fromTo(sp,{y:0,opacity:1,scale:.5},
                {y:-50,opacity:0,scale:1.3,duration:1.8,ease:"power2.out",
                onComplete:()=>sp.remove()});
        });
    });

    // Show Next button after last node
    gsap.to("#btnGift",{opacity:1,duration:.6,ease:"power2.out",
        scrollTrigger:{trigger:nodes[nodes.length-1],scroller:scroll,
            start:"top 50%",toggleActions:"play none none none"}});

    // Init tilt on timeline cards
    initTilt($$(".tilt-card"));
}

/* ─── SCENE 4: Gift Box ─── */
let giftOpened = false;
function playScene4() {
    $("#giftReveal").style.display="none";
    gsap.set("#giftBoxWrapper",{opacity:0,scale:.5});
    gsap.set("#giftLid",{y:0,rotation:0,opacity:1});
    gsap.set("#giftBox",{rotation:0});
    gsap.set("#giftPrompt",{opacity:0});
    giftOpened = false;
    const tl=gsap.timeline({delay:.3});
    tl.to("#giftPrompt",{opacity:1,duration:.8,ease:"power2.out"})
      .to("#giftBoxWrapper",{opacity:1,scale:1,duration:1,ease:"back.out(1.7)"},"-=.3");
    initTilt([$("#giftBoxWrapper")]);
}

function openGift() {
    if(giftOpened)return; giftOpened=true;
    const tl=gsap.timeline();
    // Shake
    tl.to("#giftBox",{keyframes:[
        {rotation:-6,duration:.08},{rotation:6,duration:.08},
        {rotation:-6,duration:.08},{rotation:6,duration:.08},
        {rotation:0,duration:.1}]});
    // Lid flies off
    tl.to("#giftLid",{y:-140,rotation:-35,opacity:0,duration:.7,ease:"power3.out"});
    tl.call(()=>{ 
        launchConfetti();
        gsap.fromTo("#scene4", {x:0,y:0}, { keyframes: [{x:-12,y:6},{x:10,y:-8},{x:-8,y:10},{x:6,y:-4},{x:0,y:0}], duration:0.5, ease:"power2.out" });
    });
    tl.to("#giftBoxWrapper",{scale:0,opacity:0,duration:.5,ease:"power2.in"},"+=.3");
    tl.to("#giftPrompt",{opacity:0,duration:.3},"-=.5");
    tl.call(()=>{ $("#giftReveal").style.display="flex"; });
    tl.fromTo("#giftReveal",{opacity:0,scale:.7},
        {opacity:1,scale:1,duration:.9,ease:"back.out(1.7)"})
      .call(()=>renderPolaroidStack(PHOTOS.gift));
}

function launchConfetti() {
    const cv=$("#confettiCanvas"),ctx=cv.getContext("2d");
    cv.width=innerWidth; cv.height=innerHeight;
    const pts=Array.from({length:240},()=>{
        const ang=Math.random()*Math.PI*2, spd=Math.random()*14+5;
        const r = Math.random();
        let sh = r < 0.2 ? "heart" : (r < 0.4 ? "star" : (r < 0.7 ? "rect" : "circle"));
        let clrs = sh === "heart" ? ["#FF6B8A","#FFD700"] : (sh === "star" ? ["#FFD700","#FFECB3"] : ["#40E0D0","#FFD700","#7FFFD4","#FFECB3","#FF6B8A","#C084FC","#E0FFFF"]);
        return {x:cv.width/2,y:cv.height/2,
            vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd-6,
            sz:Math.random()*9+3, clr:clrs[Math.floor(Math.random()*clrs.length)],
            rot:Math.random()*360, rs:(Math.random()-.5)*12,
            gr:.1+Math.random()*.1, op:1, sh:sh};
    });
    let f=0;
    (function loop(){
        ctx.clearRect(0,0,cv.width,cv.height);
        let alive=false;
        pts.forEach(p=>{
            if(p.op<=0)return; alive=true;
            ctx.save(); ctx.translate(p.x,p.y);
            ctx.rotate(p.rot*Math.PI/180);
            ctx.globalAlpha=p.op; ctx.fillStyle=p.clr;
            if(p.sh==="rect") { ctx.fillRect(-p.sz/2,-p.sz/4,p.sz,p.sz/2); }
            else if(p.sh==="circle") { ctx.beginPath(); ctx.arc(0,0,p.sz/2,0,Math.PI*2); ctx.fill(); }
            else if(p.sh==="heart" || p.sh==="star") {
                ctx.font = `${p.sz*2}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
                ctx.fillText(p.sh==="heart" ? "♥" : "✦", 0, 0);
            }
            ctx.restore();
            p.x+=p.vx; p.y+=p.vy; p.vy+=p.gr;
            p.vx*=.99; p.rot+=p.rs;
            if(f>45)p.op-=.014;
        });
        f++;
        if(alive)requestAnimationFrame(loop);
    })();
}

/* ─── FIREFLIES CANVAS (Scene 5) ─── */
function initFireflies() {
    const cv=$("#firefliesCanvas"),ctx=cv.getContext("2d");
    cv.width=innerWidth; cv.height=innerHeight;
    let mx=-9999, my=-9999;
    window.addEventListener("mousemove", e => { mx=e.clientX; my=e.clientY; });
    window.addEventListener("mouseleave", () => { mx=-9999; my=-9999; });
    const flies=Array.from({length:55},()=>({
        x:Math.random()*cv.width, y:Math.random()*cv.height,
        sz:Math.random()*3+1, vx:(Math.random()-.5)*.5,
        vy:(Math.random()-.5)*.5, ph:Math.random()*Math.PI*2,
        ps:.012+Math.random()*.02
    }));
    (function loop(){
        ctx.clearRect(0,0,cv.width,cv.height);
        flies.forEach(f=>{
            let dx = f.x - mx, dy = f.y - my, dist2 = dx*dx + dy*dy, R = 100;
            if (dist2 < R*R) {
                let dist = Math.sqrt(dist2), force = (R - dist) / R;
                f.vx += (-dy/dist) * force * 1.2;
                f.vy += (dx/dist) * force * 1.2;
            }
            f.vx *= 0.96; f.vy *= 0.96;
            f.ph+=f.ps; f.x+=f.vx+Math.sin(f.ph)*.35; f.y+=f.vy+Math.cos(f.ph*.7)*.3;
            if(f.x<-20)f.x=cv.width+20; if(f.x>cv.width+20)f.x=-20;
            if(f.y<-20)f.y=cv.height+20; if(f.y>cv.height+20)f.y=-20;
            const a=.25+.6*Math.abs(Math.sin(f.ph));
            const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.sz*7);
            g.addColorStop(0,`rgba(64,224,208,${a*.45})`);
            g.addColorStop(1,"transparent");
            ctx.fillStyle=g;
            ctx.fillRect(f.x-f.sz*7,f.y-f.sz*7,f.sz*14,f.sz*14);
            ctx.beginPath(); ctx.arc(f.x,f.y,f.sz,0,Math.PI*2);
            ctx.fillStyle=`rgba(127,255,212,${a})`; ctx.fill();
        });
        if(currentScene===5)requestAnimationFrame(loop);
    })();
}

/* ─── SCENE 5: Love Letter ─── */
function playScene5() {
    initFireflies();
    // Reset letter state in case of re-entry
    $("#letterFullscreen").style.display="none";
    $("#letterFullscreen").style.opacity="0";
    $("#letterPaper").classList.remove("is-open");
    const bubLayer = $('#letterFullscreen .letter-bubbles-layer');
    if(bubLayer) bubLayer.remove();
    // Reset letter paragraphs
    $$('#letterBody p').forEach(p=>{ gsap.set(p,{opacity:0,y:15}); });
    gsap.set("#envelopeWrapper",{opacity:0,scale:.5});
    gsap.set("#envelopeSeal",{scale:1,opacity:1});
    gsap.set("#envelopeFlap",{rotateX:0});
    gsap.set("#letterPrompt",{opacity:0});
    const tl=gsap.timeline({delay:.3});
    tl.to("#letterPrompt",{opacity:1,duration:.9,ease:"power2.out"})
      .to("#envelopeWrapper",{opacity:1,scale:1,duration:1,ease:"back.out(1.7)"},"-=.3");
}

function openEnvelope() {
    const lf=$("#letterFullscreen");
    if(lf.style.display==="flex")return;
    const tl=gsap.timeline();
    tl.to("#envelopeSeal",{scale:1.6,opacity:0,duration:.4,ease:"power2.out"})
      .to("#envelopeFlap",{rotateX:180,duration:.7,ease:"power2.inOut"})
      .to("#envelopeWrapper",{scale:.5,opacity:0,duration:.5,ease:"power2.in"})
      .to("#letterPrompt",{opacity:0,duration:.3},"-=.5")
      .call(()=>{
          lf.style.display="flex";
          // Letter bubbles (Comment 7)
          if(!lf.querySelector('.letter-bubbles-layer')){
              const layer=document.createElement('div');
              layer.className='letter-bubbles-layer';
              lf.appendChild(layer);
              spawnPhotoBubbleField(layer, PHOTOS.letter, 6, {drift:80, durationRange:[12,20], opacity:0.35, interactive:false, folder:'letter'});
          }
      })
      .fromTo(lf,{opacity:0},{opacity:1,duration:.4})
      .fromTo("#letterPaper",{opacity:0,y:80,scale:.88},
          {opacity:1,y:0,scale:1,duration:.9,ease:"back.out(1.4)"},"-=.1")
      .call(()=>$("#letterPaper").classList.add("is-open"));

    // Animate letter paragraphs word by word
    gsap.to("#letterBody p",{
        opacity:1,y:0,duration:.7,stagger:.18,ease:"power2.out",delay:1.2
    });
}

function closeLetter() {
    $("#letterPaper").classList.remove("is-open");
    // Remove letter bubbles layer (Comment 7)
    const bubLayer = $('#letterFullscreen .letter-bubbles-layer');
    if(bubLayer) bubLayer.remove();
    const tl=gsap.timeline();
    tl.to("#letterPaper",{opacity:0,y:60,scale:.9,duration:.4,ease:"power2.in"})
      .to("#letterFullscreen",{opacity:0,duration:.3,
          onComplete:()=>{ $("#letterFullscreen").style.display="none"; }})
      .call(()=>{
          gsap.set("#envelopeWrapper",{scale:1,opacity:1});
          gsap.set("#letterPrompt",{opacity:1});
          gsap.set("#envelopeSeal",{scale:1,opacity:1});
          gsap.set("#envelopeFlap",{rotateX:0});
      });
}

/* ─── AUDIO ─── */
function initAudio() {
    const music=$("#bgMusic"), btn=$("#audioToggle");
    let playing=false;
    btn.classList.add("paused");
    btn.addEventListener("click",()=>{
        if(playing){ music.pause(); btn.classList.add("paused"); }
        else {
            music.play().catch(()=>{});
            btn.classList.remove("paused");
        }
        playing=!playing;
    });
}

/* ─── EVENT LISTENERS ─── */
function bindEvents() {
    $("#btnBegin").addEventListener("click",()=>goToScene(2));
    $("#btnContinue").addEventListener("click",()=>{
        if(stormId)cancelAnimationFrame(stormId);
        goToScene(3);
    });
    $("#btnGift").addEventListener("click",()=>goToScene('gallery'));
    $("#btnToGift").addEventListener("click",()=>goToScene(4));
    $("#giftBoxWrapper").addEventListener("click",()=>openGift());
    $("#btnLetter").addEventListener("click",()=>goToScene(5));
    $("#envelopeWrapper").addEventListener("click",()=>openEnvelope());
    $("#letterClose").addEventListener("click",e=>{ e.stopPropagation(); closeLetter(); });
    // Gallery lightbox (Comment 8)
    $('#lightboxClose').addEventListener('click',closeLightbox);
    $('#lightboxPrev').addEventListener('click',()=>lightboxNav(-1));
    $('#lightboxNext').addEventListener('click',()=>lightboxNav(1));
    document.addEventListener('keydown',e=>{
        if(!$('#galleryLightbox').classList.contains('is-open'))return;
        if(e.key==='Escape')closeLightbox();
        if(e.key==='ArrowLeft')lightboxNav(-1);
        if(e.key==='ArrowRight')lightboxNav(1);
    });
}

/* ─── APPLY CONFIG (Comment 9) ─── */
function applyConfig(cfg) {
    CONFIG = Object.assign(CONFIG, cfg);
    document.title = `Happy ${CONFIG.age}nd Birthday, ${CONFIG.name} 💝`;
    $$('[data-config-key]').forEach(el=>{
        const key = el.getAttribute('data-config-key');
        if(key==='name') el.textContent = CONFIG.name;
        else if(key==='age') el.textContent = CONFIG.age;
        else if(key==='date') el.textContent = CONFIG.date;
        else if(key==='signature') el.textContent = CONFIG.signature;
        else if(key==='greeting') el.textContent = `My Dearest ${CONFIG.name.split(' ')[0]},`;
    });
}

/* ─── KAWAII PETS ─── */
const PET_LINES = {
    luna: [
        "Happy Birthday~! 🎂✨", "You're glowing today! 🌙",
        "*nuzzle* 🦊💕", "Make a wish~! ⭐",
        "Luna loves you! 💝", "Yip yip~! 🎀",
        "22 looks great on you! 🌟", "So pretty~! 🦋"
    ],
    mochi: [
        "Boing boing~! 🍡", "Happy Bday! 🎉",
        "*squish* 💗", "Mochiiii~! ✨",
        "You're sweet like mochi! 🍰", "Bounce bounce~! 💫",
        "Hehe~! 🎈", "Party time! 🥳"
    ],
    tealo: [
        "✦ Sparkle sparkle~! ✦", "Happy Birthday! 🎆",
        "*spins happily* 💚", "Glow glow~! ✨",
        "Tealo wishes you joy! 🌟", "Wheee~! 💫",
        "You shine so bright! ⭐", "Magical day~! 🔮"
    ]
};

function initPets() {
    const luna = $('#petLuna');
    const mochi = $('#petMochi');
    const tealo = $('#petTealo');

    /* ── Luna: Wandering Spirit ── */
    // Entrance fade-in
    gsap.fromTo(luna,
        { opacity: 0, scale: 0, x: 40, y: window.innerHeight - 140 },
        { opacity: 1, scale: 1, duration: 1, delay: 2, ease: 'back.out(2.5)' });

    // Set initial position (GSAP absolute coords since position:fixed)
    let lunaX = 40, lunaY = window.innerHeight - 140;
    let lunaLastX = lunaX;

    function lunaWander() {
        const margin = 80; // safe viewport margin
        const newX = margin + Math.random() * (window.innerWidth - margin * 2 - 70);
        const newY = margin + Math.random() * (window.innerHeight - margin * 2 - 80);
        const dur = 8 + Math.random() * 7; // 8-15 seconds

        // Flip direction based on movement
        if (newX < lunaLastX) {
            luna.classList.add('facing-left');
        } else {
            luna.classList.remove('facing-left');
        }
        lunaLastX = newX;

        // Drop a tiny trail sparkle at departure
        spawnLunaTrail(lunaX, lunaY);

        lunaX = newX;
        lunaY = newY;

        gsap.to(luna, {
            left: newX,
            top: newY,
            bottom: 'auto',
            duration: dur,
            ease: 'sine.inOut',
            onComplete: lunaWander
        });
    }

    // Start wandering after entrance animation
    gsap.delayedCall(3.2, () => {
        gsap.set(luna, { bottom: 'auto', top: lunaY, left: lunaX });
        lunaWander();
    });

    // Luna random blinks
    function lunaBlink() {
        const eyes = luna.querySelectorAll('.luna-eye');
        eyes.forEach(eye => {
            const origRy = eye.getAttribute('ry');
            gsap.to(eye, { attr: { ry: 0.5 }, duration: 0.08, ease: 'power2.in',
                onComplete: () => {
                    gsap.to(eye, { attr: { ry: origRy }, duration: 0.08, ease: 'power2.out' });
                }
            });
        });
        // Next blink in 2-6 seconds
        gsap.delayedCall(2 + Math.random() * 4, lunaBlink);
    }
    gsap.delayedCall(4, lunaBlink);

    // Luna trail sparkle helper
    function spawnLunaTrail(x, y) {
        for (let i = 0; i < 3; i++) {
            const spark = document.createElement('div');
            spark.className = 'luna-trail';
            spark.style.left = (x + 35 + (Math.random() - 0.5) * 30) + 'px';
            spark.style.top = (y + 40 + (Math.random() - 0.5) * 20) + 'px';
            document.body.appendChild(spark);
            gsap.fromTo(spark,
                { scale: 1, opacity: 0.7 },
                { scale: 0, opacity: 0, y: -20 + Math.random() * -20,
                  x: (Math.random() - 0.5) * 30,
                  duration: 1.5 + Math.random(),
                  ease: 'power2.out',
                  onComplete: () => spark.remove() });
        }
    }

    /* ── Mochi & Tealo: Entrance + Speech ── */
    const talkPets = [
        { el: mochi, name: 'mochi' },
        { el: tealo, name: 'tealo' }
    ];

    // Entrance animation
    talkPets.forEach((p, i) => {
        gsap.fromTo(p.el,
            { opacity: 0, scale: 0, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8,
              delay: 2.4 + i * 0.4, ease: 'back.out(2.5)' });
    });

    // Click → speech bubble (Mochi + Tealo only)
    talkPets.forEach(p => {
        p.el.addEventListener('click', e => {
            e.stopPropagation();
            const old = p.el.querySelector('.pet-speech');
            if (old) old.remove();
            const lines = PET_LINES[p.name];
            const line = lines[Math.floor(Math.random() * lines.length)];
            const bubble = document.createElement('div');
            bubble.className = 'pet-speech';
            bubble.textContent = line;
            p.el.appendChild(bubble);
            gsap.fromTo(bubble,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2.5)' });
            gsap.to(bubble, { scale: 0, opacity: 0, duration: 0.3,
                delay: 2.5, ease: 'power2.in',
                onComplete: () => bubble.remove() });
            gsap.to(p.el, { y: -12, duration: 0.15, ease: 'power2.out',
                yoyo: true, repeat: 1 });
            burstSparkles(p.el);
        });
    });
}

/* ─── INIT ─── */
async function init() {
    // Fetch photos manifest and config (Comments 2 & 9)
    try {
        const [photosRes, configRes] = await Promise.allSettled([
            fetch('assets/photos/photos.json').then(r=>r.ok?r.json():null),
            fetch('assets/config.json').then(r=>r.ok?r.json():null)
        ]);
        if(photosRes.status==='fulfilled' && photosRes.value){
            PHOTOS = Object.assign(PHOTOS, photosRes.value);
        }
        if(configRes.status==='fulfilled' && configRes.value){
            applyConfig(configRes.value);
        }
    } catch(e){ /* graceful fallback — site renders with defaults */ }

    initSparkleCanvas();
    initMagnetic();
    initAudio();
    bindEvents();
    initPets();
    // Set initial GSAP state for elements that need it
    gsap.set("#btnBegin",{opacity:0,scale:.8});
    gsap.set(".line1,.line2",{opacity:1}); // word spans handle reveal
    gsap.set(".script-name",{opacity:0}); // hidden until reveal animation
    gsap.set("#bloomContainer",{opacity:0});
    // Petal setup: GSAP controls rotation+centering so scale can animate cleanly
    $$(".petal.outer").forEach((el,i)=>gsap.set(el,{xPercent:-50,yPercent:-100,rotation:i*36,scale:0,opacity:0,transformOrigin:"50% 100%"}));
    $$(".petal.mid").forEach((el,i)=>gsap.set(el,{xPercent:-50,yPercent:-100,rotation:22.5+i*45,scale:0,opacity:0,transformOrigin:"50% 100%"}));
    $$(".petal.inner").forEach((el,i)=>gsap.set(el,{xPercent:-50,yPercent:-100,rotation:i*60,scale:0,opacity:0,transformOrigin:"50% 100%"}));
    gsap.set(".flower-center",{opacity:0,scale:0});
    // Mark scene 1 as initialized and play it
    sceneInitialized[1] = true;
    playScene1();
}

document.readyState==="loading"
    ? document.addEventListener("DOMContentLoaded",init)
    : init();

})();
