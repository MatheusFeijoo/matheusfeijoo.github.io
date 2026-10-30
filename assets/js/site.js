/* Shared behaviour: site look, hero dot field, small helpers. */
(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- chosen look: dark, teal accent, photo beside the intro ---- */
  root.setAttribute('data-theme','dark');
  root.setAttribute('data-accent','teal');
  root.setAttribute('data-photo','card');

  /* ---- helpers ---- */
  window.MPP={
    esc:function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});},
    md:function(s){return window.MPP.esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');}
  };

  /* ---- hero dot field: a halftone of a slowly drifting surface.
         The cursor works like a lens (dots swell and push away); a click or tap drops a ripple that spreads like water. ---- */
  var cv=document.getElementById('field');
  if(!cv)return;
  function redraw(){draw(performance.now(),true);}
  var ctx=cv.getContext('2d'),host=cv.closest('.hero'),S=14,t0=performance.now(),last=0,mx=-999,my=-999,ripples=[];
  function f(x,y,t){
    return Math.sin(x*.0095+t*.10)*Math.cos(y*.012-t*.05)
      +.6*Math.sin((x+y)*.0058-t*.08)
      +.35*Math.cos(x*.016-y*.010+t*.06);
  }
  host.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;if(reduce)redraw();});
  host.addEventListener('pointerleave',function(){mx=my=-999;if(reduce)redraw();});
  host.addEventListener('pointerdown',function(e){
    if(e.target.closest('a,button'))return;
    var r=cv.getBoundingClientRect();ripples.push({x:e.clientX-r.left,y:e.clientY-r.top,t:performance.now()});
    if(ripples.length>6)ripples.shift();
  });
  function draw(now,force){
    if(!force&&now-last<30)return;last=now;
    var w=cv.clientWidth,h=cv.clientHeight,dpr=Math.min(window.devicePixelRatio||1,2);
    if(!w||!h)return;
    if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    var cs=getComputedStyle(root),acc=cs.getPropertyValue('--accent').trim(),dot=cs.getPropertyValue('--dot').trim();
    var t=reduce?0:(now-t0)/1000,cold=new Path2D(),warm=new Path2D();
    ripples=ripples.filter(function(rp){return now-rp.t<2600;});
    for(var y=S/2;y<h;y+=S)for(var x=S/2;x<w;x+=S){
      var v=f(x,y,t),r=Math.max(.5,Math.min(2.7,(v+.35)*1.45)),px=x,py=y,hot=v>1.05;
      var dx=x-mx,dy=y-my,d=Math.sqrt(dx*dx+dy*dy)||1;
      if(d<190){var near=1-d/190;r+=near*2.6;px+=dx/d*near*14;py+=dy/d*near*14;if(near>.3)hot=true;}
      for(var k=0;k<ripples.length;k++){
        var rp=ripples[k],age=(now-rp.t)/1000,rad=age*330,ex=x-rp.x,ey=y-rp.y,rd=Math.sqrt(ex*ex+ey*ey),band=Math.abs(rd-rad);
        if(band<34){var a=(1-band/34)*(1-age/2.6);r+=a*3.2;if(rd>0){px+=ex/rd*a*6;py+=ey/rd*a*6;}if(a>.25)hot=true;}
      }
      var p=hot?warm:cold;
      p.moveTo(px+r,py);p.arc(px,py,r,0,6.2832);
    }
    ctx.fillStyle=dot;ctx.fill(cold);
    ctx.fillStyle=acc;ctx.globalAlpha=.85;ctx.fill(warm);ctx.globalAlpha=1;
  }
  function loop(now){draw(now,false);requestAnimationFrame(loop);}
  if(reduce)redraw();else requestAnimationFrame(loop);
  window.addEventListener('resize',redraw);
})();
