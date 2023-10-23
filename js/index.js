const trendingapi="https://techzapi2.vercel.app/meta/anilist/trending?perPage=10",popularapi="https://techzapi2.vercel.app/anime/gogoanime/top-airing",recentapi="https://techzapi2.vercel.app/anime/gogoanime/recent-episodes?page=";async function getJson(e){try{let s=await axios.get(e);return s.data}catch(a){console.error(a)}}function genresToString(e){return e.join(", ")}function shuffle(e){let s=e.length,a;for(;s>0;)a=Math.floor(Math.random()*s),s--,[e[s],e[a]]=[e[a],e[s],];return e}async function getTrendingAnimes(){let e=shuffle((await getJson("https://techzapi2.vercel.app/meta/anilist/trending?perPage=10")).results),s="";for(let a=0;a<e.length;a++){let i=e[a],l=i.title.userPreferred,n=i.type,t=i.status,d=genresToString(i.genres),c=i.description,r="./anime.html?anime="+encodeURIComponent(l),o=i.cover;null==o&&(o=i.image),s+=`<div class="mySlides fade"> <div class="data-slider"> <p class="spotlight">#${a+1} Spotlight</p><h1>${l}</h1> <div class="extra1"> <span class="year"><i class="fa fa-play-circle"></i>${n}</span> <span class="year year2"><i class="fa fa-calendar"></i>${t}</span> <span class="cbox cbox1">${d}</span> <span class="cbox cbox2">HD</span> </div><p class="small-synop">${c}</p><div id="watchh"> <a href="${r}" class="watch-btn"> <i class="fa fa-play-circle"></i> Watch Now </a> <a href="${r}" class="watch-btn watch-btn2"> <i class="fa fa-info-circle"></i> Details<i class="fa fa-angle-right"></i> </a> </div></div><div class="shado"> <a href="${r}"></a> </div><img src="${o}"> </div>`}document.querySelector(".slideshow-container").innerHTML=s+'<a class="prev" onclick="plusSlides(-1)">&#10094;</a><a class="next" onclick="plusSlides(1)">&#10095;</a>'}async function getPopularAnimes(){let e=(await getJson("https://techzapi2.vercel.app/anime/gogoanime/top-airing")).results,s="";for(let a=0;a<e.length;a++){let i=e[a],l=i.title,n;s+=`<a href="${"./anime.html?anime="+i.id}"><div class="poster la-anime"> <div id="shadow1" class="shadow"><div class="dubb"># ${a+1}</div> </div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./logo/loading2.gif" data-src="${i.image}"> </div><div class="la-details"> <h3>${l}</h3></div></div></a>`}document.querySelector(".popularg").innerHTML=s}async function getRecentAnimes(e=1){let s=(await getJson("https://techzapi2.vercel.app/anime/gogoanime/recent-episodes?page="+e)).results,a="";for(let i=0;i<s.length;i++){let l=s[i],n=l.title,t="./anime.html?anime="+l.id,d;a+=`<a href="${t}"><div class="poster la-anime"> <div id="shadow1" class="shadow"><div class="dubb">SUB</div><div class="dubb dubb2">EP ${l.episodeNumber}</div> </div><div id="shadow2" class="shadow"> <img class="lzy_img" src="https://cdn.jsdelivr.net/gh/TechShreyash/AnimeDex@main/static/img/loading.gif" data-src="${l.image}"> </div><div class="la-details"> <h3>${n}</h3></div></div></a>`}document.querySelector(".recento").innerHTML+=a}let slideIndex=0,clickes=0;function showSlides(e){let s,a=document.getElementsByClassName("mySlides");for(e>a.length&&(slideIndex=1),e<1&&(slideIndex=a.length),s=0;s<a.length;s++)a[s].style.display="none";a[slideIndex-1].style.display="flex"}async function showSlides2(){1==clickes&&(await sleep(1e4),clickes=0);let e,s=document.getElementsByClassName("mySlides");for(e=0;e<s.length;e++)s[e].style.display="none";++slideIndex>s.length&&(slideIndex=1),s[slideIndex-1].style.display="flex",setTimeout(showSlides2,5e3)}function plusSlides(e){showSlides(slideIndex+=e),clickes=1}function currentSlide(e){showSlides(slideIndex=e),clickes=1}async function RefreshLazyLoader(){let e=new IntersectionObserver((e,s)=>{e.forEach(e=>{if(e.isIntersecting){let s=e.target;s.src=s.dataset.src}})}),s=document.querySelectorAll("img.lzy_img");s.forEach(s=>{e.observe(s)})}function sleep(e){return new Promise(s=>setTimeout(s,e))}let page=2,isLoading=0,errCount=0;function loadAnimes(){try{0==isLoading&&(isLoading=1,getRecentAnimes(page).then(e=>{RefreshLazyLoader(),console.log("Recent animes loaded")}),page+=1,isLoading=0,errCount=0)}catch(e){isLoading=0,(errCount+=1)<5&&setTimeout(loadAnimes(),2e3)}}window.addEventListener("scroll",()=>{window.scrollY+window.innerHeight>=document.documentElement.scrollHeight&&loadAnimes()}),getTrendingAnimes().then(e=>{RefreshLazyLoader(),showSlides(slideIndex),showSlides2(),console.log("Sliders loaded")}),getPopularAnimes().then(e=>{RefreshLazyLoader(),console.log("Popular animes loaded")}),getRecentAnimes().then(e=>{RefreshLazyLoader(),console.log("Recent animes loaded")});