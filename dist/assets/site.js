const menu=document.querySelector('.menu'),links=document.querySelector('.nav-links');
if(menu&&links){
 const setMenu=open=>{links.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');menu.textContent=open?'CLOSE ×':'MENU +'};
 menu.setAttribute('aria-controls','site-navigation');links.id='site-navigation';
 menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
 links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus()}});
}

const revealNodes=document.querySelectorAll('.hero h1,.hero-sub,.hero-action,.hero-collage,.section-head,.service-row,.approach h2,.approach-copy,.step,.page-intro h1,.page-intro>p,.service-detail,.about-hero h2,.about-hero>p,.about-values article,.journal-feature,.journal-note-grid article,.work-notes,.service-process-list article,.case-story article,.contact-intro h1,.contact-intro>p,.contact-aside,.contact-page .form');
if('IntersectionObserver'in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in-view');revealObserver.unobserve(entry.target)}}),{threshold:.14,rootMargin:'0px 0px -36px 0px'});
 revealNodes.forEach(node=>{node.classList.add('reveal');revealObserver.observe(node)});
}else revealNodes.forEach(node=>node.classList.add('is-in-view'));

const form=document.querySelector('#project-form');
if(form)form.addEventListener('submit',async e=>{
 e.preventDefault();
 const status=form.querySelector('.form-status');
 const submit=form.querySelector('button[type="submit"]');
 const submitText=submit?.innerHTML;
 if(!status)return;
 status.textContent='Sending your inquiry…';
 if(submit)submit.disabled=true;
 try{
  const response=await fetch('https://formsubmit.co/ajax/design@qafarovs.com',{
   method:'POST',
   headers:{'Content-Type':'application/json','Accept':'application/json'},
   body:JSON.stringify(Object.fromEntries(new FormData(form)))
  });
  const result=await response.json();
  if(!response.ok||String(result.success).toLowerCase()!=='true')throw new Error(result.message||'The inquiry could not be sent.');
  form.reset();
  status.textContent='Thank you — your inquiry has been sent. We’ll be in touch soon.';
 }catch(error){
  status.textContent='We couldn’t send your inquiry right now. Please email design@qafarovs.com.';
 }finally{
  if(submit){submit.disabled=false;submit.innerHTML=submitText}
 }
});

const stage=document.querySelector('.carousel-stage');
if(stage){
 const orbit=stage.querySelector('.work-collage');
 const cards=[...orbit.querySelectorAll('.work-card')];
 const status=document.querySelector('.carousel-status');
 const step=360/cards.length;
 let angle=0,startX=0,startAngle=0,dragging=false,didDrag=false,suppressClick=false,lastInteraction=performance.now(),lastFrame=0,hoveredCard=null,pointerInside=false;
 const mod=(n,m)=>((n%m)+m)%m;
 const setHoveredCard=card=>{if(hoveredCard===card)return;hoveredCard?.classList.remove('is-hovered');hoveredCard=card;hoveredCard?.classList.add('is-hovered');orbit.classList.toggle('is-hovering',Boolean(card));render()};
 const cardAtPoint=(x,y)=>{
  const candidates=cards.map(card=>{const rect=card.querySelector('.work-thumb')?.getBoundingClientRect()||card.getBoundingClientRect();if(x<rect.left||x>rect.right||y<rect.top||y>rect.bottom)return null;const dx=(x-(rect.left+rect.width/2))/Math.max(rect.width,1);const dy=(y-(rect.top+rect.height/2))/Math.max(rect.height,1);return{card,distance:dx*dx+dy*dy}}).filter(Boolean);
  candidates.sort((a,b)=>a.distance-b.distance);
  return candidates[0]?.card||null;
 };
 const render=()=>{
  const rect=stage.getBoundingClientRect();
  const rx=Math.min(rect.width*.39,560);
  const ry=Math.min(rect.height*.30,158);
  const depth=Math.min(rect.height*.25,132);
  const active=mod(Math.round(-angle/step),cards.length);
  cards.forEach((card,i)=>{
   const rad=(90+i*step+angle)*Math.PI/180;
   const front=Math.sin(rad);
   const x=Math.cos(rad)*rx;
   const y=front*ry;
   const z=front*depth;
   const scale=.82+(front+1)*.09;
   const raised=hoveredCard===card,displayZ=raised?depth+60:z;
   card.style.transform=`translate3d(${x}px,${y}px,${displayZ}px) translate(-50%,-50%) scale(${scale+(raised ? .04 : 0)})`;
   card.style.zIndex=String(raised?1000:Math.round(100+z));
   card.setAttribute('aria-current',i===active?'true':'false');
  });
  if(status)status.textContent=`${String(active+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
 };
 const move=direction=>{angle-=direction*step;lastInteraction=performance.now();render()};
 cards.forEach(card=>{
  card.addEventListener('focusin',()=>setHoveredCard(card));
  card.addEventListener('focusout',()=>{if(hoveredCard===card)setHoveredCard(null)});
 });
 document.querySelector('[data-carousel-prev]')?.addEventListener('click',()=>move(-1));
 document.querySelector('[data-carousel-next]')?.addEventListener('click',()=>move(1));
 stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){pointerInside=true;lastFrame=0}});
 stage.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){pointerInside=false;setHoveredCard(null)}});
 stage.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;didDrag=false;startX=e.clientX;startAngle=angle;lastInteraction=performance.now();stage.classList.add('is-dragging');stage.setPointerCapture?.(e.pointerId)});
 stage.addEventListener('pointermove',e=>{lastInteraction=performance.now();if(!dragging){if(e.pointerType==='mouse')setHoveredCard(cardAtPoint(e.clientX,e.clientY));return}const dx=e.clientX-startX;if(Math.abs(dx)>5)didDrag=true;angle=startAngle+dx*.32;render()});
 const endDrag=e=>{if(!dragging)return;dragging=false;stage.classList.remove('is-dragging');lastInteraction=performance.now();if(didDrag){angle=Math.round(angle/step)*step;render();suppressClick=true;window.setTimeout(()=>{suppressClick=false},80)}if(stage.hasPointerCapture?.(e.pointerId))stage.releasePointerCapture(e.pointerId)};
 stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
 stage.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;return}const eventCard=e.target.closest?.('.work-card');if(hoveredCard&&eventCard!==hoveredCard){e.preventDefault();e.stopPropagation();window.location.assign(hoveredCard.href)}},true);
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1)}});
 window.addEventListener('resize',render);
 render();
 const orbitFrame=now=>{if(lastFrame&&!dragging&&!pointerInside&&document.visibilityState==='visible'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){stage.classList.add('is-auto-orbiting');angle-=(now-lastFrame)*.011;render()}else if(!dragging)stage.classList.remove('is-auto-orbiting');lastFrame=now;requestAnimationFrame(orbitFrame)};
 requestAnimationFrame(orbitFrame);
}
document.querySelectorAll('.work-page .work-card .work-thumb').forEach(thumb=>{
 thumb.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=thumb.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;thumb.style.setProperty('--tilt-y',`${(x-.5)*12}deg`);thumb.style.setProperty('--tilt-x',`${(.5-y)*10}deg`);thumb.style.setProperty('--pointer-x',`${x*100}%`);thumb.style.setProperty('--pointer-y',`${y*100}%`)});
 thumb.addEventListener('pointerleave',()=>{thumb.style.setProperty('--tilt-x','0deg');thumb.style.setProperty('--tilt-y','0deg');thumb.style.setProperty('--pointer-x','50%');thumb.style.setProperty('--pointer-y','50%')});
});

const capabilityTabs=[...document.querySelectorAll('.capability-tab')];
const capabilityPanel=document.querySelector('.capability-visual');
const capabilityLink=document.querySelector('[data-capability-link]');
if(capabilityTabs.length&&capabilityPanel){
 capabilityPanel.dataset.rendered='web';
 let capabilityTransitionTimer;
 const chrome='<div class="layer-top"><i></i><i></i><i></i><b></b></div>';
 const scenes={
  web:capabilityPanel.innerHTML,
  brand:`<div class="capability-halo"></div><div class="capability-layer capability-layer-back brand-sheet">${chrome}<div class="brand-back-title">A SYSTEM<br>WITH A POINT OF VIEW</div><div class="brand-swatches"><i></i><i></i><i></i><i></i></div><span class="brand-index">QF / 01</span></div><div class="capability-layer capability-layer-mid brand-poster">${chrome}<div class="brand-poster-name">QAFAROVS</div><div class="brand-poster-mark">Q</div><div class="brand-poster-caption">IDENTITY<br>IN MOTION</div></div><div class="capability-layer capability-layer-front brand-front">${chrome}<div class="brand-front-copy"><small>VISUAL IDENTITY</small><strong>Make<br>a mark.</strong><p>One clear system.<br>Everywhere it appears.</p></div><div class="brand-front-art"><b>Q</b><i></i></div></div><div class="capability-cursor" aria-hidden="true"><span class="arrow-mark">↗</span></div>`,
  growth:`<div class="capability-halo"></div><div class="capability-layer capability-layer-back growth-sheet">${chrome}<small>CAMPAIGN OVERVIEW</small><strong>+38%</strong><div class="growth-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span>REACH THIS MONTH</span></div><div class="capability-layer capability-layer-mid growth-poster">${chrome}<div class="growth-stamp">ONE<br>GOOD<br>IDEA</div><div class="growth-lines"><i></i><i></i><i></i></div><b>MAKE IT<br>MATTER.</b></div><div class="capability-layer capability-layer-front growth-front">${chrome}<div class="growth-copy"><small>GROWTH & COMMUNICATION</small><strong>Reach the<br>right people.</strong><p>Clear message.<br>Better connection.</p></div><div class="growth-chart"><i></i><i></i><i></i><i></i><i></i><b><span class="arrow-mark">↗</span></b></div></div><div class="capability-cursor" aria-hidden="true"><span class="arrow-mark">↗</span></div>`,
  care:`<div class="capability-halo"></div><div class="capability-layer capability-layer-back care-sheet">${chrome}<small>YOUR DIGITAL PRODUCT</small><strong>All systems<br>looking good.</strong><div class="care-status"><i></i> Updated today</div><div class="care-progress"><i></i></div><span>DESIGN&nbsp;&nbsp; BUILD&nbsp;&nbsp; SUPPORT</span></div><div class="capability-layer capability-layer-mid care-devices">${chrome}<div class="care-phone care-phone-a"><i></i><b>Q</b><span></span><span></span></div><div class="care-phone care-phone-b"><i></i><b><span class="arrow-mark">↗</span></b><span></span><span></span></div><div class="care-device-note">BUILT TO<br>KEEP GOING</div></div><div class="capability-layer capability-layer-front care-front">${chrome}<div class="care-copy"><small>CARE & EVOLUTION</small><strong>Keep it<br>moving.</strong><p>Thoughtful updates.<br>Reliable support.</p><div class="care-pill"><i></i> Always improving</div></div><div class="care-art"><span>Q</span><i></i><b></b></div></div><div class="capability-cursor" aria-hidden="true"><span class="arrow-mark">↗</span></div>`
 };
 const activateCapability=tab=>{
  capabilityTabs.forEach(item=>{const active=item===tab;item.classList.toggle('is-active',active);item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1});
  const name=tab.dataset.capability;
  capabilityPanel.dataset.active=name;
  capabilityPanel.setAttribute('aria-labelledby',tab.id);
  if(capabilityPanel.dataset.rendered!==name){
   window.clearTimeout(capabilityTransitionTimer);
   const current=capabilityPanel.querySelector('.capability-scene-incoming');
   const previousMarkup=current?current.innerHTML:capabilityPanel.innerHTML;
   const outgoing=document.createElement('div');outgoing.className='capability-scene capability-scene-outgoing';outgoing.setAttribute('aria-hidden','true');outgoing.innerHTML=previousMarkup;
   const incoming=document.createElement('div');incoming.className='capability-scene capability-scene-incoming';incoming.innerHTML=scenes[name]||scenes.web;
   capabilityPanel.replaceChildren(outgoing,incoming);
   capabilityPanel.dataset.rendered=name;
   capabilityPanel.classList.add('is-changing');
   capabilityTransitionTimer=window.setTimeout(()=>{outgoing.remove();incoming.classList.remove('capability-scene-incoming');capabilityPanel.classList.remove('is-changing')},840);
  }
  if(capabilityLink)capabilityLink.href=`service.html?type=${encodeURIComponent(name)}`;
 };
 capabilityTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>activateCapability(tab));
  tab.addEventListener('keydown',event=>{
   if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
   event.preventDefault();
   const target=event.key==='Home'?0:event.key==='End'?capabilityTabs.length-1:(index+(event.key==='ArrowDown'||event.key==='ArrowRight'?1:-1)+capabilityTabs.length)%capabilityTabs.length;
   capabilityTabs[target].focus();activateCapability(capabilityTabs[target]);
  });
 });
 activateCapability(capabilityTabs.find(tab=>tab.getAttribute('aria-selected')==='true')||capabilityTabs[0]);
 let stackTargetX=0,stackTargetY=0,stackX=0,stackY=0,stackFrame=0,stackLastTime=0;
 const paintStack=()=>{capabilityPanel.style.setProperty('--stack-x',`${stackX.toFixed(2)}px`);capabilityPanel.style.setProperty('--stack-y',`${stackY.toFixed(2)}px`)};
 const easeStack=now=>{
  const elapsed=stackLastTime?now-stackLastTime:16;stackLastTime=now;
  const easing=1-Math.exp(-elapsed/110);
  stackX+=(stackTargetX-stackX)*easing;stackY+=(stackTargetY-stackY)*easing;paintStack();
  if(Math.abs(stackTargetX-stackX)>.025||Math.abs(stackTargetY-stackY)>.025){stackFrame=requestAnimationFrame(easeStack);return}
  stackX=stackTargetX;stackY=stackTargetY;paintStack();stackFrame=0;stackLastTime=0;capabilityPanel.classList.remove('is-pointer-active');
 };
 capabilityPanel.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse')return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){stackTargetX=stackTargetY=stackX=stackY=0;paintStack();return}
  const rect=capabilityPanel.getBoundingClientRect();
  stackTargetX=((event.clientX-rect.left)/rect.width-.5)*18;
  stackTargetY=((event.clientY-rect.top)/rect.height-.5)*14;
  capabilityPanel.classList.add('is-pointer-active');
  if(!stackFrame)stackFrame=requestAnimationFrame(easeStack);
 });
 capabilityPanel.addEventListener('pointerleave',()=>{
  stackTargetX=stackTargetY=0;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){stackX=stackY=0;paintStack();capabilityPanel.classList.remove('is-pointer-active');return}
  if(!stackFrame)stackFrame=requestAnimationFrame(easeStack);
 });
}

const hero=document.querySelector('.hero');
if(hero&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
 hero.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse')return;
  const rect=hero.getBoundingClientRect();
  hero.style.setProperty('--ambient-x',`${((event.clientX-rect.left)/rect.width-.5)*18}px`);
  hero.style.setProperty('--ambient-y',`${((event.clientY-rect.top)/rect.height-.5)*14}px`);
 });
 hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--ambient-x','0px');hero.style.setProperty('--ambient-y','0px')});
}

document.querySelectorAll('.note-card').forEach((card,index)=>{
 const handle=card.querySelector('.note-bar');
 const canvas=card.closest('.notes-canvas');
 if(!handle||!canvas)return;
 let pointerId=null,startX=0,startY=0,offsetX=0,offsetY=0,minX=0,maxX=0,minY=0,maxY=0;
 handle.addEventListener('pointerdown',event=>{
  if(event.button!==undefined&&event.button!==0)return;
  pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;
  offsetX=parseFloat(card.style.getPropertyValue('--drag-x'))||0;
  offsetY=parseFloat(card.style.getPropertyValue('--drag-y'))||0;
  minX=-card.offsetLeft;maxX=canvas.clientWidth-card.offsetWidth-card.offsetLeft;
  minY=-card.offsetTop;maxY=canvas.clientHeight-card.offsetHeight-card.offsetTop;
  card.style.zIndex=String(10+index);card.classList.add('is-dragging');
  handle.setPointerCapture?.(pointerId);event.preventDefault();
 });
 handle.addEventListener('pointermove',event=>{
  if(pointerId!==event.pointerId)return;
  const dx=event.clientX-startX,dy=event.clientY-startY;
  card.style.setProperty('--drag-x',`${Math.min(Math.max(offsetX+dx,minX),maxX)}px`);
  card.style.setProperty('--drag-y',`${Math.min(Math.max(offsetY+dy,minY),maxY)}px`);
 });
 const finish=event=>{if(pointerId!==event.pointerId)return;pointerId=null;card.classList.remove('is-dragging');if(handle.hasPointerCapture?.(event.pointerId))handle.releasePointerCapture(event.pointerId)};
 handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
 handle.addEventListener('keydown',event=>{
  const amount=event.shiftKey?32:12;
  const delta={ArrowLeft:[-amount,0],ArrowRight:[amount,0],ArrowUp:[0,-amount],ArrowDown:[0,amount]}[event.key];
  if(event.key==='Home'){event.preventDefault();card.style.setProperty('--drag-x','0px');card.style.setProperty('--drag-y','0px');return}
  if(!delta)return;
  event.preventDefault();card.style.setProperty('--drag-x',`${(parseFloat(card.style.getPropertyValue('--drag-x'))||0)+delta[0]}px`);card.style.setProperty('--drag-y',`${(parseFloat(card.style.getPropertyValue('--drag-y'))||0)+delta[1]}px`);
 });
});

const aboutScene=document.querySelector('.about-scene'),aboutIntro=document.querySelector('.about-intro');
if(aboutScene&&aboutIntro){
 let frame=0;
 const updateAboutScene=()=>{frame=0;const box=aboutIntro.getBoundingClientRect(),center=box.top+box.height*.5,progress=Math.max(-1.2,Math.min(1.2,(window.innerHeight*.5-center)/window.innerHeight));aboutScene.style.setProperty('--about-scroll',`${progress*42}px`)};
 aboutIntro.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse')return;const r=aboutIntro.getBoundingClientRect();aboutScene.style.setProperty('--about-x',`${((event.clientX-r.left)/r.width-.5)*26}px`)});
 aboutIntro.addEventListener('pointerleave',()=>aboutScene.style.setProperty('--about-x','0px'));
 window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateAboutScene)},{passive:true});window.addEventListener('resize',updateAboutScene);updateAboutScene();
}
