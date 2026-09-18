const SUPABASE_URL='https://alnpiwrwleegotdfahpv.supabase.co';const SUPABASE_KEY="sb_publishable_Ufi61yRrZbyy1XgGKRkLZw_SQDGg4G0";const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);let currentMatchEvents=[];let editingImages={team:"",player:"",trophy:"",news:""};const $=id=>document.getElementById(id);const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));const ph=l=>"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#10182a"/><text x="50%" y="50%" fill="#9ba6b8" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="28">${l}</text></svg>`);
document.addEventListener("DOMContentLoaded",async()=>{if($("menuToggle"))$("menuToggle").onclick=()=>$("mainNav").classList.toggle("open");document.querySelectorAll(".admin-tabs button").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));if($("addGoalEvent"))$("addGoalEvent").onclick=addGoalEventRow;setupForms();await renderPage()});
async function renderPage(){let p=document.body.dataset.page;if(p==="home"){await stats();await homeNews()}if(p==="standings")await standings();if(p==="fixtures"||p==="results")await matches();if(p==="teams")await teams();if(p==="players")await players();if(p==="trophies")await trophies();if(p==="news")await news();if(p==="admin"&&sessionStorage.getItem("ohs_admin")==="1"){showAdmin(true);await loadAdmin()}}
async function stats(){let[t,p,m,e]=await Promise.all([db.from("teams").select("*",{count:"exact",head:true}),db.from("players").select("*",{count:"exact",head:true}),db.from("matches").select("*",{count:"exact",head:true}).eq("status","Played"),db.from("match_events").select("*",{count:"exact",head:true}).eq("type","goal")]);$("statTeams").textContent=t.count||0;$("statPlayers").textContent=p.count||0;$("statMatches").textContent=m.count||0;$("statGoals").textContent=e.count||0}
async function homeNews(){let{data}=await db.from("news").select("*").order("date",{ascending:false}).limit(3);$("homeNewsGrid").innerHTML=(data||[]).map(n=>`<article class="news-card">${n.image?`<img src="${n.image}">`:""}<span class="pill">${esc(n.date)}</span><h3>${esc(n.title)}</h3><p class="muted">${esc(n.body)}</p></article>`).join("")||"<p>No news published yet.</p>"}
async function standings(){let[t,m]=await Promise.all([db.from("teams").select("*"),db.from("matches").select("*").eq("status","Played")]);let a=(t.data||[]).map(x=>{let s={t:x,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};(m.data||[]).filter(z=>z.home_id===x.id||z.away_id===x.id).forEach(z=>{s.p++;let h=+z.home_score||0,v=+z.away_score||0;if(z.home_id===x.id){s.gf+=h;s.ga+=v;if(h>v){s.w++;s.pts+=3}else if(h===v){s.d++;s.pts++}else s.l++}else{s.gf+=v;s.ga+=h;if(v>h){s.w++;s.pts+=3}else if(v===h){s.d++;s.pts++}else s.l++}});s.gd=s.gf-s.ga;return s}).sort((x,y)=>y.pts-x.pts||y.gd-x.gd||y.gf-x.gf);$("standingsBody").innerHTML=a.map((s,i)=>`<tr><td>${i+1}</td><td>${esc(s.t.name)}</td><td>${s.p}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td><td>${s.gf}</td><td>${s.ga}</td><td>${s.gd}</td><td><b>${s.pts}</b></td></tr>`).join("")||`<tr><td colspan="10">No clubs registered yet.</td></tr>`}
async function matches(){let{data}=await db.from("matches").select("*,home:teams!home_id(name),away:teams!away_id(name)").order("match_date");let card=async m=>{let ev=[];if(m.status==="Played"){let r=await db.from("match_events").select("*,scorer:players!scorer_id(name),assister:players!assister_id(name)").eq("match_id",m.id).order("minute");ev=r.data||[]}let eh=ev.length?`<div class="match-events">${ev.filter(e=>e.type==="goal").map(e=>`<div>⚽ <b>${esc(e.scorer?.name||"Unknown")}</b> ${e.minute?e.minute+"'":""} ${e.assister?.name?`<span>assist: ${esc(e.assister.name)}</span>`:""}</div>`).join("")}</div>`:"";return `<article><div style="padding:18px"><div class="muted">${esc(m.match_date)} ${esc(m.match_time||"")} • ${m.status==="Played"?"RESULT":"FIXTURE"}</div><div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin:25px 0"><strong>${esc(m.home?.name||"TBA")}</strong><b style="font-size:25px">${m.status==="Played"?`${m.home_score} - ${m.away_score}`:"VS"}</b><strong style="text-align:right">${esc(m.away?.name||"TBA")}</strong></div><div class="muted">${esc(m.venue||"Venue TBA")}</div>${eh}</div></article>`}let f=$("fixturesGrid"),r=$("resultsGrid");if(f)f.innerHTML=(await Promise.all((data||[]).filter(m=>m.status!=="Played").map(card))).join("")||"<p>No upcoming fixtures.</p>";if(r)r.innerHTML=(await Promise.all((data||[]).filter(m=>m.status==="Played").map(card))).join("")||"<p>No results yet.</p>"}
async function teams(){let{data}=await db.from("teams").select("*").order("name");$("teamsGrid").innerHTML=(data||[]).map(t=>`<article class="team-card"><img src="${t.logo||t.logo_url||ph(t.name)}"><h3>${esc(t.name)}</h3><p class="muted">${esc(t.coach||"Coach TBA")}</p></article>`).join("")||"<p>No clubs added yet.</p>"}
async function players(){let[p,e]=await Promise.all([db.from("players").select("*,teams(name)").order("name"),db.from("match_events").select("scorer_id").eq("type","goal")]);let c={};(e.data||[]).forEach(x=>c[x.scorer_id]=(c[x.scorer_id]||0)+1);$("playersGrid").innerHTML=(p.data||[]).map(x=>({...x,g:c[x.id]||0})).sort((a,b)=>b.g-a.g).map(x=>`<article class="player-card"><img src="${x.image||x.image_url||ph("PLAYER")}"><div class="player-info"><span class="pill">#${esc(x.number||"")}</span><h3>${esc(x.name)}</h3><p class="muted">${esc(x.position||"Player")} • ${esc(x.teams?.name||"Free Agent")}</p><b>${x.g} goals</b></div></article>`).join("")||"<p>No players added yet.</p>"}
async function trophies(){let{data}=await db.from("trophies").select("*").order("season",{ascending:false});$("trophiesGrid").innerHTML=(data||[]).map(t=>`<article class="trophy-card">${t.image||t.image_url?`<img src="${t.image||t.image_url}">`:`<div style="font-size:80px;text-align:center;padding:50px">🏆</div>`}<h3>${esc(t.name)}</h3><p>${esc(t.winner||"Winner TBA")}</p><span class="pill">${esc(t.season||"")}</span></article>`).join("")||"<p>No awards recorded yet.</p>"}
async function news(){let{data}=await db.from("news").select("*").order("date",{ascending:false});$("newsGrid").innerHTML=(data||[]).map(n=>`<article class="news-card">${n.image||n.image_url?`<img src="${n.image||n.image_url}">`:""}<span class="pill">${esc(n.date)}</span><h3>${esc(n.title)}</h3><p class="muted">${esc(n.body)}</p></article>`).join("")||"<p>No news published yet.</p>"}
async function loadAdmin(){let[t,p,m,tr,n]=await Promise.all([db.from("teams").select("*"),db.from("players").select("*,teams(name)"),db.from("matches").select("*,home:teams!home_id(name),away:teams!away_id(name)").order("match_date"),db.from("trophies").select("*"),db.from("news").select("*").order("date",{ascending:false})]);let opts='<option value="">Select club</option>'+(t.data||[]).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("");if($("homeTeam"))$("homeTeam").innerHTML=opts;if($("awayTeam"))$("awayTeam").innerHTML=opts;if($("playerTeam"))$("playerTeam").innerHTML=opts;$("matchList").innerHTML=(m.data||[]).map(x=>`<div class="admin-list-row"><b>${esc(x.home?.name||"TBA")} ${x.status==="Played"?`${x.home_score}-${x.away_score}`:"vs"} ${esc(x.away?.name||"TBA")}</b><div class="row-actions"><button class="btn btn-dark small-btn" onclick="editMatch('${x.id}')">Edit</button><button class="btn danger small-btn" onclick="delMatch('${x.id}')">Delete</button></div></div>`).join("");$("teamList").innerHTML=(t.data||[]).map(x=>`<div class="admin-list-row"><b>${esc(x.name)}</b><div class="row-actions"><button class="btn btn-dark small-btn" onclick="editTeam('${x.id}')">Edit</button><button class="btn danger small-btn" onclick="delTeam('${x.id}')">Delete</button></div></div>`).join("");$("playerList").innerHTML=(p.data||[]).map(x=>`<div class="admin-list-row"><b>${esc(x.name)}</b><div class="row-actions"><button class="btn btn-dark small-btn" onclick="editPlayer('${x.id}')">Edit</button><button class="btn danger small-btn" onclick="delPlayer('${x.id}')">Delete</button></div></div>`).join("");$("trophyList").innerHTML=(tr.data||[]).map(x=>`<div class="admin-list-row"><b>${esc(x.name)}</b><div class="row-actions"><button class="btn btn-dark small-btn" onclick="editTrophy('${x.id}')">Edit</button><button class="btn danger small-btn" onclick="delTrophy('${x.id}')">Delete</button></div></div>`).join("");$("newsList").innerHTML=(n.data||[]).map(x=>`<div class="admin-list-row"><b>${esc(x.title)}</b><div class="row-actions"><button class="btn btn-dark small-btn" onclick="editNews('${x.id}')">Edit</button><button class="btn danger small-btn" onclick="delNews('${x.id}')">Delete</button></div></div>`).join("");await renderGoalInputs()}
function showTab(id){document.querySelectorAll(".admin-tab").forEach(x=>x.classList.add("hidden"));$(id)?.classList.remove("hidden");document.querySelectorAll(".admin-tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===id))}
function showAdmin(v){$("loginPanel")?.classList.toggle("hidden",v);$("adminPanel")?.classList.toggle("hidden",!v);if(v)showTab("matchAdmin")}
async function renderGoalInputs(){let c=$("goalEventsContainer");if(!c)return;let{data:p}=await db.from("players").select("id,name,team_id,teams(name)").order("name");let o=(sel="")=>'<option value="">Select player</option>'+(p||[]).map(x=>`<option value="${x.id}" ${sel===x.id?"selected":""}>${esc(x.name)} — ${esc(x.teams?.name||"")}</option>`).join("");c.innerHTML=currentMatchEvents.map((e,i)=>`<div class="goal-row"><select onchange="currentMatchEvents[${i}].scorer_id=this.value" required>${o(e.scorer_id)}</select><select onchange="currentMatchEvents[${i}].assister_id=this.value||null"><option value="">No assist</option>${(p||[]).map(x=>`<option value="${x.id}" ${e.assister_id===x.id?"selected":""}>${esc(x.name)} — ${esc(x.teams?.name||"")}</option>`).join("")}</select><input type="number" min="1" placeholder="Min" value="${e.minute||""}" onchange="currentMatchEvents[${i}].minute=Number(this.value)||null"><button type="button" class="btn danger remove-goal" onclick="currentMatchEvents.splice(${i},1);renderGoalInputs()">Remove</button></div>`).join("")}
function addGoalEventRow(){currentMatchEvents.push({type:"goal",scorer_id:"",assister_id:null,minute:null});renderGoalInputs()}
async function uploadImage(file){if(!file)return "";let path=Date.now()+"_"+file.name.replace(/[^a-zA-Z0-9._-]/g,"_");let{error}=await db.storage.from("league-media").upload(path,file);if(error){alert(error.message);return ""}return db.storage.from("league-media").getPublicUrl(path).data.publicUrl}
function setupForms(){$("teamForm")?.addEventListener("submit",saveTeam);$("playerForm")?.addEventListener("submit",savePlayer);$("matchForm")?.addEventListener("submit",saveMatch);$("trophyForm")?.addEventListener("submit",saveTrophy);$("newsForm")?.addEventListener("submit",saveNews)}
async function saveTeam(e){e.preventDefault();let id=$("teamId").value,logo=await uploadImage($("teamLogo").files[0])||editingImages.team,p={name:$("teamName").value,short:$("teamShort").value||$("teamName").value.slice(0,3).toUpperCase(),coach:$("teamCoach").value,logo};let r=id?await db.from("teams").update(p).eq("id",id):await db.from("teams").insert(p);if(r.error)return alert(r.error.message);e.target.reset();editingImages.team="";await loadAdmin()}
async function savePlayer(e){e.preventDefault();let id=$("playerId").value,image=await uploadImage($("playerImage").files[0])||editingImages.player,p={name:$("playerName").value,team_id:$("playerTeam").value,position:$("position").value,number:+$("number").value||null,image};let r=id?await db.from("players").update(p).eq("id",id):await db.from("players").insert(p);if(r.error)return alert(r.error.message);e.target.reset();editingImages.player="";await loadAdmin()}
async function saveMatch(e){e.preventDefault();let p={home_id:$("homeTeam").value,away_id:$("awayTeam").value,match_date:$("matchDate").value,match_time:$("matchTime").value||null,venue:$("matchVenue").value,status:$("matchStatus").value,home_score:+$("homeScore").value||0,away_score:+$("awayScore").value||0};if(p.home_id===p.away_id)return alert("Home and away clubs must be different.");let id=$("matchId").value,r=id?await db.from("matches").update(p).eq("id",id).select().single():await db.from("matches").insert(p).select().single();if(r.error)return alert(r.error.message);await db.from("match_events").delete().eq("match_id",r.data.id);let ev=currentMatchEvents.filter(x=>x.scorer_id).map(x=>({match_id:r.data.id,type:"goal",scorer_id:x.scorer_id,assister_id:x.assister_id||null,minute:x.minute||null}));if(ev.length){let er=await db.from("match_events").insert(ev);if(er.error)return alert(er.error.message)}e.target.reset();$("matchId").value="";currentMatchEvents=[];await loadAdmin()}
async function saveTrophy(e){e.preventDefault();let id=$("trophyId").value,image=await uploadImage($("trophyImage").files[0])||editingImages.trophy,p={name:$("trophyName").value,winner:$("winner").value,season:$("season").value,image};let r=id?await db.from("trophies").update(p).eq("id",id):await db.from("trophies").insert(p);if(r.error)return alert(r.error.message);e.target.reset();editingImages.trophy="";await loadAdmin()}
async function saveNews(e){e.preventDefault();let id=$("newsId").value,image=await uploadImage($("newsImage").files[0])||editingImages.news,p={title:$("newsTitle").value,date:$("newsDate").value,body:$("body").value,image};let r=id?await db.from("news").update(p).eq("id",id):await db.from("news").insert(p);if(r.error)return alert(r.error.message);e.target.reset();editingImages.news="";await loadAdmin()}
async function editMatch(id){let{data:x}=await db.from("matches").select("*").eq("id",id).single();$("matchId").value=id;$("matchDate").value=x.match_date;$("matchTime").value=x.match_time||"";$("homeTeam").value=x.home_id;$("awayTeam").value=x.away_id;$("matchStatus").value=x.status;$("homeScore").value=x.home_score||0;$("awayScore").value=x.away_score||0;$("matchVenue").value=x.venue||"";let r=await db.from("match_events").select("*").eq("match_id",id).order("minute");currentMatchEvents=r.data||[];renderGoalInputs();showTab("matchAdmin")}
async function editTeam(id){let{data:x}=await db.from("teams").select("*").eq("id",id).single();$("teamId").value=id;$("teamName").value=x.name;$("teamShort").value=x.short||x.short_name||"";$("teamCoach").value=x.coach||"";editingImages.team=x.logo||x.logo_url||"";showTab("teamAdmin")}
async function editPlayer(id){let{data:x}=await db.from("players").select("*").eq("id",id).single();$("playerId").value=id;$("playerName").value=x.name;$("playerTeam").value=x.team_id;$("position").value=x.position||"";$("number").value=x.number||"";editingImages.player=x.image||x.image_url||"";showTab("playerAdmin")}
async function editTrophy(id){let{data:x}=await db.from("trophies").select("*").eq("id",id).single();$("trophyId").value=id;$("trophyName").value=x.name;$("winner").value=x.winner||"";$("season").value=x.season||"";editingImages.trophy=x.image||x.image_url||"";showTab("trophyAdmin")}
async function editNews(id){let{data:x}=await db.from("news").select("*").eq("id",id).single();$("newsId").value=id;$("newsTitle").value=x.title;$("newsDate").value=x.date;$("body").value=x.body;editingImages.news=x.image||x.image_url||"";showTab("newsAdmin")}
async function delMatch(id){if(!confirm("Delete this match and its goal events?"))return;await db.from("match_events").delete().eq("match_id",id);await db.from("matches").delete().eq("id",id);await loadAdmin()}async function delTeam(id){if(!confirm("Delete this club?"))return;await db.from("teams").delete().eq("id",id);await loadAdmin()}async function delPlayer(id){if(!confirm("Delete this player?"))return;await db.from("players").delete().eq("id",id);await loadAdmin()}async function delTrophy(id){if(!confirm("Delete this award?"))return;await db.from("trophies").delete().eq("id",id);await loadAdmin()}async function delNews(id){if(!confirm("Delete this article?"))return;await db.from("news").delete().eq("id",id);await loadAdmin()}


// Secure Supabase Auth admin login override
document.addEventListener("DOMContentLoaded",()=>{
  const form=document.getElementById("loginForm");
  if(!form) return;
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    e.stopImmediatePropagation();
    const email=document.getElementById("adminEmail")?.value.trim();
    const password=document.getElementById("adminPassword")?.value||"";
    const msg=document.getElementById("loginMessage");
    if(msg) msg.textContent="Signing in...";
    const {data,error}=await db.auth.signInWithPassword({email,password});
    if(error){
      if(msg) msg.textContent="Login failed: "+error.message;
      return;
    }
    const {data:isAdmin,error:adminError}=await db.rpc("is_admin");
    if(adminError||!isAdmin){
      await db.auth.signOut();
      if(msg) msg.textContent="This account is not authorized as an OHS League administrator.";
      return;
    }
    sessionStorage.setItem("ohs_admin","1");
    showAdmin(true);
    if(msg) msg.textContent="";
    await loadAdmin();
  },true);
});

document.getElementById("logoutAdmin")?.addEventListener("click",async()=>{
  await db.auth.signOut();
  sessionStorage.removeItem("ohs_admin");
  showAdmin(false);
});

/* OHS_MANUAL_FIXTURE_FUNCTIONS */
(function(){
  const q=id=>document.getElementById(id);
  window.ohsCreateManualFixture=async function(){
    if(!window.db) return alert("Supabase is not ready.");
    const home=q("manualHomeTeam")?.value, away=q("manualAwayTeam")?.value;
    const date=q("manualMatchDate")?.value, time=q("manualMatchTime")?.value||null;
    const venue=q("manualVenue")?.value?.trim()||null;
    if(!home||!away||home===away||!date) return alert("Choose different teams and enter a date.");
    const {error}=await db.from("matches").insert({home_id:home,away_id:away,match_date:date,match_time:time,venue,status:"scheduled",home_score:0,away_score:0});
    if(error) return alert("Could not create fixture: "+error.message);
    alert("Fixture created.");
    if(typeof loadAdmin==="function") await loadAdmin();
  };
  window.ohsGenerateSeasonFixtures=async function(){
    if(!window.db) return alert("Supabase is not ready.");
    const {data:teams,error}=await db.from("teams").select("id,name").order("name");
    if(error) return alert("Could not load teams: "+error.message);
    if(!teams||teams.length<2) return alert("Add at least two teams first.");
    const start=q("genStartDate")?.value, time=q("genKickoff")?.value||null, venue=q("genVenue")?.value?.trim()||null;
    if(!start) return alert("Choose the first match date.");
    let list=teams.slice();
    if(list.length%2) list.push({id:null,name:"BYE"});
    const rounds=list.length-1, half=list.length/2, pairRounds=[];
    for(let r=0;r<rounds;r++){
      const pairs=[];
      for(let i=0;i<half;i++){const a=list[i],b=list[list.length-1-i];if(a.id&&b.id)pairs.push([a.id,b.id]);}
      pairRounds.push(pairs);
      list=[list[0],list[list.length-1],...list.slice(1,-1)];
    }
    const all=[...pairRounds];
    if(q("genFormat")?.value==="double") all.push(...pairRounds.map(r=>r.map(([a,b])=>[b,a])));
    const base=new Date(start+"T00:00:00Z"), rows=[];
    all.forEach((round,ri)=>{const d=new Date(base);d.setUTCDate(d.getUTCDate()+ri*7);const date=d.toISOString().slice(0,10);round.forEach(([h,a])=>rows.push({home_id:h,away_id:a,match_date:date,match_time:time,venue,status:"scheduled",home_score:0,away_score:0}));});
    const {error:ins}=await db.from("matches").insert(rows);
    if(ins) return alert("Could not generate fixtures: "+ins.message);
    alert(rows.length+" fixtures generated.");
    if(typeof loadAdmin==="function") await loadAdmin();
  };
})();
