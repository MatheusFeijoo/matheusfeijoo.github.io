/* Footer scene: Rio de Janeiro at night in halftone dots. Corcovado with Christ the Redeemer, Sugarloaf with the cable car,
   city lights along Guanabara Bay and their reflections. The landscape is drawn once; only the lights twinkle. */
(function(){
  var cv=document.getElementById('rio');if(!cv)return;
  var ctx=cv.getContext('2d'),reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bg=document.createElement('canvas'),bctx=bg.getContext('2d'),W=0,H=0,Y0=0,lights=[],visible=true,t0=performance.now();

  function rng(seed){return function(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};}
  function bump(u,c,w,h){var d=(u-c)/w;return h*Math.exp(-d*d);}
  function dome(u,c,w,h){var d=(u-c)/w;return d*d<1?h*Math.pow(1-d*d,.42):0;}
  /* heights as a fraction of the horizon height */
  function far(u){
    return .16+.05*Math.sin(u*11+1)+.035*Math.sin(u*29)+.02*Math.sin(u*61)
      +bump(u,.29,.05,.42)+bump(u,.22,.09,.12)+bump(u,.12,.08,.10)+bump(u,.45,.07,.08)-bump(u,.62,.14,.10);
  }
  function near(u){return Math.max(dome(u,.745,.045,.40),dome(u,.672,.04,.19),dome(u,.81,.03,.08));}
  function corcovadoTop(){var best=0,bu=.29;for(var u=.24;u<.34;u+=.001){var h=far(u);if(h>best){best=h;bu=u;}}return{u:bu,h:best};}

  function build(){
    var dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;if(!W||!H)return;
    cv.width=bg.width=Math.round(W*dpr);cv.height=bg.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);bctx.setTransform(dpr,0,0,dpr,0,0);
    Y0=Math.round(H*.7);var S=5,r=rng(7),c=bctx;c.clearRect(0,0,W,H);
    /* moon */
    var mx=W*.9,my=H*.2,mr=Math.min(34,W*.035);
    var g=c.createRadialGradient(mx,my,mr*.5,mx,my,mr*5);g.addColorStop(0,'rgba(110,231,210,.16)');g.addColorStop(1,'rgba(110,231,210,0)');c.fillStyle=g;c.fillRect(0,0,W,Y0);
    for(var y=S/2;y<H;y+=S)for(var x=S/2;x<W;x+=S){
      var u=x/W,hn=near(u)*Y0,hf=far(u)*Y0,top=Y0-hf,ntop=Y0-hn,rad=0,col='';
      var dm=Math.hypot(x-mx,y-my);
      if(y<Y0){
        if(hn>0&&y>ntop){var dep=(y-ntop)/Math.max(hn,1);rad=1.25+dep*.9;col=y-ntop<7?'rgba(110,231,210,.85)':'rgba(70,84,120,'+(.55+dep*.35)+')';}
        else if(y>top){var df=(y-top)/Math.max(hf,1);rad=1.05+df*.7;col=y-top<6?'rgba(110,231,210,.55)':'rgba(44,54,86,'+(.5+df*.4)+')';}
        else if(dm<mr){rad=1.7-dm/mr*.6;col='rgba(226,246,241,.95)';}
        else{var k=y/Y0;rad=.55+k*.35;col='rgba(60,80,130,'+(.12+k*.3)+')';if(r()<.012&&k<.6){rad=.9+r()*.6;col='rgba(230,240,255,'+(.4+r()*.5)+')';}}
      }else{
        var w=(y-Y0)/(H-Y0);rad=.8+w*.9+.35*Math.sin(x*.05+y*.6);
        col='rgba(32,72,110,'+(.35+w*.4)+')';
        if(Math.abs(x-mx)<mr*.8+w*10&&r()<.55){col='rgba(170,235,225,'+(.5-w*.35)+')';}
      }
      if(rad>0){c.fillStyle=col;c.beginPath();c.arc(x,y,Math.max(.3,rad),0,6.2832);c.fill();}
    }
    /* shoreline strip */
    c.fillStyle='rgba(18,22,36,1)';c.fillRect(0,Y0-2,W*.62,3);
    /* cable car between Urca and Sugarloaf */
    var ua=.672,ub=.745,ax=W*ua,ay=Y0-near(ua)*Y0,bx=W*ub,by=Y0-near(ub)*Y0;
    c.strokeStyle='rgba(200,220,235,.55)';c.lineWidth=1;c.setLineDash([2,3]);c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo((ax+bx)/2,Math.max(ay,by)+8,bx,by);c.stroke();c.setLineDash([]);
    c.fillStyle='rgba(255,210,122,.95)';c.fillRect((ax+bx)/2-2,(Math.max(ay,by)+ay+by)/3+1,4,3);
    /* Christ the Redeemer on Corcovado, lit at night */
    var ct=corcovadoTop(),sx=ct.u*W,sy=Y0-ct.h*Y0,sc=Math.max(.8,Math.min(1.5,W/900));
    c.save();c.translate(sx,sy);c.scale(sc,sc);c.shadowColor='rgba(110,231,210,.9)';c.shadowBlur=14;c.fillStyle='#eaf7f4';
    c.fillRect(-2,-4,4,4);            /* pedestal */
    c.beginPath();c.moveTo(-2.4,-4);c.lineTo(-1.6,-17);c.lineTo(1.6,-17);c.lineTo(2.4,-4);c.closePath();c.fill(); /* robe */
    c.fillRect(-11,-17,22,2.2);       /* outstretched arms */
    c.beginPath();c.arc(0,-19.4,1.9,0,6.2832);c.fill(); /* head */
    c.restore();
    var beam=c.createLinearGradient(sx,sy-30,sx,sy+40);beam.addColorStop(0,'rgba(110,231,210,0)');beam.addColorStop(.5,'rgba(110,231,210,.10)');beam.addColorStop(1,'rgba(110,231,210,0)');
    c.fillStyle=beam;c.beginPath();c.moveTo(sx-3,sy);c.lineTo(sx-30,sy+40);c.lineTo(sx+30,sy+40);c.lineTo(sx+3,sy);c.fill();
    /* city lights: along the shore and up the lower slopes */
    lights=[];var lr=rng(42);
    for(var i=0;i<Math.round(W*.42);i++){
      var lu=lr()*.64,ly;
      if(lr()<.6){ly=Y0-2-lr()*14;}else{var hh=far(lu)*Y0;ly=Y0-lr()*hh*.38;}
      if(near(lu)*Y0>Y0-ly)continue;
      lights.push({x:lu*W,y:ly,warm:lr()<.75,p:lr()*6.28,s:.6+lr()*1.6,r:.7+lr()*.9,refl:ly>Y0-8&&lr()<.5});
    }
    for(i=0;i<40;i++){var su=.64+lr()*.36;lights.push({x:su*W,y:Y0-2-lr()*6,warm:lr()<.6,p:lr()*6.28,s:.6+lr()*1.6,r:.6+lr()*.7,refl:lr()<.6});}
    frame(performance.now());
  }

  function frame(now){
    if(!W)return;
    var t=reduce?0:(now-t0)/1000;
    ctx.clearRect(0,0,W,H);ctx.drawImage(bg,0,0,W,H);
    for(var i=0;i<lights.length;i++){
      var L=lights[i],a=.55+.45*Math.sin(t*L.s+L.p);
      ctx.fillStyle=L.warm?'rgba(255,207,120,'+a+')':'rgba(190,245,235,'+a+')';
      ctx.beginPath();ctx.arc(L.x,L.y,L.r,0,6.2832);ctx.fill();
      if(L.refl){
        for(var k=1;k<7;k++){var yy=Y0+3+k*4.5,xx=L.x+Math.sin(t*1.3+k+L.p)*1.6;ctx.globalAlpha=a*(1-k/7)*.7;ctx.fillRect(xx-1.2,yy,2.4,1.4);}
        ctx.globalAlpha=1;
      }
    }
  }
  function loop(now){if(visible)frame(now);requestAnimationFrame(loop);}
  if('IntersectionObserver' in window)new IntersectionObserver(function(e){visible=e[0].isIntersecting;}).observe(cv);
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(build,150);});
  build();
  if(!reduce)requestAnimationFrame(loop);
})();
