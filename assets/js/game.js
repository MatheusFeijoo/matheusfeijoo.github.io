/* "Keep the city dry": move the levee to catch the rain; every missed drop raises the water.
   Needs <canvas id="game">, #game-start, #game-msg, #game-score, #game-best inside .game. */
(function(){
  var cv=document.getElementById('game');if(!cv)return;
  var ctx=cv.getContext('2d'),root=document.documentElement,card=cv.closest('.game');
  var startBtn=document.getElementById('game-start'),msg=document.getElementById('game-msg'),scoreEl=document.getElementById('game-score'),bestEl=document.getElementById('game-best');
  var W=0,H=0,running=false,last=0,drops=[],splashes=[],paddle={x:0,w:76},keys={},water=0,score=0,spawn=0,elapsed=0,best=0,buildings=[];
  try{best=+localStorage.getItem('mpp-game-best')||0;}catch(e){}
  bestEl.textContent=best;

  function showMsg(on){msg.style.display=on?'':'none';card.classList.toggle('playing',!on);}
  function size(){
    var dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;
    if(!W||!H)return false;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    buildings=[];var x=6,seed=7;
    while(x<W-6){seed=(seed*9301+49297)%233280;var bw=22+seed%26,bh=26+(seed%5)*11;buildings.push({x:x,w:Math.min(bw,W-6-x),h:bh});x+=bw+6;}
    if(!paddle.x||paddle.x>W)paddle.x=W/2;
    if(!running)draw();
    return true;
  }
  function col(n){return getComputedStyle(root).getPropertyValue(n).trim();}
  function levelY(){return H-82;}
  function floodLine(){var m=0;for(var i=0;i<buildings.length;i++)m=Math.max(m,buildings[i].h);return H-12-m*.8;}

  function reset(){drops=[];splashes=[];water=0;score=0;spawn=0;elapsed=0;paddle.x=W/2;scoreEl.textContent='0';}
  function start(){
    if(!W&&!size())return;
    reset();running=true;showMsg(false);last=performance.now();
    try{cv.focus({preventScroll:true});}catch(e){}
    requestAnimationFrame(loop);
  }
  function stop(text,label){
    running=false;
    if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('mpp-game-best',String(best));}catch(e){}}
    msg.querySelector('h3').textContent=text[0];msg.querySelector('p').textContent=text[1];
    startBtn.textContent=label;showMsg(true);
  }

  function step(dt){
    elapsed+=dt;
    spawn+=dt*(.75+elapsed*.055)*1.6;
    while(spawn>1){spawn--;drops.push({x:14+Math.random()*(W-28),y:-8,v:90+Math.random()*50+elapsed*4});}
    var sp=380*dt;if(keys.ArrowLeft||keys.a)paddle.x-=sp;if(keys.ArrowRight||keys.d)paddle.x+=sp;
    paddle.x=Math.max(paddle.w/2,Math.min(W-paddle.w/2,paddle.x));
    var py=levelY();
    for(var i=drops.length-1;i>=0;i--){
      var d=drops[i],prev=d.y;d.y+=d.v*dt;
      if(prev<=py+6&&d.y>=py-3&&Math.abs(d.x-paddle.x)<=paddle.w/2+4){drops.splice(i,1);score++;scoreEl.textContent=score;splashes.push({x:d.x,y:py,t:0});continue;}
      if(d.y>H-water-6){drops.splice(i,1);water+=4.2;}
    }
    for(i=0;i<splashes.length;i++)splashes[i].t+=dt;
    splashes=splashes.filter(function(s){return s.t<.35;});
  }
  function loop(now){
    if(!running)return;
    var dt=Math.min(.05,(now-last)/1000);last=now;
    step(dt);draw();
    if(H-water<=floodLine())stop(['The city flooded.','You caught '+score+' drop'+(score===1?'':'s')+'. Every missed drop raised the water.'],'Play again');
    else requestAnimationFrame(loop);
  }

  function draw(){
    if(!W)return;
    ctx.clearRect(0,0,W,H);
    var acc=col('--accent'),mut=col('--muted'),faint=col('--faint'),txt=col('--text'),x,y;
    ctx.fillStyle=faint;
    buildings.forEach(function(b){for(y=H-12;y>H-12-b.h;y-=6)for(x=b.x+3;x<b.x+b.w-1;x+=6)ctx.fillRect(x,y,2,2);});
    if(water>0){
      var top=H-water,t=performance.now()/400;ctx.fillStyle=acc;
      for(y=H-2;y>top;y-=5)for(x=2;x<W;x+=5){
        if(y<top+Math.sin(x*.05+t)*2+2)continue;
        ctx.globalAlpha=.25+.45*((H-y)/Math.max(water,1));ctx.fillRect(x,y,2,2);
      }
      ctx.globalAlpha=1;
    }
    ctx.fillStyle=acc;
    drops.forEach(function(d){ctx.beginPath();ctx.arc(d.x,d.y,3.2,0,6.2832);ctx.fill();ctx.globalAlpha=.35;ctx.fillRect(d.x-1,d.y-12,2,8);ctx.globalAlpha=1;});
    ctx.strokeStyle=acc;
    splashes.forEach(function(s){ctx.globalAlpha=1-s.t/.35;ctx.beginPath();ctx.arc(s.x,s.y,4+s.t*40,Math.PI,0);ctx.stroke();});
    ctx.globalAlpha=1;
    var py=levelY();ctx.fillStyle=txt;ctx.fillRect(paddle.x-paddle.w/2,py,paddle.w,7);
    ctx.strokeStyle=mut;ctx.setLineDash([2,4]);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(0,floodLine());ctx.lineTo(W,floodLine());ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
  }

  function aim(e){var r=cv.getBoundingClientRect();paddle.x=e.clientX-r.left;if(!running)draw();}
  cv.addEventListener('pointermove',aim);
  cv.addEventListener('pointerdown',aim);
  cv.addEventListener('keydown',function(e){if(['ArrowLeft','ArrowRight','a','d'].indexOf(e.key)>=0){keys[e.key]=true;e.preventDefault();}});
  cv.addEventListener('keyup',function(e){keys[e.key]=false;});
  cv.addEventListener('blur',function(){keys={};});
  startBtn.addEventListener('click',start);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&running)stop(['Paused.','The game stopped while the page was hidden.'],'Play again');});
  window.addEventListener('resize',function(){size();});
  size();
})();
