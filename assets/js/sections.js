/* Inner pages: research timeline (research page), copy email (contact page). */
(function(){
  /* research timeline: hovering or selecting a topic shows its details */
  var rows=[].slice.call(document.querySelectorAll('.rt-row'));
  function pick(t,focus){
    rows.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).classList.toggle('off',!on);});
    if(focus)t.focus();
  }
  /* open a topic from the URL, e.g. /research/#res (used by the homepage focus links) */
  var fromHash=document.getElementById('bar-'+location.hash.slice(1));
  if(fromHash&&rows.indexOf(fromHash)>-1)pick(fromHash);
  rows.forEach(function(t,i){
    t.addEventListener('click',function(){pick(t);});
    t.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&t.getAttribute('aria-selected')!=='true')pick(t);});
    t.addEventListener('keydown',function(e){
      var n=null;
      if(e.key==='ArrowDown'||e.key==='ArrowRight')n=rows[(i+1)%rows.length];
      else if(e.key==='ArrowUp'||e.key==='ArrowLeft')n=rows[(i-1+rows.length)%rows.length];
      if(n){e.preventDefault();pick(n,true);}
    });
  });

  /* copy email */
  var btn=document.getElementById('copy-btn');
  if(btn)btn.addEventListener('click',function(){
    var el=document.getElementById('email');
    function sel(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);btn.textContent='selected';}
    try{navigator.clipboard.writeText(el.textContent).then(function(){btn.textContent='copied';},sel);}catch(e){sel();}
    setTimeout(function(){btn.textContent='copy';},1800);
  });
})();
