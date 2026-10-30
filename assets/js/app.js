/*
Required Notice: © 2026 Songming.org
SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
*/

(() => {
    'use strict';
    const $ = s => document.querySelector(s);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = matchMedia('(max-width: 800px)');
    let reduced = motion.matches;
    const config = BIRTHDAY;
    const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
    const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
    const TAU = Math.PI * 2;
    let seed = 241021;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const range = (a, b) => a + rand() * (b - a);
    const pick = a => a[Math.floor(rand() * a.length)];
    const palette = ['#f2d184','#cda350','#f5e4b9','#57b7c1','#437fd0','#9179ce','#e19db5','#e9ece2'];
    const interpolate = text => String(text).replaceAll('{recipient}', config.recipient).replaceAll('{sender}', config.sender);
    const greeting = `${config.greeting} ${config.recipient}${config.punctuation}`;
    const from = `${config.fromLabel} ${config.sender}`;
    document.title = greeting;
    $('#greeting-text').textContent = greeting;
    $('#from-text').textContent = from;
    $('#salutation-text').textContent = interpolate(config.letterSalutation);
    $('#signature-text').textContent = config.sender;
    $('.closing').textContent = interpolate(config.letterClosing);
    config.extraWishes.forEach(text => { const p = document.createElement('p'); p.textContent = interpolate(text); $('.extra-wishes').append(p); });
    config.letterParagraphs.forEach(text => { const p = document.createElement('p'); p.textContent = interpolate(text); p.className = 'reveal-line'; $('.letter-body').append(p); });

    // Every stroke is an open centerline, drawn in pen order rather than a text wipe.
    const glyphs = BIRTHDAY_STROKES;
    const NS = 'http://www.w3.org/2000/svg';
    function handwriting(svg, text, delay, duration) {
      svg.replaceChildren();
      let x = 160, lengths = 0;
      const strokes = [];
      for (const char of text) {
        const glyph = glyphs[char];
        if (!glyph) {
          const fallback = document.createElementNS(NS, 'text');
          fallback.setAttribute('x', x); fallback.setAttribute('y', '0'); fallback.setAttribute('font-size', '680');
          fallback.setAttribute('font-family', 'Georgia, Songti SC, serif'); fallback.setAttribute('fill', 'currentColor');
          fallback.textContent = char; svg.append(fallback); x += 710; continue;
        }
        for (const d of glyph.p) {
          const path = document.createElementNS(NS, 'path');
          path.setAttribute('d', d); path.setAttribute('transform', `translate(${x},0) scale(1,-1)`);
          path.setAttribute('stroke-width', '21');
          svg.append(path);
          const length = path.getTotalLength();
          strokes.push({ path, length, start: lengths }); lengths += length;
        }
        x += glyph.w;
      }
      const bounds = svg.getBBox();
      svg.setAttribute('viewBox', `${bounds.x - 80} ${bounds.y - 90} ${bounds.width + 160} ${bounds.height + 180}`);
      const animate = () => {
        for (const { path, length, start } of strokes) {
          if (reduced) { path.style.strokeDashoffset = '0'; continue; }
          path.style.strokeDasharray = `${length} ${length}`;
          path.style.strokeDashoffset = length;
          path.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
            delay: delay + start / lengths * duration,
            duration: Math.max(50, length / lengths * duration), easing: 'linear', fill: 'forwards'
          });
        }
      };
      return animate;
    }
    const writeGreeting = handwriting($('.greeting'), greeting, 850, config.animation.handwritingSeconds * 1000);
    const writeFrom = handwriting($('.from'), from, 950 + config.animation.handwritingSeconds * 1000, 1600);
    const writeSalutation = handwriting($('.letter-salutation'), interpolate(config.letterSalutation), 400, 1500);
    const writeSignature = handwriting($('.signature'), config.sender, 250, 1300);
    // Keep letter strokes hidden until the paper enters the viewport.
    for (const svg of [$('.letter-salutation'), $('.signature')]) svg.style.opacity = 0;
    writeGreeting(); writeFrom();
    const paper = $('.paper');
    const paperObserver = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        paper.classList.add('is-visible');
        $('.letter-salutation').style.opacity = 1; writeSalutation();
        paperObserver.disconnect();
      }
    }, { threshold: .08 });
    paperObserver.observe(paper);
    const paragraphObserver = new IntersectionObserver(entries => {
      let order = 0;
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const delay = reduced ? 0 : 220 + order++ * 190;
        e.target.style.transitionDelay = `${delay}ms`;
        e.target.classList.add('is-visible');
        if (e.target.classList.contains('letter-footer')) {
          $('.signature').style.opacity = 1; writeSignature();
        }
        paragraphObserver.unobserve(e.target);
      });
    }, { threshold: .15 });
    document.querySelectorAll('.reveal-line').forEach(p => paragraphObserver.observe(p));

    const canvas = $('#universe');
    const ctx = canvas.getContext('2d', { alpha: false });
    const makeCanvas = (w,h) => { const c = document.createElement('canvas'); c.width=w; c.height=h; return c; };
    function star(c,x,y,r,points=5,angle=0) {
      c.beginPath();
      for (let i=0;i<points*2;i++) {
        const a=angle+i*Math.PI/points-Math.PI/2, rad=i%2?r*.43:r;
        if (i===0) c.moveTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad); else c.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);
      }
      c.closePath();c.fill();
    }
    function ellipse(c,x,y,rx,ry,fill) { c.beginPath(); c.ellipse(x,y,rx,ry,0,0,TAU); c.fillStyle=fill; c.fill(); }
    function glow(c,x,y,r,color,opacity=1) {
      const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');
      c.globalAlpha=opacity;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.globalAlpha=1;
    }
    // Painted, seamless icing texture. All assets are generated locally.
    const side=makeCanvas(2048,400), sc=side.getContext('2d');
    const base=sc.createLinearGradient(0,0,0,400);base.addColorStop(0,'#101b36');base.addColorStop(.35,'#080e22');base.addColorStop(.78,'#080d1d');base.addColorStop(1,'#183951');sc.fillStyle=base;sc.fillRect(0,0,2048,400);
    // Soft, painted nebulae wind around the midnight-blue mirror glaze.
    sc.globalCompositeOperation='screen';
    for(let i=0;i<145;i++) {
      const x=range(0,2048), y=230+Math.sin(x*.009)*90+range(-65,65), radius=range(30,160);
      const color=pick(['#123c89','#175e88','#3c237e','#2052b2','#238b97','#654591']);
      for(const offset of [-2048,0,2048]) {
        const g=sc.createRadialGradient(x+offset,y,0,x+offset,y,radius);g.addColorStop(0,color);g.addColorStop(1,'#00000000');
        sc.globalAlpha=range(.25,.65);sc.fillStyle=g;sc.fillRect(x+offset-radius,y-radius,radius*2,radius*2);
      }
    }
    sc.globalCompositeOperation='source-over';
    sc.globalAlpha=1;
    for(let i=0;i<2400;i++) {sc.globalAlpha=range(.12,.7);sc.fillStyle=pick(palette);const s=range(.5,2.3);sc.fillRect(rand()*2048,rand()*400,s,s);}
    sc.globalAlpha=1;
    for(let i=0;i<175;i++) {sc.fillStyle=pick(palette);const x=rand()*2048,y=rand()*400,r=range(2,10);if(i%3===0) star(sc,x,y,r,5,rand()*TAU);else ellipse(sc,x,y,r*.7,r*.7,sc.fillStyle);}
    for(let i=0;i<27;i++) {sc.fillStyle=pick(['#eed69e','#deae63','#e8b9c3','#e9e8d9','#639eac']);star(sc,rand()*2048,range(36,350),range(9,18),5,rand()*TAU);}
    // Metallic leaf fragments, clustered just below the rim.
    for(let i=0;i<200;i++) {const x=rand()*2048,y=rand()**2*150;sc.fillStyle=pick(['#caa25a','#dfc78b','#92713d']);sc.globalAlpha=range(.3,.8);sc.beginPath();sc.moveTo(x,y);sc.lineTo(x+range(1,9),y-3);sc.lineTo(x+range(1,7),y+range(2,9));sc.closePath();sc.fill();}sc.globalAlpha=1;
    // Irregular gold leaf, with thin gilded drips and hand-painted constellations.
    const gold=sc.createLinearGradient(0,0,0,140);gold.addColorStop(0,'#f0d79a');gold.addColorStop(.4,'#bb8e46');gold.addColorStop(1,'#775124');
    for(let i=0;i<55;i++) {
      const x=i*39+range(-8,8), length=range(12,95), width=range(3,9);
      sc.strokeStyle=gold;sc.lineWidth=width;sc.lineCap='round';sc.beginPath();sc.moveTo(x,0);sc.bezierCurveTo(x-2,18,x+4,length*.7,x+1,length);sc.stroke();
    }
    for(let i=0;i<550;i++) {
      const x=rand()*2048,y=rand()<.65?rand()**2*105:range(310,400),r=range(1,7);
      sc.fillStyle=pick(['#e9cc81','#c59345','#ffe5a5','#98703c']);sc.globalAlpha=range(.4,.95);sc.beginPath();sc.moveTo(x,y);sc.lineTo(x+r,y-r*.4);sc.lineTo(x+r*.7,y+r);sc.lineTo(x-r*.3,y+r*.8);sc.closePath();sc.fill();
    }
    sc.globalAlpha=1;
    for(let i=0;i<6;i++) {
      const x=i*345+35, y=range(145,235), pts=[[0,0],[48,-38],[96,14],[140,-12],[192,39]];
      sc.strokeStyle='#d5b67770';sc.lineWidth=1.2;sc.beginPath();pts.forEach(([dx,dy],j)=>j?sc.lineTo(x+dx,y+dy):sc.moveTo(x+dx,y+dy));sc.stroke();
      for(const [dx,dy] of pts){sc.fillStyle='#ffe3a2';star(sc,x+dx,y+dy,range(4,8),4,.2);}
    }
    // Fine goldwork sits above the nebula glaze like a constellation necklace.
    for(let x=0;x<2048;x+=256) {
      for(let layer=0;layer<2;layer++) {sc.strokeStyle=layer?'#f6dc9c88':'#b48a4380';sc.lineWidth=layer?.8:2;sc.beginPath();sc.moveTo(x,74);sc.bezierCurveTo(x+68,145+layer*8,x+188,145+layer*8,x+256,74);sc.stroke();}
      for(let j=1;j<12;j++){const v=j/12,px=x+v*256,py=74+Math.sin(v*Math.PI)*53;ellipse(sc,px,py,1.5,1.5,'#f5dfac');}
      sc.strokeStyle='#ddbf81';sc.lineWidth=1;sc.beginPath();sc.moveTo(x+128,127);sc.lineTo(x+128,153);sc.stroke();sc.fillStyle='#f4d895';star(sc,x+128,164,11,4);
    }
    // Irregular crumpled leaf catches different highlights along each edge.
    for(let i=0;i<58;i++) {
      const x=rand()*2048,y=i%2?range(20,75):range(315,382),r=range(7,19),points=[];
      for(let k=0;k<8;k++){const a=k/8*TAU,rr=r*range(.4,1);points.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr]);}
      for(let k=0;k<8;k++){sc.fillStyle=pick(['#ffebb2','#d5ad59','#b78a3b','#e8c77c','#8a652d']);sc.beginPath();sc.moveTo(x,y);sc.lineTo(...points[k]);sc.lineTo(...points[(k+1)%8]);sc.closePath();sc.fill();}
    }
    const cylinder=makeCanvas(664,422), cc=cylinder.getContext('2d');
    const top=makeCanvas(800,800), tc=top.getContext('2d');
    const tg=tc.createRadialGradient(370,330,0,400,400,400);tg.addColorStop(0,'#6b5d41');tg.addColorStop(.33,'#363d4b');tg.addColorStop(.78,'#253452');tg.addColorStop(1,'#50627c');tc.fillStyle=tg;tc.fillRect(0,0,800,800);
    for(let i=0;i<1500;i++) {
      const x=rand()*800,y=rand()*800,r=range(2,11);tc.fillStyle=pick(palette);tc.globalAlpha=range(.45,1);
      if(i%5===0) star(tc,x,y,r*1.5,5,rand()*TAU);
      else {tc.save();tc.translate(x,y);tc.rotate(rand()*TAU);tc.fillRect(-r,-r*.38,r*2,r*.76);tc.restore();}
    }tc.globalAlpha=1;
    for(let i=0;i<115;i++) {const x=rand()*800,y=rand()*800,r=range(6,16);tc.fillStyle=pick(palette);if(i%3===0)star(tc,x,y,r,5,rand()*TAU);else ellipse(tc,x,y,r*.7,r*.7,tc.fillStyle);}
    for(let i=0;i<65;i++) {const x=rand()*800,y=rand()*800,r=range(7,24);tc.fillStyle=pick(['#e8bd69','#b98936','#ffe2a1']);tc.beginPath();for(let j=0;j<7;j++){const a=j/7*TAU,rr=r*range(.4,1);if(j)tc.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);else tc.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}tc.closePath();tc.fill();tc.strokeStyle='#fff0bd88';tc.lineWidth=.7;tc.beginPath();tc.moveTo(x-r*.3,y-r*.4);tc.lineTo(x+r*.5,y+r*.4);tc.stroke();}
    const jewelColors=['#f5d78c','#f1e6c8','#bcd7ed','#d7c7f1','#edbbcf'];
    const particles=Array.from({length:Math.max(0,Math.min(400,config.animation.stars))},(_,i)=>({a:rand()*TAU,r:range(190,289),y:range(-255,245),size:range(1.2,i%7===0?15:4.3),speed:range(.05,.13)*(i%2?-1:1),phase:rand()*TAU,color:pick(jewelColors),star:i%3!==0,facet:i%2===0}));
    const dust=Array.from({length:210},()=>({a:rand()*TAU,r:range(12,185),rise:rand(),size:range(.55,1.7),speed:range(.016,.04),color:pick(['#e9c879','#c3a368','#f1dfb1','#93b5c5'])}));
    const specks=Array.from({length:85},()=>({x:range(110,690),y:range(100,700),r:range(.4,1.25),phase:rand()*TAU}));
    const rims=Array.from({length:64},(_,i)=>({a:i/64*TAU,r:range(3.4,5),color:i%3?'#f0ddb4':'#b9aedc'}));
    const decorations=Array.from({length:39},(_,i)=>({a:rand()*TAU,r:range(45,143),size:range(7,15),tilt:range(-.65,.65),color:pick(['#f4d58e','#f0c5d6','#a9c9ed','#c4b3ec','#7fced1']),type:i%4}));
    const ribbonDust=Array.from({length:360},(_,i)=>({a:rand()*TAU,spread:range(-11,11),phase:rand()*TAU,size:range(.35,1.4),orbit:i%2}));
    const focalStars=Array.from({length:9},(_,i)=>({a:i/9*TAU+.2,size:range(8,14),phase:rand()*TAU,color:jewelColors[i%jewelColors.length]}));
    const sparkle=makeCanvas(100,100), sp=sparkle.getContext('2d');
    const sg=sp.createRadialGradient(50,50,0,50,50,50);sg.addColorStop(0,'#fff9dfcc');sg.addColorStop(.12,'#fbd68e55');sg.addColorStop(1,'#eac47300');sp.fillStyle=sg;sp.fillRect(0,0,100,100);
    sp.fillStyle='#fff6d5';star(sp,50,50,32,4);sp.fillStyle='#fff';ellipse(sp,50,50,3,3,'#fff');
    // Pre-rendered jewel stars keep the halos soft without expensive per-frame blur.
    const jewels=new Map();
    for(const color of jewelColors) for(const faceted of [false,true]) {
      const sprite=makeCanvas(128,128), c=sprite.getContext('2d');
      const halo=c.createRadialGradient(64,64,0,64,64,64);halo.addColorStop(0,color+'77');halo.addColorStop(.22,color+'25');halo.addColorStop(1,color+'00');c.fillStyle=halo;c.fillRect(0,0,128,128);
      if(faceted) {
        const gradient=c.createLinearGradient(45,42,82,88);gradient.addColorStop(0,'#fffbee');gradient.addColorStop(.3,color);gradient.addColorStop(.65,color);gradient.addColorStop(1,'#9b7d51');c.fillStyle=gradient;star(c,64,64,22,5);
        for(let k=0;k<10;k++) {const a=k*Math.PI/5-Math.PI/2,b=a+Math.PI/5,r1=k%2?9.46:22,r2=k%2?22:9.46;c.fillStyle=k%2?'#ffffff33':'#56436b30';c.beginPath();c.moveTo(64,64);c.lineTo(64+Math.cos(a)*r1,64+Math.sin(a)*r1);c.lineTo(64+Math.cos(b)*r2,64+Math.sin(b)*r2);c.closePath();c.fill();}
        c.strokeStyle='#fff5d3a0';c.lineWidth=.6;c.beginPath();c.moveTo(64,43);c.lineTo(64,64);c.stroke();
      } else {
        c.fillStyle=color;c.beginPath();c.moveTo(64,35);c.quadraticCurveTo(67,60,84,64);c.quadraticCurveTo(67,67,64,93);c.quadraticCurveTo(61,68,44,64);c.quadraticCurveTo(61,60,64,35);c.fill();
        c.strokeStyle=color+'80';c.lineWidth=.7;c.beginPath();c.moveTo(48,48);c.lineTo(80,80);c.moveTo(80,48);c.lineTo(48,80);c.stroke();
        ellipse(c,64,64,2.7,2.7,'#fffdf1');
      }
      jewels.set(color+faceted,sprite);
    }
    let bursts=[],lastWish=0;
    let viewSize=0, pointerX=0,pointerY=0,aimX=0,aimY=0,frame=0,lastFrame=0,elapsed=0,visible=true;
    let scrollDirty=true;
    function resize() {
      const rect=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,mobile.matches?2:2.25);
      viewSize=Math.round(rect.width*dpr);canvas.width=viewSize;canvas.height=viewSize;scrollDirty=true;
      if(reduced) draw(0);
    }
    function updateScroll() {
      scrollDirty=false;
      const hero=$('.hero'), height=hero.offsetHeight;
      const p=ease(window.scrollY/(height*.82));
      const targetScale=Math.min(.765,innerWidth*.46/$('.composition').offsetWidth);
      if(!mobile.matches) $('.composition').style.transform=`translateX(${-innerWidth*.252*p}px) scale(${1-(1-targetScale)*p})`;
      else $('.composition').style.transform='';
      const cue=$('.scroll-cue');cue.style.visibility=window.scrollY>height*.12?'hidden':'visible';
    }
    function ring(t,front) {
      ctx.save();ctx.translate(400,380);ctx.rotate(-.12);
      for(let j=0;j<3;j++) {
        const rx=269+j*8,ry=292-j*9;
        const grad=ctx.createLinearGradient(-rx,-ry,rx,ry);grad.addColorStop(0,'#d9b86c12');grad.addColorStop(.27,'#f2cd8bb0');grad.addColorStop(.6,'#96816425');grad.addColorStop(1,'#e4bf7880');
        ctx.strokeStyle=grad;ctx.lineWidth=j===0?.9:.45;ctx.beginPath();
        const a=(front?0:Math.PI)+t*.018+j*.15;
        ctx.ellipse(0,0,rx,ry,0,a,a+Math.PI*.82);ctx.stroke();
      }
      if(front) {
        for(let j=0;j<2;j++) {
          const head=t*(j?.13:-.1)+(j?3.8:5.2),rx=273+j*5,ry=289-j*8;
          for(let k=0;k<28;k++) {const a=head-k*.012;ctx.globalAlpha=(1-k/28)*.6;ctx.strokeStyle=j?'#98c8df':'#eecb7b';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,a-.014,a);ctx.stroke();}
          ctx.globalAlpha=.85;const x=Math.cos(head)*rx,y=Math.sin(head)*ry;ctx.drawImage(sparkle,x-15,y-15,30,30);ctx.globalAlpha=1;
        }
      }
      ctx.restore();
    }
    function floating(t,front) {
      particles.forEach((p,i)=>{
        if(mobile.matches&&i%5===0)return;
        const a=p.a+t*p.speed, z=Math.sin(a), radial=Math.sqrt(Math.max(.1,1-(p.y/315)**2));
        if((z>0)!==front)return;
        const x=400+Math.cos(a)*p.r*radial, y=378+p.y+Math.sin(a*.8+t*.2)*10;
        const alpha=(.58+.21*(1+Math.sin(t*.9+p.phase)))*(front?1:.62);
        if(p.star&&p.size>5) {
          // A curved, tapering trail follows the star's own orbital trajectory.
          const direction=Math.sign(p.speed);
          for(let k=0;k<22;k++) {
            const b=a-direction*k*.012,prev=b-direction*.014;
            const x1=400+Math.cos(b)*p.r*radial,x2=400+Math.cos(prev)*p.r*radial;
            const y1=378+p.y+Math.sin(b*.8+t*.2)*10,y2=378+p.y+Math.sin(prev*.8+t*.2)*10;
            ctx.globalAlpha=alpha*(1-k/22)**2*.32;ctx.strokeStyle=p.color;ctx.lineWidth=(1-k/22)*1.3+.15;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
          }
        }
        ctx.globalAlpha=alpha;ctx.fillStyle=p.color;
        const size=p.size*(.8+(z+1)*.13);
        if(p.star) {
          const pulse=.85+.15*Math.sin(t*1.1+p.phase),span=size*5.8*pulse;
          ctx.save();ctx.translate(x,y);if(p.facet)ctx.rotate(Math.sin(t*.25+p.phase)*.3);ctx.drawImage(jewels.get(p.color+p.facet),-span/2,-span/2,span,span);ctx.restore();
          if(size>7&&front){ctx.globalAlpha=alpha*Math.max(0,Math.sin(t*1.6+p.phase))**10;ctx.drawImage(sparkle,x-size*3,y-size*3,size*6,size*6);}
        } else ellipse(ctx,x,y,size*.42,size*.42,p.color);
      });ctx.globalAlpha=1;
      for(const [i,p] of focalStars.entries()) {
        const a=p.a+t*.055,z=Math.sin(a);if((z>0)!==front)continue;
        const x=400+Math.cos(a)*257,y=380+Math.sin(a)*259;
        const pulse=.8+.2*Math.sin(t*.9+p.phase),size=p.size*pulse,span=size*5.8;
        ctx.globalAlpha=front?.95:.75;ctx.save();ctx.translate(x,y);ctx.rotate(i%2?0:Math.sin(t*.3+p.phase)*.22);ctx.drawImage(jewels.get(p.color+(i%2===0)),-span/2,-span/2,span,span);ctx.restore();
        ctx.globalAlpha=Math.max(0,Math.sin(t*.65+p.phase))**14*.8;ctx.drawImage(sparkle,x-size*3,y-size*3,size*6,size*6);
      }ctx.globalAlpha=1;
    }
    function starRibbons(t,front) {
      // Two inclined streams thread behind and in front of the cake in depth order.
      for(const p of ribbonDust) {
        const a=p.a+t*(p.orbit?.07:-.05),z=Math.sin(a);if((z>0)!==front)continue;
        const x=Math.cos(a)*(278+p.spread),y=Math.sin(a)*(70+p.spread*.25);
        const tilt=p.orbit?-.27:.24,px=400+x*Math.cos(tilt)-y*Math.sin(tilt),py=431+x*Math.sin(tilt)+y*Math.cos(tilt);
        const visibility=front?.55:.48;ctx.globalAlpha=visibility*(.5+.5*Math.sin(p.phase+t*.6)**2);ellipse(ctx,px,py,p.size,p.size,p.orbit?'#c2d5eb':'#edcf8c');
      }
      ctx.globalAlpha=1;
    }
    function drawPlate(rotation) {
      // A porcelain plate with a fine champagne-gold rim.
      glow(ctx,400,662,220,'#16223c',.17);
      ellipse(ctx,400,626,216,63,'#141c31');
      const plate=ctx.createLinearGradient(180,592,590,653);plate.addColorStop(0,'#7583a2');plate.addColorStop(.3,'#b8bbc9');plate.addColorStop(.65,'#e6dfcb');plate.addColorStop(1,'#8d98b3');
      ellipse(ctx,400,618,218,63,plate);
      ctx.strokeStyle='#c5ad7f';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(400,617,213,59,0,0,TAU);ctx.stroke();
      ctx.strokeStyle='#f8e6c480';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(400,615,207,55,0,0,TAU);ctx.stroke();
      ellipse(ctx,400,613,184,48,'#333e5b');
      for(let i=0;i<28;i++) {const a=i*2.399+rotation,r=187+(i%4)*5;ctx.fillStyle=palette[i%palette.length];const x=400+Math.cos(a)*r,y=618+Math.sin(a)*r*.255;if(i%3===0) star(ctx,x,y,3.1,5,a);else ellipse(ctx,x,y,1.8,1,ctx.fillStyle);}
      ellipse(ctx,400,612,169,43,'#040b19');
    }
    function pearl(x,y,r,color) {
      const g=ctx.createRadialGradient(x-r*.35,y-r*.45,.1,x,y,r);
      g.addColorStop(0,'#fff9df');g.addColorStop(.25,color);g.addColorStop(.72,color);g.addColorStop(1,'#796a64');
      ellipse(ctx,x,y,r,r*.83,g);
    }
    function sugarStar(x,y,size,color,tilt,flat=false) {
      ctx.save();ctx.translate(x,y);ctx.rotate(tilt);if(flat)ctx.scale(1,.6);
      ctx.fillStyle='#362b4670';star(ctx,2,4,size+1,5);
      ctx.fillStyle='#87704c';star(ctx,1,2,size,5);
      const g=ctx.createLinearGradient(-size,-size,size,size);g.addColorStop(0,'#fff1cc');g.addColorStop(.35,color);g.addColorStop(.7,color);g.addColorStop(1,'#8c6b49');ctx.fillStyle=g;star(ctx,0,0,size,5);
      ctx.strokeStyle='#fff4d7a0';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(0,-size*.85);ctx.lineTo(-size*.25,-size*.14);ctx.lineTo(-size*.8,-size*.26);ctx.stroke();ctx.restore();
    }
    function sugarCrystal(x,y,size,color,tilt) {
      ctx.save();ctx.translate(x,y);ctx.rotate(tilt*.45);
      const h=size*1.65,w=size*.46;ellipse(ctx,2,2,w*1.3,3,'#050c2455');
      ctx.fillStyle=color+'bb';ctx.beginPath();ctx.moveTo(-w,0);ctx.lineTo(-w,-h*.63);ctx.lineTo(0,-h);ctx.lineTo(w,-h*.65);ctx.lineTo(w,0);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff6ef80';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-h);ctx.lineTo(-w,-h*.63);ctx.lineTo(-w,0);ctx.closePath();ctx.fill();
      ctx.fillStyle='#fff7e3b0';ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(w,-h*.65);ctx.lineTo(0,-h*.73);ctx.lineTo(-w,-h*.63);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#f7eacaad';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(0,0);ctx.stroke();ctx.restore();
    }
    function rosette(x,y,index) {
      ellipse(ctx,x+2,y+3,12.5,4.5,'#00000055');
      const colors=index%2?['#b9a6cc','#d6c3df','#f0dfe9']:['#c4b69c','#e3d0ac','#fff0d3'];
      for(let layer=0;layer<3;layer++) {
        const radius=7-layer*1.8;
        for(let k=0;k<8;k++){const a=k/8*TAU+layer*.42;pearl(x+Math.cos(a)*radius,y-layer*3.2+Math.sin(a)*radius*.3,4.1-layer*.55,colors[layer]);}
      }
      // A piped spiral and a folded gold leaf finish each cream rosette.
      ctx.strokeStyle='#ffefd9b3';ctx.lineWidth=.7;ctx.beginPath();for(let k=0;k<40;k++){const a=k*.22,r=5.5*(1-k/45),px=x+Math.cos(a)*r,py=y-7+Math.sin(a)*r*.42;if(k)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.stroke();
      ctx.fillStyle='#e5bf74';ctx.beginPath();ctx.moveTo(x+2,y-9);ctx.quadraticCurveTo(x+10,y-17,x+11,y-11);ctx.quadraticCurveTo(x+7,y-6,x+2,y-9);ctx.fill();ctx.strokeStyle='#ffedb8';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x+3,y-9);ctx.lineTo(x+10,y-12);ctx.stroke();
    }
    function topDecorations(rotation,front) {
      const pieces=[];
      for(let i=0;i<14;i++) {
        const a=i/14*TAU+rotation;pieces.push({x:400+Math.cos(a)*151,y:438+Math.sin(a)*43,type:'rosette',i});
      }
      for(const p of decorations){const a=p.a+rotation;pieces.push({x:400+Math.cos(a)*p.r,y:438+Math.sin(a)*p.r*.29,type:'sugar',p});}
      // Three gilded stars on fine stems give the cake a sculptural silhouette.
      for(let i=0;i<3;i++) {const a=rotation+i*TAU/3+.7;pieces.push({x:400+Math.cos(a)*118,y:438+Math.sin(a)*34,type:'topper',i});}
      pieces.sort((a,b)=>a.y-b.y);
      for(const p of pieces) {
        if((p.y>=438)!==front)continue;
        if(p.type==='rosette') {
          rosette(p.x,p.y-2,p.i);
        } else if(p.type==='topper') {
          const h=32+p.i*10;ctx.strokeStyle='#cba55e';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y-h);ctx.stroke();
          sugarStar(p.x,p.y-h-9,14+p.i*2,'#e8c37a',Math.sin(rotation+p.i)*.2);
        } else {const d=p.p;if(d.type===0)pearl(p.x,p.y-3,d.size*.45,d.color);else if(d.type===3){sugarCrystal(p.x-4,p.y,d.size*.8,d.color,d.tilt-.2);sugarCrystal(p.x+3,p.y+1,d.size*.6,d.color,d.tilt+.3);}else sugarStar(p.x,p.y-4,d.size,d.color,d.tilt,true);}
      }
    }
    function drawCake(t) {
      const rotation=t*config.animation.rotationSpeed, r=166,cy=438,ry=48,h=163;
      drawPlate(rotation);
      // Project narrow texture strips onto a cylinder, including curved top and base.
      cc.clearRect(0,0,664,422);
      for(let col=0;col<664;col++) {
        const u=clamp((col+.5)/332-1,-1,1), surfaceAngle=Math.acos(u), curve=Math.sqrt(1-u*u);
        // Front of the cylinder: x = r*cos(angle), y = ry*sin(angle).
        // Subtract the same rotation used by the top and decorations to sample
        // the material coordinate. asin(x/r) would mirror the body's rotation.
        let tx=((surfaceAngle-rotation)/TAU+1)%1;if(tx<0)tx+=1;
        const sampleWidth=Math.min(14,side.width/(TAU*r*2*Math.max(.02,curve)));
        cc.drawImage(side,tx*(side.width-sampleWidth),0,sampleWidth,400,col,ry*curve*2,1,h*2);
      }
      ctx.drawImage(cylinder,400-r,cy,r*2,h+ry);
      ctx.save();ctx.beginPath();ctx.moveTo(400-r,cy);ctx.ellipse(400,cy,r,ry,0,Math.PI,0,true);ctx.lineTo(400+r,cy+h);ctx.ellipse(400,cy+h,r,ry,0,0,Math.PI);ctx.closePath();ctx.clip();
      const shade=ctx.createLinearGradient(400-r,0,400+r,0);shade.addColorStop(0,'#000000cc');shade.addColorStop(.12,'#00000030');shade.addColorStop(.26,'#a3c2f325');shade.addColorStop(.36,'#a3c2f304');shade.addColorStop(.65,'#00000015');shade.addColorStop(.87,'#c4d3ff12');shade.addColorStop(1,'#000000aa');ctx.fillStyle=shade;ctx.fillRect(400-r,cy,r*2,h+ry);
      const reflection=ctx.createLinearGradient(0,cy+20,0,cy+h+ry);reflection.addColorStop(0,'#dae9ff00');reflection.addColorStop(.15,'#dae9ff09');reflection.addColorStop(.55,'#dae9ff00');reflection.addColorStop(.92,'#97bdf413');reflection.addColorStop(1,'#dde8ff2b');ctx.fillStyle=reflection;ctx.fillRect(400-r,cy,r*2,h+ry);ctx.restore();
      // Glazed top, fine edge, and tiny piped pearls.
      ctx.save();ctx.translate(400,cy);ctx.scale(1,ry/r);ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.clip();ctx.rotate(rotation);ctx.drawImage(top,-r,-r,r*2,r*2);ctx.restore();
      const light=ctx.createRadialGradient(400,cy-6,2,400,cy,165);light.addColorStop(0,'#ffe7a54d');light.addColorStop(.55,'#d3b96e0d');light.addColorStop(1,'#00000020');ellipse(ctx,400,cy,r,ry,light);
      ctx.strokeStyle='#a0a3b580';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(400,cy,r,ry,0,0,TAU);ctx.stroke();
      for(const p of rims) {const a=p.a+rotation;const x=400+Math.cos(a)*164,y=cy+Math.sin(a)*47;pearl(x,y-1,p.r,p.color);}
      // A double necklace of sugar pearls finishes the lower edge.
      for(let i=0;i<72;i++) {
        const a=i/72*TAU+rotation;if(Math.sin(a)<0)continue;
        const x=400+Math.cos(a)*166,y=cy+h+Math.sin(a)*48;
        pearl(x,y-2,3.3,i%3?'#d4b47b':'#e9e0d4');
      }
      ctx.strokeStyle='#e3c58d70';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(400,cy+h-8,r,ry,0,0,Math.PI);ctx.stroke();
      topDecorations(rotation,false);
      // The candle throws a quiet golden pool across the icing.
      ellipse(ctx,400,cy,19,5,'#09101d80');
      glow(ctx,400,cy-12,62,'#ffd16c',.11);
      const wax=ctx.createLinearGradient(392,0,408,0);wax.addColorStop(0,'#7f552c');wax.addColorStop(.25,'#dfbd72');wax.addColorStop(.46,'#f9e2a1');wax.addColorStop(.72,'#c79645');wax.addColorStop(1,'#67411e');
      ctx.fillStyle=wax;ctx.fillRect(393,287,14,151);ellipse(ctx,400,438,7,2.5,wax);ellipse(ctx,400,287,7,2.5,'#f0d08b');
      ctx.save();ctx.beginPath();ctx.rect(393,289,14,149);ctx.clip();ctx.strokeStyle='#fff0ba70';ctx.lineWidth=2;
      for(let coil=-1;coil<9;coil++) {
        ctx.beginPath();let drawing=false;
        for(let j=0;j<=36;j++){const a=j/36*TAU+rotation,x=400+7.1*Math.cos(a),y=287+coil*19+j/36*19;if(Math.sin(a)>=0){if(drawing)ctx.lineTo(x,y);else ctx.moveTo(x,y);drawing=true;}else drawing=false;}
        ctx.stroke();
      }ctx.restore();
      ctx.strokeStyle='#3a271a';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(400,287);ctx.quadraticCurveTo(402,281,399,276);ctx.stroke();
      flame(t);
      topDecorations(rotation,true);
      // Brief glints catch the gilding as the cake turns.
      for(let i=0;i<5;i++) {const a=rotation+i*1.7;if(Math.sin(a)<0)continue;const x=400+Math.cos(a)*166,y=cy+Math.sin(a)*48+24+(i*29%90);const brightness=Math.max(0,Math.sin(t*1.4+i*2.1))**8;ctx.globalAlpha=brightness*.7;ctx.drawImage(sparkle,x-16,y-16,32,32);}ctx.globalAlpha=1;
    }
    function flame(t) {
      const sway=Math.sin(t*2.8)*3+Math.sin(t*5.2)*1.3, breathe=Math.sin(t*3.5)*2;
      ctx.save();ctx.globalCompositeOperation='screen';
      glow(ctx,400,259,86,'#f0a037',.13);glow(ctx,400,265,35,'#ffbf4a',.28);
      const f=ctx.createLinearGradient(400,215,400,283);f.addColorStop(0,'#fff1c9');f.addColorStop(.28,'#ffe7a0');f.addColorStop(.6,'#f9b945');f.addColorStop(1,'#d47926');
      ctx.fillStyle=f;ctx.beginPath();ctx.moveTo(400+sway,218+breathe);ctx.bezierCurveTo(398+sway,238,382,254,389,271);ctx.bezierCurveTo(392,286,410,285,412,270);ctx.bezierCurveTo(417,253,404+sway,242,400+sway,218+breathe);ctx.fill();
      ctx.fillStyle='#fff5ce';ctx.beginPath();ctx.moveTo(400+sway*.4,243);ctx.bezierCurveTo(396,255,394,265,397,275);ctx.bezierCurveTo(408,280,407,264,400+sway*.4,243);ctx.fill();
      ellipse(ctx,400,279,4.5,3,'#a8c6ff');ctx.restore();
    }
    function draw(t) {
      if(!viewSize)return;
      ctx.setTransform(viewSize/800,0,0,viewSize/800,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,800,800);
      ctx.save();ctx.translate(pointerX*7,pointerY*4);
      for(const p of specks) {ctx.globalAlpha=.15+.2*(Math.sin(t*.5+p.phase)+1)/2;ellipse(ctx,p.x,p.y,p.r,p.r,'#d9d3bd');}ctx.globalAlpha=1;
      ring(t,false);starRibbons(t,false);floating(t,false);
      for(const p of dust) {const life=(p.rise+t*p.speed)%1,rad=p.r*(.5+life*.6),a=p.a+t*.15;ctx.globalAlpha=Math.sin(life*Math.PI)*.65;ellipse(ctx,400+Math.cos(a)*rad,445-life*290+Math.sin(a)*18,p.size,p.size*.7,p.color);}ctx.globalAlpha=1;
      drawCake(t);starRibbons(t,true);ring(t,true);floating(t,true);
      for(const b of bursts) {
        const age=t-b.born;if(age<0||age>3)continue;
        const a=1-age/3;ctx.globalAlpha=a*a;ctx.fillStyle=b.color;
        star(ctx,400+b.vx*age,258+b.vy*age+age*age*16,b.size*(.5+a*.5),4,b.angle+age*.8);
      }ctx.globalAlpha=1;bursts=bursts.filter(b=>t-b.born<3);
      ctx.restore();
    }
    function tick(now) {
      frame=0;
      if(scrollDirty)updateScroll();
      if(!visible||document.hidden)return;
      if(now-lastFrame>=(mobile.matches?1000/40:1000/60)-1) {
        const delta=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
        if(!reduced)elapsed+=delta;
        pointerX+=(aimX-pointerX)*.04;pointerY+=(aimY-pointerY)*.04;
        draw(elapsed);
      }
      if(!reduced)frame=requestAnimationFrame(tick);
    }
    function start() {if(!frame&&visible&&!document.hidden){lastFrame=performance.now();frame=requestAnimationFrame(tick);}}
    function wish() {
      const now=performance.now();if(reduced||now-lastWish<900)return;lastWish=now;
      for(let i=0;i<55;i++) {const a=range(-Math.PI,0);const speed=range(30,110);bursts.push({born:elapsed,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,angle:rand()*TAU,size:range(1.5,4),color:pick(['#f3d58d','#fff0c9','#d5ab66','#b9d1e5'])});}start();
    }
    $('.candle-touch').addEventListener('click',wish);
    $('.hero').addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!reduced){aimX=(e.clientX/innerWidth-.5)*2;aimY=(e.clientY/innerHeight-.5)*2;}});
    $('.hero').addEventListener('pointerleave',()=>{aimX=0;aimY=0;});
    const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else if(frame){cancelAnimationFrame(frame);frame=0;}},{threshold:0});visibilityObserver.observe(canvas);
    addEventListener('scroll',()=>{scrollDirty=true;if(!frame)requestAnimationFrame(updateScroll);},{passive:true});
    addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else start();});
    motion.addEventListener('change',()=>{reduced=motion.matches;if(reduced){document.querySelectorAll('.handwriting path').forEach(p=>{p.getAnimations().forEach(a=>a.cancel());p.style.strokeDashoffset='0';});draw(0);}else start();});
    resize();updateScroll();start();
  })();
