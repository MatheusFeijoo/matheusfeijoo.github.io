/* Publications page: filter the list (already in the HTML) by line of work, type and search text. */
(function(){
  var state={theme:'all',type:'all',q:''};
  var h=(location.hash||'').slice(1);if(['resilience','fair','applied'].indexOf(h)>=0)state.theme=h;
  var entries=[].slice.call(document.querySelectorAll('.entry')),groups=[].slice.call(document.querySelectorAll('.yeargroup'));
  var status=document.getElementById('status'),empty=document.getElementById('empty');

  function render(){
    document.querySelectorAll('#f-theme .chip').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===state.theme?'true':'false');});
    document.querySelectorAll('#f-type .chip').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===state.type?'true':'false');});
    var shown=0;
    entries.forEach(function(e){
      var ok=(state.theme==='all'||e.dataset.theme===state.theme)&&(state.type==='all'||e.dataset.group===state.type)&&(!state.q||e.textContent.toLowerCase().indexOf(state.q)>=0);
      e.hidden=!ok;if(ok)shown++;
    });
    groups.forEach(function(g){g.hidden=!g.querySelector('.entry:not([hidden])');});
    status.textContent='Showing '+shown+' of '+entries.length;
    empty.hidden=shown>0;
  }
  document.getElementById('f-theme').addEventListener('click',function(e){var b=e.target.closest('.chip');if(b){state.theme=b.dataset.v;render();}});
  document.getElementById('f-type').addEventListener('click',function(e){var b=e.target.closest('.chip');if(b){state.type=b.dataset.v;render();}});
  document.getElementById('q').addEventListener('input',function(){state.q=this.value.trim().toLowerCase();render();});
  render();

  /* always open at the top, newest papers first */
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  if(!location.hash||state.theme!=='all')window.scrollTo(0,0);
})();
