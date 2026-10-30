/* "Keep the city dry": catch the rain with a levee; every missed drop raises the water. Needs <canvas id="game">, #game-start, #game-msg. */
(function(){
  var cv=document.getElementById('game');if(!cv)return;
  var ctx=cv.getContext('2d'),root=document.documentElement,startBtn=document.getElementById('game-start'),msg=document.getElementById('game-msg'),scoreEl=document.getElementById('game-score'),bestEl=document.getElementById('game-best');
  var W=0,H=0,running=false,last=0,drops=[],splashes=[],paddle={x:0,w:76},keys={},water=0,score=0,spawn=0,elapsed=0,best=0,buildings=[];
  try{best=+localStorage.getItem('mpp-game-best')||0;}catch(e){}
  bestEl.textContent=best;

  function size(){
    var dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    buildings=[];var x=6;var seed=7;
    while(x<W-6){seed=(seed*9301+49297)%233280;var bw=22+seed%26,bh=26+(seed%5)*11;buildings.push({x:x,w:bw,h:bh});x+=bw+6;}
    if(!paddle.x)paddle.x=W/2;
    if(!running)draw();
  }
  function col(n){return getComputedStyle(root).getPropertyValue(n).trim();}
  function cityTop(){return H-12-Math.max.apply(null,buildings.map(function(b){return b.h;}))*.8;}

  function reset(){drops=[];splashes=[];water=0;score=0;spawn=0;elapsed=0;paddle.x=W/2;scoreEl.textContent='0';}
  function start(){reset();running=true;msg.hidden=true;last=performance.now();cv.focus();requestAnimationFrame(loop);}
  function end(){
    running=false;
    if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('mpp-game-best',String(best));}catch(e){}}
    msg.querySelector('p').textContent='The city flooded. You caught '+score+' drop'+(score===1?'':'s')+'.';
    startBtn.textContent='Play again';msg.hidden=false;
  }

  function loop(now){
    if(!running)return;
    var dt=Math.min(.05,(now-last)/1000);last=now;elapsed+=dt;
    var rate=.75+elapsed*.055;spawn+=dt*rate*1.6;
    while(spawn>1){spawn--;drops.push({x:14+Math.random()*(W-28),y:-8,v:90+Math.random()*50+elapsed*4});}
    var sp=380*dt;if(keys.ArrowLeft||keys.a)paddle.x-=sp;if(keys.ArrowRight||keys.d)paddle.x+=sp;
    paddle.x=Math.max(paddle.w/2,Math.min(W-paddle.w/2,paddle.x));
    var py=H-82;
    for(var i=drops.length-1;i>=0;i--){
      var d=drops[i];d.y+=d.v*dt;
      if(d.y>=py-3&&d.y<=py+8&&Math.abs(d.x-paddle.x)<=paddle.w/2+3){drops.splice(i,1);score++;scoreEl.textContent=score;splashes.push({x:d.x,y:py,t:0});continue;}
      if(d.y>H-water-10){drops.splice(i,1);water+=4.2;}
    }
    splashes.forEach(function(s){s.t+=dt;});splashes=splashes.filter(function(s){return s.t<.35;});
    draw();
    if(H-water<=cityTop())end();else requestAnimationFrame(loop);
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    var acc=col('--accent'),mut=col('--muted'),faint=col('--faint'),txt=col('--text');
    /* skyline as dot-filled blocks */
    buildings.forEach(function(b){
      for(var y=H-12;y>H-12-b.h;y-=6)for(var x=b.x+3;x<b.x+b.w-1;x+=6){
        ctx.fillStyle=faint;ctx.globalAlpha=.9;ctx.fillRect(x,y,2,2);
      }
    });
    ctx.globalAlpha=1;
    /* water: dotted, rising */
    if(water>0){
      var top=H-water,t=performance.now()/400;
      ctx.fillStyle=acc;
      for(var y=H-2;y>top;y-=5)for(var x=2;x<W;x+=5){
        var wave=Math.sin(x*.05+t)*2;if(y<top+wave+2)continue;
        ctx.globalAlpha=.25+.45*((H-y)/Math.max(water,1));ctx.fillRect(x,y,2,2);
      }
      ctx.globalAlpha=1;
    }
    /* drops */
    ctx.fillStyle=acc;
    drops.forEach(function(d){ctx.beginPath();ctx.arc(d.x,d.y,3.2,0,6.2832);ctx.fill();ctx.globalAlpha=.35;ctx.fillRect(d.x-1,d.y-12,2,8);ctx.globalAlpha=1;});
    splashes.forEach(function(s){ctx.strokeStyle=acc;ctx.globalAlpha=1-s.t/.35;ctx.beginPath();ctx.arc(s.x,s.y,4+s.t*40,Math.PI,0);ctx.stroke();ctx.globalAlpha=1;});
    /* levee */
    var py=H-82;
    ctx.fillStyle=txt;ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(paddle.x-paddle.w/2,py,paddle.w,7,4);else ctx.rect(paddle.x-paddle.w/2,py,paddle.w,7);
    ctx.fill();
    /* danger line */
    ctx.strokeStyle=mut;ctx.setLineDash([2,4]);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(0,cityTop());ctx.lineTo(W,cityTop());ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
  }

  cv.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();paddle.x=e.clientX-r.left;if(!running)draw();});
  cv.addEventListener('pointerdown',function(e){var r=cv.getBoundingClientRect();paddle.x=e.clientX-r.left;});
  cv.addEventListener('keydown',function(e){if(['ArrowLeft','ArrowRight','a','d'].indexOf(e.key)>=0){keys[e.key]=true;e.preventDefault();}});
  cv.addEventListener('keyup',function(e){keys[e.key]=false;});
  startBtn.addEventListener('click',start);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&running){running=false;msg.querySelector('p').textContent='Paused.';startBtn.textContent='Restart';msg.hidden=false;}});
  window.addEventListener('resize',size);
  size();
})();
