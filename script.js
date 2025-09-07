// Přepínání záložek
function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
  document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// Čas
function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleString("cs-CZ", { timeZone:"Europe/Prague", weekday:"long", hour:"2-digit", minute:"2-digit", second:"2-digit" });
}
setInterval(updateTime,1000); updateTime();

// Týdenní přehled
const days = ["Po","Ut","St","Ct","Pa","So","Ne"];
function renderWeek() {
  const now = new Date();
  const prg = new Date(now.toLocaleString("en-US",{ timeZone:"Europe/Prague" }));
  const di = prg.getDay();
  const box = document.getElementById("week");
  box.innerHTML="";
  days.forEach((d,i)=>{
    const js=(i+1)%7;
    const active=(di===js);
    box.innerHTML+=`
      <div class="week-box ${active?"active":""}">
        ${d}<br><span class="dot ${i<5?"green":"red"}"></span>
      </div>`;
  });
}
renderWeek();

// Seance
const sessions=[
  {name:"Asie", start:1, end:9},
  {name:"Londýn", start:9, end:17},
  {name:"New York", start:14, end:22}
];
function updateSessions(){
  const now=new Date();
  const h=parseInt(now.toLocaleString("en-GB",{ timeZone:"Europe/Prague", hour:"2-digit", hour12:false }));
  const m=parseInt(now.toLocaleString("en-GB",{ timeZone:"Europe/Prague", minute:"2-digit" }));
  const currentHour=h+m/60;
  const box=document.getElementById("sessions");
  box.innerHTML="";
  sessions.forEach(s=>{
    const on=(currentHour>=s.start && currentHour<s.end);
    let progress=0;
    if(on){ progress=( (currentHour-s.start)/(s.end-s.start) )*100; }
    const progressText = on ? `${progress.toFixed(0)} %` : `Mimo`;
    box.innerHTML+=`
      <div class="session-box ${on?"active":""}">
        <strong>${s.name}</strong><br>
        <small>${s.start}:00 - ${s.end}:00</small><br>
        ${progressText}
        <div class="progress"><div class="progress-fill" style="width:${progress}%;"></div></div>
      </div>`;
  });
}
setInterval(updateSessions,60000); updateSessions();

// Kalkulačka
document.querySelectorAll("#calc input, #calc select").forEach(el=>el.addEventListener("input",updateCalc));
function updateCalc(){
  const capital=parseFloat(document.getElementById("capital").value)||0;
  const riskPct=parseFloat(document.getElementById("risk").value)||0;
  const sl=parseFloat(document.getElementById("sl").value);
  const tp=parseFloat(document.getElementById("tp").value);
  const entry=parseFloat(document.getElementById("entry").value);
  const type=document.getElementById("tradeType").value;
  if(!capital||!riskPct||isNaN(sl)||isNaN(tp)||isNaN(entry)) return;
  const pipSize=0.01, contractOz=100, pipValuePerLot=contractOz*pipSize;
  const slPips=Math.abs((entry-sl)/pipSize);
  const tpPips=Math.abs((tp-entry)/pipSize);
  const riskMoney=capital*(riskPct/100);
  const lotSize=riskMoney/(slPips*pipValuePerLot);
  const rrr=tpPips/slPips;
  const potentialLoss=slPips*pipValuePerLot*lotSize;
  const potentialProfit=tpPips*pipValuePerLot*lotSize;
  document.getElementById("calcResult").innerHTML=
    `Typ: ${type.toUpperCase()}<br>
     SL: ${slPips.toFixed(0)} pipů (${Math.abs(entry-sl).toFixed(2)} USD)<br>
     TP: ${tpPips.toFixed(0)} pipů (${Math.abs(tp-entry).toFixed(2)} USD)<br>
     RRR: ${rrr.toFixed(2)}<br>
     Lot: ${lotSize.toFixed(2)}<br>
     <span style="color:#e74c3c">Risk: -${potentialLoss.toFixed(2)} USD</span><br>
     <span style="color:#2ecc71">Zisk: +${potentialProfit.toFixed(2)} USD</span>`;
}

// Indikátory – mock
function loadIndicators(){
  const demand=(3400+Math.random()*20).toFixed(2);
  const supply=(3500+Math.random()*20).toFixed(2);
  const trend=Math.random()>0.5?"BULLISH":"BEARISH";
  document.getElementById("indicatorsResult").innerHTML=`
    Trend: <span class="trend">${trend}</span><br>
    Demand: <span class="demand">${demand}</span><br>
    Supply: <span class="supply">${supply}</span>`;
}

// Fundament (plánované události)
const fundamentEvents = [
  {short:"NFP", full:"Nonfarm Payrolls", date:"2025-09-05T14:30:00"},
  {short:"CPI", full:"Consumer Price Index", date:"2025-09-11T14:30:00"},
  {short:"FED", full:"Fed Rate Decision", date:"2025-09-18T20:00:00"}
];

function renderFundament(){
  const prevBox=document.getElementById("fundamentPrev");
  const todayBox=document.getElementById("fundamentToday");
  const nextBox=document.getElementById("fundamentNext");
  prevBox.innerHTML=""; 
  todayBox.innerHTML=""; 
  nextBox.innerHTML="";

  const now=new Date();
  let hasToday=false;

  fundamentEvents.forEach(ev=>{
    const start=new Date(ev.date);
    const end=new Date(start.getTime()+30*60000); // vliv 30 min
    let wait=0, effect=0, waitState="waiting", effectState="waiting";

    if(now<start){
      const diff=start-now;
      const total=1000*60*60*24; 
      wait=Math.max(0,Math.min(100,100-(diff/total*100)));
      effect=0;
    } else if(now>=start && now<=end){
      wait=100;
      effect=((now-start)/(end-start))*100;
      effectState = effect<5 ? "effect-0-5" : "effect-5-30";
    } else {
      wait=100; effect=100;
      waitState="done"; effectState="done";
    }

    const html=`
      <div class="event-card ${waitState==="done"?"done":""}">
        <div class="event-short">${ev.short}</div>
        <div class="event-full">${ev.full}</div>
        <div class="event-time">📅 ${start.toLocaleDateString("cs-CZ",{weekday:"long",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
        <div>Čekání:</div>
        <div class="progress ${waitState}">
          <div class="progress-fill" style="width:${wait.toFixed(0)}%">${wait.toFixed(0)}%</div>
        </div>
        <div>Vliv:</div>
        <div class="progress ${effectState}">
          <div class="progress-fill" style="width:${effect.toFixed(0)}%">${effect.toFixed(0)}%</div>
        </div>
      </div>`;

    if(end < now) {
      prevBox.innerHTML += html; // proběhlé
    } else if(start.toDateString() === now.toDateString()) {
      todayBox.innerHTML += html; // dnešní
      hasToday=true;
    } else {
      nextBox.innerHTML += html; // budoucí
    }
  });

  if(!hasToday){
    todayBox.innerHTML = `<div class="event-card free">✅ Free – žádné fundamenty dnes</div>`;

  }
}
setInterval(renderFundament,60000);
renderFundament();
