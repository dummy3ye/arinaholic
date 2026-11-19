(function(){
  var R=['home','work','kernel','uses','contact'];
  function go(){
    var h=(location.hash||'#home').slice(1);if(R.indexOf(h)<0)h='home';
    document.body.dataset.route=h;
    R.forEach(function(r){document.getElementById('p-'+r).classList.toggle('on',r===h)});
    document.querySelectorAll('nav a').forEach(function(a){
      if(a.getAttribute('href')==='#'+h)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
    document.title=(h==='home'?'':h+' · ')+'sagittarius';
    window.scrollTo(0,0);
  }
  addEventListener('hashchange',go);go();
  requestAnimationFrame(function(){requestAnimationFrame(function(){document.body.classList.add('ready')})});

})();
