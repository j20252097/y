// --- Animation setup ---
if (window.AOS) AOS.init({ duration: 700, once: true });
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.from('.hero-title', { y: 30, opacity: 0, duration: 0.9 });
}

// --- Blackjack logic ---
const bjNew = document.getElementById('bj-new');
const bjHit = document.getElementById('bj-hit');
const bjStand = document.getElementById('bj-stand');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const bjLog = document.getElementById('bj-log');

let deck = [];
let playerHand = [];
let dealerHand = [];
let inRound = false;

// sounds
const snd = {
  deal: new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'),
  click: new Audio('https://actions.google.com/sounds/v1/buttons/button_press.ogg'),
  win: new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'),
  lose: new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg')
};
function playSound(name) { const s = snd[name]; if(s){ s.currentTime=0; s.play(); } }

function createDeck() {
  const suits = ['♠','♥','♦','♣'];
  const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const d = [];
  for (const s of suits) for (const r of ranks) d.push({suit:s, rank:r});
  return d;
}
function shuffle(d) {
  for (let i=d.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [d[i], d[j]] = [d[j], d[i]];
  }
}
function scoreHand(hand) {
  let total=0, aces=0;
  for (const c of hand) {
    if(c.rank==='A'){ aces++; total+=11; }
    else if(['J','Q','K'].includes(c.rank)) total+=10;
    else total+=Number(c.rank);
  }
  while(total>21 && aces>0){ total-=10; aces--; }
  return total;
}

function renderCard(card){
  const el=document.createElement('div');
  el.className='card';
  if(card.suit==='♥'||card.suit==='♦') el.classList.add('red');
  el.innerHTML=`<div>${card.rank}</div><div>${card.suit}</div>`;
  return el;
}

function renderHands(hideDealerHole=true){
  dealerCardsEl.innerHTML='';
  playerCardsEl.innerHTML='';
  dealerHand.forEach((c,i)=>{
    const el=renderCard(c);
    if(i===0 && hideDealerHole && inRound) el.textContent='🂠';
    dealerCardsEl.appendChild(el);
  });
  playerHand.forEach(c=>playerCardsEl.appendChild(renderCard(c)));
  dealerScoreEl.textContent = inRound && hideDealerHole ? '?' : scoreHand(dealerHand);
  playerScoreEl.textContent = scoreHand(playerHand);
}

function log(msg){
  const p=document.createElement('div');
  p.textContent=msg;
  bjLog.prepend(p);
}

function dealCard(to){
  if(deck.length===0){ deck=createDeck(); shuffle(deck); }
  const c=deck.pop();
  to.push(c);
  playSound('deal');
}

function startRound(){
  deck=createDeck(); shuffle(deck);
  playerHand=[]; dealerHand=[];
  inRound=true;
  bjLog.innerHTML='';
  dealCard(playerHand); dealCard(dealerHand);
  dealCard(playerHand); dealCard(dealerHand);
  renderHands(true);
  log('ゲーム開始 — ヒットまたはスタンドを選択してください');
}

function playerHit(){
  if(!inRound) return;
  dealCard(playerHand);
  renderHands(true);
  playSound('click');
  if(scoreHand(playerHand)>21){ playSound('lose'); endRound('バースト — あなたの負け'); }
}

function dealerPlay(){
  while(scoreHand(dealerHand)<17) dealCard(dealerHand);
}

function endRound(msg){
  inRound=false;
  dealerPlay();
  renderHands(false);
  const p=scoreHand(playerHand), d=scoreHand(dealerHand);
  if(!msg){
    if(p>21) msg='バースト — あなたの負け';
    else if(d>21) msg='ディーラーがバースト — あなたの勝ち';
    else if(p>d) msg='あなたの勝ち';
    else if(p===d) msg='引き分け';
    else msg='あなたの負け';
  }
  log(`${msg} (あなた ${p} - ディーラー ${d})`);
  playSound(msg.includes('勝ち')?'win':'lose');
}

bjNew.addEventListener('click', startRound);
bjHit.addEventListener('click', playerHit);
bjStand.addEventListener('click', ()=>{ if(inRound) endRound(); });

document.getElementById('year').textContent=new Date().getFullYear();
