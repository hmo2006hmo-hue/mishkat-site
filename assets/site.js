// Mishkat website interactions — progressive enhancement only.
(function(){
  const body=document.body;
  body.classList.add('motion-ready');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>body.classList.remove('menu-open')));

  // Reveal sections as the user reaches them.
  const revealSelectors=[
    '.hero-copy','.phone-wrap','.strip-grid>div','.section-head','.feature-card',
    '.dark-grid>div','.steps>div','.download-card','.page-hero .container',
    '.detail-card','.guide-block','.download-main','.install-card','.notice','.help-box','.footer-grid>div'
  ];
  const revealEls=[];
  revealSelectors.forEach(sel=>document.querySelectorAll(sel).forEach((el,i)=>{
    el.classList.add('reveal');
    const n=i%5;if(n)el.classList.add('delay-'+n);
    revealEls.push(el);
  }));
  if('IntersectionObserver' in window&&!reduced){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}
    }),{threshold:.12,rootMargin:'0px 0px -45px 0px'});
    revealEls.forEach(el=>io.observe(el));
  }else revealEls.forEach(el=>el.classList.add('is-visible'));

  // Reading progress + header response.
  const topbar=document.querySelector('.topbar');
  const updateScroll=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const ratio=Math.min(1,Math.max(0,window.scrollY/max));
    body.style.setProperty('--motion-progress',ratio.toFixed(4));
    body.style.setProperty('--scroll-y',window.scrollY+'px');
    if(topbar)topbar.classList.toggle('scrolled',window.scrollY>10);
    // Very subtle parallax on selected elements; never moves content out of place.
    if(!reduced){
      document.querySelectorAll('.scroll-float').forEach(el=>{
        const speed=parseFloat(el.dataset.speed||'.08');
        const r=el.getBoundingClientRect();
        const offset=(window.innerHeight/2-(r.top+r.height/2))*speed;
        el.style.transform=`translate3d(0,${offset.toFixed(1)}px,0)`;
      });
    }
  };
  let ticking=false;
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{updateScroll();ticking=false});ticking=true;}},{passive:true});
  updateScroll();

  // Highlight current feature anchor while reading.
  const anchorLinks=[...document.querySelectorAll('.anchor-nav a[href^="#"]')];
  const anchorTargets=anchorLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(anchorLinks.length&&'IntersectionObserver' in window){
    const ao=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting)anchorLinks.forEach(a=>a.classList.toggle('current',a.getAttribute('href')==='#'+entry.target.id));
    }),{rootMargin:'-18% 0px -62% 0px',threshold:0});
    anchorTargets.forEach(el=>ao.observe(el));
  }

  // Button ripple feedback.
  document.querySelectorAll('.btn').forEach(btn=>btn.addEventListener('click',()=>{
    btn.classList.remove('ripple');void btn.offsetWidth;btn.classList.add('ripple');
  }));

  // Pointer-responsive glow on desktop.
  if(!reduced&&window.matchMedia('(pointer:fine)').matches){
    const glow=document.createElement('div');glow.className='pointer-glow';document.body.appendChild(glow);
    let px=0,py=0,raf=0;
    window.addEventListener('pointermove',e=>{
      px=e.clientX;py=e.clientY;body.classList.add('pointer-active');
      document.documentElement.style.setProperty('--pointer-x',(e.clientX/window.innerWidth*100).toFixed(1)+'%');
      document.documentElement.style.setProperty('--pointer-y',(e.clientY/window.innerHeight*100).toFixed(1)+'%');
      if(!raf)raf=requestAnimationFrame(()=>{glow.style.left=px+'px';glow.style.top=py+'px';raf=0});
    },{passive:true});
    window.addEventListener('pointerleave',()=>body.classList.remove('pointer-active'));
  }

  // Gentle 3D response for the phone preview.
  const phone=document.querySelector('.phone');
  if(phone&&!reduced&&window.matchMedia('(pointer:fine)').matches){
    const wrap=phone.parentElement;
    wrap.addEventListener('pointermove',e=>{
      const r=wrap.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      phone.style.animationPlayState='paused';
      phone.style.transform=`perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) rotate(2deg) translateY(-2px)`;
    });
    wrap.addEventListener('pointerleave',()=>{phone.style.animationPlayState='';phone.style.transform='';});
  }

  // Add a subtle scroll-float class to decorative/visual blocks without changing HTML layout.
  if(!reduced){
    document.querySelectorAll('.hero-shell .pill,.hero-shell .hero-copy p,.download-icon').forEach((el,i)=>{
      el.classList.add('scroll-float');el.dataset.speed=i%2?.035:.02;
    });
  }
})();

// --- V5 interaction layer: the site itself becomes a small interactive demo ---
(function(){
  const body=document.body;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu closes when a menu item is chosen.
  document.querySelectorAll('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>body.classList.remove('menu-open')));

  // Homepage feature filter.
  const filterButtons=[...document.querySelectorAll('.filter-chip')];
  const featureCards=[...document.querySelectorAll('.feature-card[data-group]')];
  if(filterButtons.length&&featureCards.length){
    filterButtons.forEach(btn=>btn.addEventListener('click',()=>{
      const filter=btn.dataset.filter;
      filterButtons.forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-selected',b===btn?'true':'false');});
      featureCards.forEach((card,i)=>{
        const show=filter==='all'||card.dataset.group===filter;
        card.classList.toggle('filter-hidden',!show);
        if(show&&!reduced){card.style.setProperty('--filter-delay',(i%4)*.045+'s');}
      });
    }));
    filterButtons[0].setAttribute('aria-selected','true');
  }

  // Interactive phone mockup: clicking a card changes the screen state.
  const demoMap={
    quran:['القرآن الكريم','تابع وردك','قراءة • تفسير • استماع','الآن: المصحف جاهز للقراءة'],
    adhkar:['الأذكار','وردك اليومي','عدّ • متابعة • إدارة','الآن: ورد الأذكار بانتظارك'],
    khatma:['الختمة','خطة ختمتك','ورد اليوم • تقدم','الآن: تابع موضع وردك'],
    qasida:['القصائد','استمع الآن','بحث • مفضلة • تنزيل','الآن: اختر قصيدة واستمع']
  };
  const screen=document.querySelector('.phone-screen');
  const phoneStatus=document.querySelector('.phone-status');
  document.querySelectorAll('[data-demo]').forEach(card=>card.addEventListener('click',e=>{
    e.preventDefault();
    const d=demoMap[card.dataset.demo];
    if(!d||!screen)return;
    screen.classList.remove('demo-pulse');void screen.offsetWidth;screen.classList.add('demo-pulse');
    const greeting=screen.querySelector('.app-greeting'), title=screen.querySelector('h3'), main=screen.querySelector('.mock-card.main strong'), sub=screen.querySelector('.mock-card.main span');
    if(greeting)greeting.textContent=d[0]; if(title)title.textContent=d[1]; if(main)main.textContent=d[1]; if(sub)sub.textContent=d[2]; if(phoneStatus)phoneStatus.textContent=d[3];
    document.querySelectorAll('.phone-nav [data-phone-tab]').forEach(x=>x.classList.toggle('selected',x.dataset.phoneTab===card.dataset.demo));
  }));

  // Clickable feature/detail cards: expand the details without leaving the page.
  document.querySelectorAll('.detail-card').forEach(card=>{
    const main=card.querySelector('.detail-main');
    if(!main)return;
    card.setAttribute('tabindex','0'); card.setAttribute('role','button'); card.setAttribute('aria-expanded','false');
    const toggle=()=>{const open=card.classList.toggle('expanded');card.setAttribute('aria-expanded',open?'true':'false');};
    card.addEventListener('click',e=>{if(e.target.closest('a'))return;toggle()});
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}});
  });

  // Guide blocks behave like compact interactive steps.
  document.querySelectorAll('.guide-block').forEach(block=>{
    block.setAttribute('tabindex','0');
    block.addEventListener('click',()=>block.classList.toggle('expanded'));
    block.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();block.classList.toggle('expanded')}});
  });

  // Active-page nav state based on the actual file, including the mobile menu.
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.topbar nav a,.mobile-nav a').forEach(a=>{
    const href=(a.getAttribute('href')||'').split('#')[0].toLowerCase();
    if(href===page)a.classList.add('active');
  });
})();

// --- V7: immersive controls, command palette, theme, tilt and guided micro-interactions ---
(function(){
  const body=document.body;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Persistent light/dark appearance.
  const savedTheme=localStorage.getItem('mishkat-theme');
  if(savedTheme==='dark') body.dataset.theme='dark';
  const navInner=document.querySelector('.topbar-inner');
  if(navInner){
    const actions=document.createElement('div'); actions.className='topbar-actions';
    const theme=document.createElement('button'); theme.className='theme-toggle'; theme.type='button'; theme.setAttribute('aria-label','تبديل المظهر');
    const paletteBtn=document.createElement('button'); paletteBtn.className='palette-btn'; paletteBtn.type='button'; paletteBtn.setAttribute('aria-label','فتح البحث السريع'); paletteBtn.textContent='⌕';
    const menu=navInner.querySelector('.menu-btn');
    actions.append(theme,paletteBtn); if(menu) actions.append(menu); else navInner.appendChild(actions);
    if(menu){menu.remove(); actions.appendChild(menu);}
    const paintTheme=()=>{const dark=body.dataset.theme==='dark';theme.textContent=dark?'☀':'◐';theme.title=dark?'المظهر الفاتح':'المظهر الداكن';};
    paintTheme();
    theme.addEventListener('click',()=>{const dark=body.dataset.theme==='dark';body.dataset.theme=dark?'light':'dark';localStorage.setItem('mishkat-theme',dark?'light':'dark');paintTheme();showToast(dark?'تم تفعيل المظهر الفاتح':'تم تفعيل المظهر الداكن');});
    paletteBtn.addEventListener('click',openPalette);
  }

  // Toast feedback.
  let toastTimer;
  function showToast(text){
    let el=document.querySelector('.toast');
    if(!el){el=document.createElement('div');el.className='toast';document.body.appendChild(el)}
    el.innerHTML=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400);
  }
  window.mishkatToast=showToast;

  // Back-to-top control.
  const back=document.createElement('button');back.className='back-top';back.type='button';back.textContent='↑';back.setAttribute('aria-label','العودة إلى الأعلى');document.body.appendChild(back);
  const refreshBack=()=>back.classList.toggle('show',window.scrollY>500);window.addEventListener('scroll',refreshBack,{passive:true});refreshBack();back.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?'auto':'smooth'}));

  // Command palette / fast navigation.
  const links=[...document.querySelectorAll('a[href]')].filter(a=>!a.getAttribute('href').startsWith('#')).map(a=>({label:(a.textContent||'').trim(),href:a.href})).filter(x=>x.label);
  let palette, input, list, selected=0;
  function buildPalette(){
    palette=document.createElement('div');palette.className='palette';palette.innerHTML='<div class="palette-box" role="dialog" aria-modal="true" aria-label="بحث سريع"><div class="palette-search"><input type="search" placeholder="اكتب للوصول السريع…" autocomplete="off"></div><div class="palette-list"></div></div>';
    document.body.appendChild(palette);input=palette.querySelector('input');list=palette.querySelector('.palette-list');input.addEventListener('input',renderPalette);palette.addEventListener('click',e=>{if(e.target===palette)closePalette()});
    renderPalette();
  }
  function renderPalette(){
    const q=input.value.trim().toLowerCase();const items=links.filter(x=>!q||x.label.toLowerCase().includes(q)).slice(0,10);selected=Math.min(selected,Math.max(0,items.length-1));list.innerHTML=items.length?items.map((x,i)=>`<button class="palette-item ${i===selected?'selected':''}" data-href="${x.href}"><span>${x.label}</span><small>فتح</small></button>`).join(''):'<div class="palette-item"><span>لا توجد نتيجة</span></div>';
    list.querySelectorAll('.palette-item[data-href]').forEach(btn=>btn.addEventListener('click',()=>location.href=btn.dataset.href));
  }
  function openPalette(){if(!palette)buildPalette();palette.classList.add('open');input.value='';selected=0;renderPalette();setTimeout(()=>input.focus(),20)}
  function closePalette(){palette&&palette.classList.remove('open')}
  window.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette()}
    if(e.key==='Escape')closePalette();
    if(palette&&palette.classList.contains('open')){
      const items=[...list.querySelectorAll('.palette-item[data-href]')];
      if(e.key==='ArrowDown'&&items.length){e.preventDefault();selected=(selected+1)%items.length;renderPalette()}
      if(e.key==='ArrowUp'&&items.length){e.preventDefault();selected=(selected-1+items.length)%items.length;renderPalette()}
      if(e.key==='Enter'&&items[selected]){e.preventDefault();location.href=items[selected].dataset.href}
    }
  });

  // Magnetic buttons and subtle 3D cards.
  if(!reduced&&window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.btn,.filter-chip,.theme-toggle,.palette-btn,.back-top').forEach(el=>{
      el.classList.add('magnetic');
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`translate(${(x*5).toFixed(1)}px,${(y*4).toFixed(1)}px)`});
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
    document.querySelectorAll('.feature-card,.detail-card,.guide-block,.download-main,.install-card,.download-card').forEach(card=>{
      card.classList.add('tilt-card');
      card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${(-y*2.8).toFixed(2)}deg) rotateY(${(x*3.2).toFixed(2)}deg) translateY(-4px)`});
      card.addEventListener('pointerleave',()=>card.style.transform='');
    });
  }

  // Clickable progress steps with visible active state.
  document.querySelectorAll('.steps>div').forEach((step,i)=>step.addEventListener('click',()=>{
    document.querySelectorAll('.steps>div').forEach(s=>s.classList.remove('active'));step.classList.add('active');showToast(`<b>الخطوة ${String(i+1).padStart(2,'0')}</b> — ${step.querySelector('span')?.textContent||''}`);
  }));

  // Homepage phone demo auto-cycle + user interaction.
  const screen=document.querySelector('.phone-screen');const demos=[...document.querySelectorAll('[data-demo]')];
  if(screen&&demos.length&&!reduced){let idx=0,timer;
    const cycle=()=>{demos[idx%demos.length].click();idx++;};
    timer=setInterval(cycle,4600);screen.addEventListener('pointerenter',()=>clearInterval(timer));screen.addEventListener('pointerleave',()=>{timer=setInterval(cycle,4600)});
    screen.classList.add('live-demo');setTimeout(()=>screen.classList.remove('live-demo'),1400);
  }

  // Make phone navigation itself meaningful in the demo.
  document.querySelectorAll('.phone-nav [data-phone-tab]').forEach(tab=>tab.addEventListener('click',()=>{
    const map={home:'quran',quran:'quran',qasida:'qasida',library:'khatma',more:'adhkar'};const demo=document.querySelector(`[data-demo="${map[tab.dataset.phoneTab]||'quran'}"]`);if(demo)demo.click();
  }));

  // Slightly richer feedback for downloads / major actions without preventing navigation.
  document.querySelectorAll('a[href$="download.html"],a[href$="features.html"],a[href$="guide.html"]').forEach(a=>a.addEventListener('click',()=>showToast(`جارٍ فتح <b>${a.textContent.trim()}</b>`)));
})();

// --- V9: real app-content mini preview, freely usable inside the vertical phone ---
(function(){
  const screen=document.querySelector('#mishkat-phone');
  const status=document.querySelector('.phone-status');
  if(!screen) return;

  const quranAyahs=[
    {n:'٦', text:'إِنَّ ٱلَّذِينَ كَفَرُوا۟ سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ', meta:'البقرة • الآية ٦ • الجزء ١'},
    {n:'٧', text:'خَتَمَ ٱللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰٓ أَبْصَـٰرِهِمْ غِشَـٰوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ', meta:'البقرة • الآية ٧ • الجزء ١'},
    {n:'٨', text:'وَمِنَ ٱلنَّاسِ مَن يَقُولُ ءَامَنَّا بِٱللَّهِ وَبِٱلْيَوْمِ ٱلْءَاخِرِ وَمَا هُم بِمُؤْمِنِينَ', meta:'البقرة • الآية ٨ • الجزء ١'},
    {n:'٩', text:'يُخَـٰدِعُونَ ٱللَّهَ وَٱلَّذِينَ ءَامَنُوا۟ وَمَا يَخْدَعُونَ إِلَّآ أَنفُسَهُمْ وَمَا يَشْعُرُونَ', meta:'البقرة • الآية ٩ • الجزء ١'}
  ];
  const adhkar=[
    {title:'تسبيحة الزهراء عليها السلام', text:'الله أكبر', goal:100},
    {title:'الصلاة على محمد وآل محمد', text:'اللهم صل على محمد وآل محمد', goal:100},
    {title:'الاستغفار', text:'أستغفر الله ربي وأتوب إليه', goal:100}
  ];
  const books=['بحار الأنوار الجامعة لدرر أخبار الأئمة الأطهار علیهم السلام','تفصیل وسائل الشیعة إلی تحصیل مسائل الشریعة','مستدرک الوسائل و مستنبط المسائل','الوافي','الکافي'];
  const songs=[['ملف الاختبار الصوتي','تجربة GitHub Release'],['قصيدة 01','مكتبة القصائد'],['قصيدة 02','مكتبة القصائد']];
  let qIndex=0, dIndex=0, dCount=0, timer=null;

  const esc=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toast(msg){
    let t=screen.querySelector('.mini-toast');
    if(!t){t=document.createElement('div');t.className='mini-toast';screen.appendChild(t)}
    t.textContent=msg;clearTimeout(timer);timer=setTimeout(()=>t.remove(),1700);
  }
  function navSelected(key){document.querySelectorAll('.phone-nav [data-phone-tab]').forEach(x=>x.classList.toggle('selected',x.dataset.phoneTab===key));}
  function setStatus(msg){if(status)status.textContent=msg;}
  function bind(){
    screen.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>render(el.dataset.open)));
    screen.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click',()=>{
      const a=el.dataset.action;
      if(a==='next'){qIndex=(qIndex+1)%quranAyahs.length;render('quran')}
      else if(a==='copy'){toast('تم نسخ الآية');setStatus('تم نسخ الآية من المعاينة')}
      else if(a==='tafsir'){toast('تم فتح مساحة تفسير مختصرة');setStatus('هذه معاينة لفتح التفسير من الآية')}
      else if(a==='play'){el.classList.toggle('is-playing');toast(el.classList.contains('is-playing')?'بدأ الاستماع':'تم إيقاف الاستماع')}
      else if(a==='count'){dCount=Math.min(dCount+1,adhkar[dIndex].goal);render('adhkar');toast('أضيفت تسبيحة واحدة')}
      else if(a==='book'){toast('فتح الكتاب — معاينة فقط');setStatus('تم فتح جزء من تجربة قارئ الكتب')}
      else if(a==='notice'){toast('هذه معاينة تفاعلية للموقع')}
      else if(a==='more'){render('more')}
    }));
  }
  function render(key){
    const q=quranAyahs[qIndex], d=adhkar[dIndex];
    const pages={
      home:`<div class="mini-app mini-page"><div class="mini-statusbar"><span>٩:٤١</span><span>▮▮▮</span></div><div class="mini-top"><div><small>مِشكاة</small><h3>الرئيسية</h3></div><button class="mini-icon" data-action="notice" type="button">◔</button></div><div class="mini-welcome"><span>السلام عليكم</span><strong>ما الذي تريد فعله اليوم؟</strong></div><button class="mini-feature featured" data-open="quran" type="button"><div><small>آخر قراءة</small><strong>سورة البقرة</strong><span>الآيات ٦–١٥ • الجزء ١</span></div><b>متابعة</b></button><div class="mini-section-title"><span>الوصول السريع</span><small>من التطبيق</small></div><div class="mini-grid"><button data-open="adhkar" type="button"><b>الأذكار</b><small>وردك اليومي</small></button><button data-open="qasida" type="button"><b>القصائد</b><small>استمع الآن</small></button><button data-open="library" type="button"><b>المكتبة</b><small>كتبك</small></button><button data-open="more" type="button"><b>المزيد</b><small>أدوات أخرى</small></button></div><div class="mini-tip">اضغط على العناصر وجرب الجزء المتاح من التطبيق.</div></div>`,
      quran:`<div class="mini-app mini-page"><div class="mini-statusbar"><span>الجزء ١</span><span>صفحة ٣</span></div><div class="mini-top"><div><small>القرآن الكريم</small><h3>سورة البقرة</h3></div><button class="mini-icon" data-action="next" type="button">›</button></div><div class="mini-welcome"><span>الآية ${q.n}</span><strong>مصحف مِشكاة</strong></div><div class="mini-quran"><div class="mini-ayah"><div><strong>﴿${q.n}﴾</strong></div><div>${esc(q.text)}</div><small>${esc(q.meta)}</small></div><div class="mini-actions"><button data-action="tafsir" type="button">تفسير</button><button data-action="play" type="button">استماع</button><button data-action="copy" type="button">نسخ</button></div><div class="mini-meter"><i style="width:${25+(qIndex*18)}%"></i></div><div class="mini-section-title"><span>اضغط السهم للآية التالية</span><small>${qIndex+1}/4</small></div></div></div>`,
      adhkar:`<div class="mini-app mini-page"><div class="mini-statusbar"><span>ورد اليوم</span><span>١٠٠</span></div><div class="mini-top"><div><small>الأذكار</small><h3>أذكار اليوم</h3></div><button class="mini-icon" data-action="notice" type="button">◔</button></div><div class="mini-section-title"><span>${esc(d.title)}</span><small>اضغط للعد</small></div><div class="mini-dhikr-card"><p>${esc(d.text)}</p><div class="mini-counter"><button data-action="count" type="button">＋</button><b>${dCount} / ${d.goal}</b><button data-action="count" type="button">ذكر</button></div><div class="mini-meter"><i style="width:${(dCount/d.goal)*100}%"></i></div></div><div class="mini-list">${adhkar.map((x,i)=>`<button data-open="adhkar-${i}" type="button"><span>${esc(x.title)}</span><small>${i===dIndex?'محدد':'ورد'}</small></button>`).join('')}</div></div>`,
      qasida:`<div class="mini-app mini-page"><div class="mini-statusbar"><span>الصوتيات</span><span>المشغل</span></div><div class="mini-top"><div><small>مِشكاة</small><h3>القصائد</h3></div><button class="mini-icon" data-action="notice" type="button">⌕</button></div><div class="mini-track"><div class="art">♫</div><div><b>${esc(songs[0][0])}</b><small>${esc(songs[0][1])}</small></div><button class="mini-play" data-action="play" type="button">▶</button></div><div class="mini-list">${songs.map(x=>`<button data-action="play" type="button"><span>${esc(x[0])}</span><small>▶</small></button>`).join('')}</div><div class="mini-tip">التجربة هنا تحاكي المشغل، بينما التشغيل الكامل موجود داخل التطبيق.</div></div>`,
      library:`<div class="mini-app mini-page"><div class="mini-statusbar"><span>المكتبة</span><span>٢٨٢ كتابًا</span></div><div class="mini-top"><div><small>كتب التطبيق</small><h3>المكتبة</h3></div><button class="mini-icon" data-action="notice" type="button">⌕</button></div><div class="mini-book"><div class="mini-cover">ك</div><div><b>${esc(books[0])}</b><small>كتاب من مكتبة مِشكاة</small><div class="mini-meter"><i style="width:36%"></i></div></div></div><div class="mini-list">${books.slice(1).map((x,i)=>`<button data-action="book" type="button"><span>${esc(x)}</span><small>${i%2?'☁':'›'}</small></button>`).join('')}</div><div class="mini-tip">جزء صغير فقط من فهرس الكتب ظاهر هنا للتجربة.</div></div>`,
      more:`<div class="mini-app mini-page"><div class="mini-statusbar"><span>مِشكاة</span><span>أدوات</span></div><div class="mini-top"><div><small>مِشكاة</small><h3>المزيد</h3></div><button class="mini-icon" data-action="notice" type="button">⋯</button></div><div class="mini-more-grid"><button data-open="adhkar" type="button"><b>الأذكار</b><small>الورد اليومي</small></button><button data-open="quran" type="button"><b>القرآن</b><small>المصحف والتفسير</small></button><button data-open="library" type="button"><b>المكتبة</b><small>الكتب والتفاسير</small></button><button data-open="qasida" type="button"><b>القصائد</b><small>الصوتيات</small></button></div><div class="mini-tip">هذه واجهة تجريبية مستوحاة من أقسام التطبيق الفعلية.</div></div>`
    };
    if(key.startsWith('adhkar-')){const i=Number(key.split('-')[1]);if(Number.isInteger(i)&&adhkar[i]){dIndex=i;dCount=0;key='adhkar'}}
    screen.innerHTML=pages[key]||pages.home;
    screen.querySelector('.mini-app')?.classList.add('mini-page');
    screen.dataset.phoneScreen=key;
    navSelected(key==='adhkar'||key==='quran'||key==='qasida'||key==='library'||key==='more'?key:'home');
    const messages={home:'تجربة حرة • استخدم الأزرار داخل الهاتف',quran:'هذا جزء فعلي من محتوى القرآن داخل التطبيق',adhkar:'يمكنك العدّ هنا بشكل حر داخل المعاينة',qasida:'تجربة المشغل والتفاعل داخل الهاتف',library:'معاينة جزء من فهرس الكتب الموجود في التطبيق',more:'تنقل بين أقسام المعاينة من داخل الهاتف'};
    setStatus(messages[key]||messages.home);
    bind();
  }
  document.querySelectorAll('.phone-nav [data-phone-tab]').forEach(tab=>tab.addEventListener('click',()=>render(tab.dataset.phoneTab)));
  render('home');
})();
