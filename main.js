(() => {
  'use strict';
  const projects = window.portfolioProjects;
  const categories = {visual:'Visual Design',uiux:'UI/UX',brand:'Brand Design',technology:'Creative Technology',photography:'Photography'};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:820px)');
  const $ = selector => document.querySelector(selector);
  const clamp = n => Math.max(0, Math.min(1, n));
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const home = $('#home-view'), categoryView = $('#category-view'), projectView = $('#project-view');
  const nav = $('#tnav');
  let route = location.hash || '#hero';
  let returnRoute = '#works', returnScroll = 0, returnRailScroll = 0, returnFocus = null;
  let previousProject = '';

  /* The original logo remains the cursor; red is the interaction signal. */
  const cursor = $('#cur');
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    cursor.classList.add('visible');
    cursor.style.transform = `translate3d(${event.clientX - 18}px,${event.clientY - 14}px,0)`;
    cursor.classList.toggle('over-link', Boolean(event.target.closest('a,button,select,[role="button"]')));
  }, {passive:true});
  document.addEventListener('pointerleave', () => cursor.classList.remove('visible'));

  /* Figma's hero photograph opens the original looping photo sequence. */
  const heroImages = ['assets/figma/hero.png',
    'assets/hero-loop/01-zfc-2835.jpg','assets/hero-loop/02-dairy-cow2.jpg','assets/hero-loop/03-zfc-0616.jpg',
    'assets/hero-loop/04-zfc-0703.jpg','assets/hero-loop/05-zfc-0833.jpg','assets/hero-loop/06-zfc-1841.jpg',
    'assets/hero-loop/07-zfc-2394.jpg','assets/hero-loop/08-zfc-2442.jpg','assets/hero-loop/09-zfc-2882.jpg',
    'assets/hero-loop/10-zfc-3377.jpg','assets/hero-loop/11-zfc-8845.jpg','assets/hero-loop/12-zfc-8876.jpg',
    'assets/hero-loop/13-zfc-8932.jpg','assets/hero-loop/14-zfc-9008.jpg','assets/hero-loop/15-zfc-0910.jpg'];
  const heroLayers = [...document.querySelectorAll('.hero-bg')];
  let heroIndex = 0, heroLayer = 0;
  setInterval(() => {
    if (document.hidden || reduced.matches || home.hidden || $('#hero').getBoundingClientRect().bottom < 0) return;
    const next = (heroIndex + 1) % heroImages.length;
    const image = new Image();
    image.onload = () => {
      heroIndex = next;heroLayer = 1 - heroLayer;
      heroLayers[heroLayer].style.backgroundImage = `url('${heroImages[next]}')`;
      heroLayers[heroLayer].classList.add('is-active');heroLayers[1 - heroLayer].classList.remove('is-active');
    };
    image.src = heroImages[next];
  }, 5000);

  /* Progressive reveal: content is fully readable when motion is reduced. */
  let revealObserver;
  if (!reduced.matches && 'IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
    }), {threshold:.08});
  }
  function observeReveals(root = document) {
    if (revealObserver) root.querySelectorAll('.reveal,.reveal-image').forEach(el => revealObserver.observe(el));
  }

  /* A complete scroll chapter: each project has its own stable reading interval. */
  const featuredFirst = ['kocep','the-last-witness','10-beans-home','kocep-logo','dizengoff-center','fashion-illustrations'];
  const featured = [...featuredFirst.map(id=>projects.find(p=>p.id===id)), ...projects.filter(p=>p.featured&&!featuredFirst.includes(p.id))];
  const featureSection = $('#works');
  const list = $('#featured-list'), stage = $('#featured-stage');
  let featuredIndex = -1, featureStep = 600, featureHold = 180;
  list.innerHTML = featured.map((p, i) => `<button class="featured-row" data-feature="${i}" aria-label="Select ${escape(p.title)}"><strong>${escape(p.title)}</strong><small>${escape(p.type === 'GAME' ? 'Narrative Game' : p.type.toLowerCase())}</small></button>`).join('');
  stage.innerHTML = featured.map((p,i)=>`<a class="featured-image" data-slide="${i}" href="#project/${p.id}" aria-label="View ${escape(p.title)}" tabindex="-1"><img src="${escape(p.cover)}" alt="${escape(p.alt)}" decoding="async" /><span class="image-open" aria-hidden="true">View project <svg class="ui-arrow" aria-hidden="true" viewBox="0 0 16 16" fill="none" style="rotate:-45deg"><path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.3"/></svg></span></a>`).join('');
  const rows = [...list.children], featureSlides = [...stage.children];
  function sizeFeaturedImages(){
    if(home.hidden)return;
    const maxWidth=stage.clientWidth*.88, maxHeight=stage.clientHeight*.82;
    featureSlides.forEach(slide=>{
      const img=slide.querySelector('img');
      if(!img.naturalWidth)return;
      const scale=Math.min(maxWidth/img.naturalWidth,maxHeight/img.naturalHeight,1);
      slide.style.width=`${img.naturalWidth*scale}px`;slide.style.height=`${img.naturalHeight*scale}px`;
    });
  }
  featureSlides.forEach(slide=>slide.querySelector('img').addEventListener('load',sizeFeaturedImages));
  function showFeatured(index){
    const nextIndex=Math.max(0,Math.min(featured.length-1,index));
    if(nextIndex===featuredIndex)return;
    featuredIndex=nextIndex;
    rows.forEach((row,i)=>{
      const distance=i-featuredIndex;
      row.style.setProperty('--row-offset',distance);
      row.classList.toggle('is-current',distance===0);
      row.classList.toggle('is-before',distance===-1);row.classList.toggle('is-after',distance===1);
      row.tabIndex=Math.abs(distance)<=1?0:-1;
      row.setAttribute('aria-hidden',String(Math.abs(distance)>1));row.setAttribute('aria-pressed',String(distance===0));
    });
    featureSlides.forEach((slide,i)=>{
      const distance=i-featuredIndex;
      slide.style.setProperty('--slide-offset',Math.max(-2,Math.min(2,distance)));
      slide.classList.toggle('is-current',distance===0);
      slide.tabIndex=distance===0?0:-1;slide.setAttribute('aria-hidden',String(distance!==0));
      slide.id=distance===0?'featured-image-link':'';
    });
    $('#featured-count').textContent=`${String(featuredIndex+1).padStart(2,'0')} / ${String(featured.length).padStart(2,'0')}`;
    $('#featured-prev').disabled=featuredIndex===0;$('#featured-next').disabled=featuredIndex===featured.length-1;
    $('.featured-progress span').style.transform=`scaleX(${(featuredIndex+1)/featured.length})`;
  }
  function measureFeatured(){
    if(home.hidden)return;
    const height=$('.featured-page').offsetHeight;
    featureStep=Math.max(380,Math.min(520,height*.6));featureHold=height*.18;
    featureSection.style.height=`${height+featureStep*(featured.length-1)+featureHold*2}px`;
    sizeFeaturedImages();updateFeatured();
  }
  function updateFeatured(){
    if(home.hidden)return;
    const distance=-featureSection.getBoundingClientRect().top;
    const position=Math.max(0,(distance-featureHold)/featureStep);
    const candidate=Math.floor(position+.5);
    if(featuredIndex<0 || Math.abs(position-featuredIndex)>.58)showFeatured(candidate);
  }
  function goFeatured(index){
    const target=Math.max(0,Math.min(featured.length-1,index));
    window.scrollTo({top:scrollY+featureSection.getBoundingClientRect().top+featureHold+target*featureStep,behavior:reduced.matches?'instant':'smooth'});
  }
  rows.forEach((row,i)=>row.addEventListener('click',()=>{
    if(i===featuredIndex){returnRoute=route;returnScroll=scrollY;returnFocus=row;location.hash='project/'+featured[i].id;}
    else goFeatured(i);
  }));
  $('#featured-prev').addEventListener('click',()=>goFeatured(featuredIndex-1));
  $('#featured-next').addEventListener('click',()=>goFeatured(featuredIndex+1));
  $('.featured-layout').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    event.preventDefault();
    goFeatured(event.key==='Home'?0:event.key==='End'?featured.length-1:featuredIndex+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1));
  });
  showFeatured(0);

  /* Shared first-to-last gallery for Other Works and every category page. */
  const rails = [];
  function galleryCard(p,index) {
    const widths=[560,320,540,480];
    return `<a class="orbit-card" style="--card-width:${widths[index%widths.length]}px" href="#project/${p.id}" aria-label="View ${escape(p.title)}"><div class="orbit-image"><img src="${escape(p.cover)}" alt="${escape(p.alt)}" loading="lazy" decoding="async" /></div><span class="orbit-caption">${escape(p.type.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()))}<small>${escape(p.title)}</small></span></a>`;
  }
  function configureRail(section, items) {
    const track=section.querySelector('.orbit-track');track.innerHTML=items.map(galleryCard).join('');
    let rail=rails.find(r=>r.section===section);
    if(!rail){
      rail={section,track,viewport:section.querySelector('.orbit-window'),progress:0,travel:0,items:[]};rails.push(rail);
      section.querySelector('.orbit-prev').addEventListener('click',()=>stepRail(rail,-1));
      section.querySelector('.orbit-next').addEventListener('click',()=>stepRail(rail,1));
      rail.viewport.addEventListener('keydown',event=>{if(event.key==='Home'||event.key==='End'){event.preventDefault();scrollRail(rail,event.key==='Home'?0:rail.travel);}else if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();stepRail(rail,event.key==='ArrowRight'?1:-1);}});

      track.addEventListener('focusin',event=>{
        const card=event.target.closest('.orbit-card');if(!card)return;
        const target=card.offsetLeft-track.offsetLeft;
        const left=target-rail.progress*rail.travel;
        if(left<0||left+card.offsetWidth>rail.viewport.clientWidth)scrollRail(rail,Math.min(rail.travel,target));
      });
    }
    rail.items=items;rail.progress=0;rail.viewport.scrollLeft=0;measureRails();
  }
  function measureRails(){
    measureFeatured();
    rails.forEach(rail=>{
      if(!rail.section.getClientRects().length)return;
      const padding=parseFloat(getComputedStyle(rail.viewport).paddingLeft)*2;
      rail.travel=Math.max(0,rail.track.scrollWidth-rail.viewport.clientWidth+padding);
      rail.hold=rail.section.querySelector('.orbit-sticky').offsetHeight*.3;
      rail.section.style.height=`${rail.section.querySelector('.orbit-sticky').offsetHeight+rail.travel*1.3+rail.hold*2}px`;
      updateRail(rail);
    });
  }
  function updateRail(rail){
    if(!rail.section.getClientRects().length)return;
    const distance=-rail.section.getBoundingClientRect().top-rail.hold;
    const offset=Math.min(rail.travel,Math.max(0,distance/1.3));
    rail.progress=rail.travel?clamp(offset/rail.travel):0;
    rail.track.style.transform=`translate3d(${-offset}px,0,0)`;
    rail.section.querySelector('.orbit-progress span').style.transform=`scaleX(${rail.travel?rail.progress:1})`;
    const cards=[...rail.track.children];
    let current=0;cards.forEach((card,i)=>{if(card.offsetLeft-rail.track.offsetLeft<=offset+60)current=i;});
    if(rail.progress>.98)current=cards.length-1;
    const status=rail.section.querySelector('.orbit-status');
    const label=`${String(current+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    if(status.textContent!==label)status.textContent=label;
    rail.section.querySelector('.orbit-prev').disabled=offset<2;
    rail.section.querySelector('.orbit-next').disabled=!rail.travel||rail.progress>.998;
  }
  function scrollRail(rail,offset){
    window.scrollTo({top:scrollY+rail.section.getBoundingClientRect().top+rail.hold+offset*1.3,behavior:reduced.matches?'instant':'smooth'});
  }
  function stepRail(rail,direction){
    const offset=rail.progress*rail.travel;
    const positions=[...rail.track.children].map(card=>Math.min(rail.travel,card.offsetLeft-rail.track.offsetLeft));
    const target=direction>0?positions.find(x=>x>offset+10):positions.reverse().find(x=>x<offset-10);
    scrollRail(rail,target??(direction>0?rail.travel:0));
  }
  // The design shows illustration, poster, and stop motion first.
  const otherOrder=[14,11,13,8,9,10,12];
  configureRail($('#other-works'),[projects.find(p=>p.id==='kocep-logo'),...otherOrder.map(i=>projects[i]),...['dairy-cow','doggie-playground','inbar-solomon-quartet'].map(id=>projects.find(p=>p.id===id))]);

  function renderProject(p){
    $('#project-title').textContent=p.title;$('#project-type').textContent=p.type;$('#project-year').textContent=p.year;
    $('#project-description').textContent=p.description;$('#project-note').textContent=p.note;
    $('#project-back').href=returnRoute;$('.project-end-back').href=returnRoute;
    const embed=p.embed||(p.id==='the-last-witness'?'https://xiao-ooo.github.io/Final_LAMIMI/':'');
    $('#project-media').innerHTML=(embed?`<section class="interactive-project" aria-label="Explore ${escape(p.title)}"><iframe src="${escape(embed)}" title="${escape(p.title)} — live website" allow="fullscreen" allowfullscreen></iframe><a href="${escape(embed)}" target="_blank" rel="noopener noreferrer">Open ${escape(p.title)} in a new tab <svg class="ui-arrow" aria-hidden="true" viewBox="0 0 16 16" fill="none" style="rotate:-45deg"><path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.3"/></svg></a></section>`:'')+p.images.map((src,i)=>{
      const label=p.labels[i]||p.title;
      if(src.startsWith('instagram:'))return `<a class="reel-link" href="${escape(src.slice(10))}" target="_blank" rel="noopener noreferrer">Watch ${escape(p.title)} on Instagram <svg class="ui-arrow" aria-hidden="true" viewBox="0 0 16 16" fill="none" style="rotate:-45deg"><path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" stroke-width="1.3"/></svg></a>`;
      const media=/\.(mp4|mov|webm)$/i.test(src)?`<video src="${escape(src)}" controls playsinline preload="metadata"></video>`:`<img src="${escape(src)}" alt="${escape(label)}" loading="lazy" decoding="async" />`;
      return `<figure class="project-media-item reveal-image">${media}<figcaption>${String(i+1).padStart(2,'0')} — ${escape(label)}</figcaption></figure>`;
    }).join('');
    observeReveals(projectView);
  }
  function applyRoute(initial=false){
    cancelAnimationFrame(quickFrame);clearTimeout(settleTimer);quickUntil=0;
    const next=location.hash||'#hero';
    projectView.querySelectorAll('video').forEach(v=>v.pause());
    const isCategory=next.startsWith('#category/'), isProject=next.startsWith('#project/');
    if(isProject){
      const p=projects.find(p=>'#project/'+p.id===next);
      if(!p){location.replace('#works');return;}
      home.hidden=true;categoryView.hidden=true;projectView.hidden=false;renderProject(p);
      document.title=p.title+' — Jully Li';
    }else if(isCategory){
      const key=next.slice(10);
      if(!categories[key]){location.replace('#about');return;}
      home.hidden=true;projectView.hidden=true;categoryView.hidden=false;
      $('#category-title').textContent=categories[key];
      $('.category-nav').innerHTML=Object.entries(categories).map(([k,label])=>`<a href="#category/${k}" ${k===key?'aria-current="page"':''}>${label}</a>`).join('');
      configureRail($('.category-orbit'),projects.filter(p=>p.categories.includes(key)).sort((a,b)=>(b.id==='kocep-logo')-(a.id==='kocep-logo')));
      document.title=categories[key]+' — Jully Li';
    }else{
      home.hidden=false;categoryView.hidden=true;projectView.hidden=true;document.title='Jully Li — Artist & Designer';
    }
    const wasProject=route.startsWith('#project/');if(wasProject)previousProject=route;route=next;
    nav.classList.toggle('is-sticky',isProject||isCategory);
    requestAnimationFrame(()=>{
      measureRails();
      if(wasProject&&next===returnRoute&&!initial){window.scrollTo({top:returnScroll,behavior:'instant'});if(isCategory&&mobile.matches)$('#category-track').parentElement.scrollLeft=returnRailScroll;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else [...(isCategory?categoryView:home).querySelectorAll('a')].find(link=>link.getAttribute('href')===previousProject)?.focus({preventScroll:true});}
      else if(isCategory||isProject){window.scrollTo({top:0,behavior:'instant'});(isCategory?$('#category-title'):$('#project-title')).focus({preventScroll:true});}
      else {const target=document.getElementById(next.slice(1)||'hero');target?.scrollIntoView({behavior:initial||reduced.matches?'instant':'smooth'});}
      updatePage();
    });
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');if(!link)return;
    const target=link.getAttribute('href');
    if(target==='#hero'&&!home.hidden){event.preventDefault();quickScroll(0);return;}
    if(target.startsWith('#project/')){returnRoute=route;returnScroll=scrollY;returnRailScroll=link.closest('.orbit-window')?.scrollLeft||0;returnFocus=link;}
    if(target===location.hash){event.preventDefault();if(target.startsWith('#category/'))window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});else document.getElementById(target.slice(1))?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});}
  });
  // The current featured text opens the same detailed page as its photo.
  list.addEventListener('click',event=>{if(event.target.closest('.is-current')){returnRoute=route;returnScroll=scrollY;returnFocus=event.target.closest('button');}});
  // Returning upward skips the long pinned galleries, while downward browsing stays complete.
  let quickFrame=0, quickUntil=0, settleTimer=0, touchStartY=0, quickReturning=false;
  function quickScroll(top,returning=false){
    quickReturning=returning;
    cancelAnimationFrame(quickFrame);clearTimeout(settleTimer);
    const from=scrollY, started=performance.now(), duration=reduced.matches?0:440;
    quickUntil=started+duration+120;
    function tick(now){
      const t=duration?Math.min(1,(now-started)/duration):1;
      window.scrollTo({top:from+(Math.max(0,top)-from)*(1-Math.pow(1-t,3)),behavior:'instant'});
      if(t<1)quickFrame=requestAnimationFrame(tick);
    }
    quickFrame=requestAnimationFrame(tick);
  }
  function skipBackChapter(){
    if(quickReturning&&performance.now()<quickUntil)return true;
    const sections=[featureSection,...rails.map(r=>r.section)];
    const section=sections.find(el=>{
      if(!el.getClientRects().length)return false;
      const box=el.getBoundingClientRect();
      return box.top<-80&&box.bottom>0&&box.height>innerHeight*1.5;
    });
    if(!section)return false;
    quickScroll(scrollY+section.getBoundingClientRect().top-Math.min(220,innerHeight*.25),true);
    return true;
  }
  // Native scrolling drives the original blur/zoom transitions. Only align
  // the already-selected project after scrolling (including momentum) stops.
  let featureInputDown=false;
  function settleFeatured(){
    clearTimeout(settleTimer);
    if(!featureInputDown||home.hidden||performance.now()<quickUntil)return;
    settleTimer=setTimeout(()=>{
      const distance=-featureSection.getBoundingClientRect().top;
      const last=featureHold+(featured.length-1)*featureStep;
      if(home.hidden||distance<featureHold||distance>last||performance.now()<quickUntil)return;
      const top=scrollY+featureSection.getBoundingClientRect().top+featureHold+featuredIndex*featureStep;
      featureInputDown=false;
      if(Math.abs(top-scrollY)>2)quickScroll(top);
    },200);
  }
  window.addEventListener('wheel',event=>{
    if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.target.closest('iframe'))return;
    clearTimeout(settleTimer);
    featureInputDown=event.deltaY>0;
    if(event.deltaY<0){if(skipBackChapter())event.preventDefault();}
    else if(event.deltaY>0){cancelAnimationFrame(quickFrame);quickUntil=0;}
  },{passive:false});
  window.addEventListener('touchstart',event=>{
    touchStartY=event.touches[0].clientY;featureInputDown=false;
    clearTimeout(settleTimer);cancelAnimationFrame(quickFrame);quickUntil=0;
  },{passive:true});
  window.addEventListener('touchend',event=>{
    const delta=event.changedTouches[0].clientY-touchStartY;
    if(delta>35)skipBackChapter();
    else if(delta<-28){featureInputDown=true;settleFeatured();}
  },{passive:true});
  function updatePage(){
    const pastAbout=!home.hidden&&$('#about').getBoundingClientRect().bottom<=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'))+1;
    nav.classList.toggle('is-sticky',home.hidden||pastAbout);
    updateFeatured();
    rails.forEach(updateRail);
  }
  let scrollFrame=0;
  window.addEventListener('scroll',()=>{settleFeatured();if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updatePage();});},{passive:true});
  window.addEventListener('resize',()=>{measureRails();updatePage();},{passive:true});
  window.addEventListener('hashchange',()=>applyRoute());
  document.fonts?.ready.then(measureRails);
  window.addEventListener('load',measureRails);
  observeReveals();applyRoute(true);
})();
