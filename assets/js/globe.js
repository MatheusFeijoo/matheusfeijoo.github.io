/* Dotted 3D globe with pins for the places I've worked. Needs window.LAND (land-dots.js) and a <canvas id="globe">.
   Places come from data-place on .xp-item elements; hovering an item turns the globe to its pin. */
(function(){
  var cv=document.getElementById('globe');if(!cv||!window.LAND)return;
  var ctx=cv.getContext('2d'),root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PLACES={
    sansebastian:{name:'San Sebastián',lat:43.32,lon:-1.98},
    delft:{name:'Delft',lat:52.01,lon:4.36},
    rio:{name:'Rio de Janeiro · UFRJ',lat:-22.86,lon:-43.23,dx:12,dy:-8},
    seropedica:{name:'Seropédica · UFRRJ',lat:-22.76,lon:-43.69,dx:-12,dy:16}
  };
  var ROUTE=['seropedica','rio','sansebastian','delft'];
  var D2R=Math.PI/180,L=window.LAND;
  var view={lon:-25,lat:12},target=null,active=null,drag=null,idleAt=0;

  function project(lat,lon,R,cx,cy){
    var p=lat*D2R,l=(lon-view.lon)*D2R,p0=view.lat*D2R;
    var cp=Math.cos(p),x=cp*Math.sin(l),y=Math.cos(p0)*Math.sin(p)-Math.sin(p0)*cp*Math.cos(l),z=Math.sin(p0)*Math.sin(p)+Math.cos(p0)*cp*Math.cos(l);
    return{x:cx+R*x,y:cy-R*y,z:z};
  }
  function slerp(a,b,t){
    var A=vec(a),B=vec(b),d=Math.acos(Math.max(-1,Math.min(1,A[0]*B[0]+A[1]*B[1]+A[2]*B[2]))),s=Math.sin(d);
    var k1=Math.sin((1-t)*d)/s,k2=Math.sin(t*d)/s,v=[A[0]*k1+B[0]*k2,A[1]*k1+B[1]*k2,A[2]*k1+B[2]*k2];
    var lift=1+Math.min(.12,d*.15)*Math.sin(Math.PI*t);
    return{lat:Math.asin(v[2])/D2R,lon:Math.atan2(v[1],v[0])/D2R,lift:lift};
  }
  function vec(p){var a=p.lat*D2R,b=p.lon*D2R;return[Math.cos(a)*Math.cos(b),Math.cos(a)*Math.sin(b),Math.sin(a)];}

  function draw(){
    var w=cv.clientWidth,h=cv.clientHeight,dpr=Math.min(window.devicePixelRatio||1,2);
    if(!w||!h)return;
    if(cv.width!==Math.round(w*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    var cs=getComputedStyle(root),acc=cs.getPropertyValue('--accent').trim(),txt=cs.getPropertyValue('--text').trim(),
        mut=cs.getPropertyValue('--muted').trim(),line=cs.getPropertyValue('--line-strong').trim(),bg=cs.getPropertyValue('--bg').trim();
    var R=Math.min(w,h)/2-28,cx=w/2,cy=h/2;
    /* sphere */
    var g=ctx.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);
    g.addColorStop(0,'rgba(110,231,210,.10)');g.addColorStop(1,'rgba(110,231,210,0)');
    ctx.beginPath();ctx.arc(cx,cy,R,0,6.2832);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=1;ctx.stroke();
    /* land dots, brighter toward the viewer */
    for(var i=0;i<L.length;i+=2){
      var q=project(L[i],L[i+1],R,cx,cy);if(q.z<=0)continue;
      ctx.globalAlpha=.18+.62*q.z;ctx.fillStyle=mut;
      ctx.beginPath();ctx.arc(q.x,q.y,1.15+.5*q.z,0,6.2832);ctx.fill();
    }
    ctx.globalAlpha=1;
    /* route arcs */
    ctx.strokeStyle=acc;ctx.lineWidth=1.4;ctx.setLineDash([3,4]);
    for(var r=0;r<ROUTE.length-1;r++){
      var a=PLACES[ROUTE[r]],b=PLACES[ROUTE[r+1]],started=false;ctx.beginPath();
      for(var t=0;t<=1.0001;t+=.025){
        var s=slerp(a,b,t),q2=project(s.lat,s.lon,R*s.lift,cx,cy),vis=project(s.lat,s.lon,R,cx,cy).z>-.05;
        if(!vis){started=false;continue;}
        if(!started){ctx.moveTo(q2.x,q2.y);started=true;}else ctx.lineTo(q2.x,q2.y);
      }
      ctx.globalAlpha=.7;ctx.stroke();
    }
    ctx.setLineDash([]);ctx.globalAlpha=1;
    /* pins */
    var now=performance.now();
    Object.keys(PLACES).forEach(function(k){
      var p=PLACES[k],q=project(p.lat,p.lon,R,cx,cy);if(q.z<=0.02)return;
      var on=k===active,pr=on?6:4.5;
      if(!reduce){var ph=(now/1600+(k.length*.13))%1;ctx.beginPath();ctx.arc(q.x,q.y,pr+ph*14,0,6.2832);ctx.strokeStyle=acc;ctx.globalAlpha=(1-ph)*.6;ctx.stroke();ctx.globalAlpha=1;}
      ctx.beginPath();ctx.arc(q.x,q.y,pr,0,6.2832);ctx.fillStyle=acc;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=bg;ctx.stroke();
      ctx.font=(on?'600 13px ':'500 12px ')+cs.getPropertyValue('--mono');
      var label=p.name,tw=ctx.measureText(label).width,dx=p.dx||12,dy=p.dy||-12,lx=dx>0?q.x+dx:q.x+dx-tw,ly=q.y+dy;
      if(lx+tw+8>w)lx=w-tw-8;if(lx<8)lx=8;
      ctx.globalAlpha=Math.min(1,q.z*3);
      ctx.fillStyle=bg;ctx.strokeStyle=on?acc:line;ctx.lineWidth=1;
      roundRect(lx-6,ly-11,tw+12,20,4);ctx.fill();ctx.stroke();
      ctx.fillStyle=on?txt:mut;ctx.fillText(label,lx,ly+3);ctx.globalAlpha=1;
    });
  }
  function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

  function tick(){
    if(target){
      var dl=((target.lon-view.lon+540)%360)-180,dp=target.lat-view.lat;
      if(reduce||Math.abs(dl)+Math.abs(dp)<.15){view.lon=target.lon;view.lat=target.lat;target=null;}
      else{view.lon+=dl*.09;view.lat+=dp*.09;}
    }else if(!drag&&!reduce&&performance.now()-idleAt>2500){view.lon+=.06;}
    draw();
    if(!reduce||target)requestAnimationFrame(tick);
  }

  function focus(k){
    if(!PLACES[k])return;active=k;idleAt=performance.now()+1e9;
    target={lon:PLACES[k].lon,lat:Math.max(-35,Math.min(35,PLACES[k].lat*.7))};
    document.querySelectorAll('.xp-item').forEach(function(el){el.classList.toggle('at',el.dataset.place===k);});
    if(reduce)requestAnimationFrame(tick);
  }
  function release(){active=null;idleAt=performance.now();document.querySelectorAll('.xp-item').forEach(function(el){el.classList.remove('at');});if(reduce)draw();}

  document.querySelectorAll('.xp-item').forEach(function(el){
    el.addEventListener('pointerenter',function(){focus(el.dataset.place);});
    el.addEventListener('focusin',function(){focus(el.dataset.place);});
    el.addEventListener('click',function(){focus(el.dataset.place);});
  });
  var list=document.querySelector('.xp-list');
  if(list){list.addEventListener('pointerleave',release);}
  document.querySelectorAll('.place-btn').forEach(function(b){b.addEventListener('click',function(){focus(b.dataset.place);});});

  cv.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY,lon:view.lon,lat:view.lat};target=null;cv.setPointerCapture(e.pointerId);});
  cv.addEventListener('pointermove',function(e){if(!drag)return;view.lon=drag.lon-(e.clientX-drag.x)*.4;view.lat=Math.max(-60,Math.min(60,drag.lat+(e.clientY-drag.y)*.4));if(reduce)draw();});
  function up(){if(drag){drag=null;idleAt=performance.now();}}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  window.addEventListener('resize',draw);
  requestAnimationFrame(tick);
})();
