const WORDS = ["INDONESIA","PARIS","EIFEL","AMAZON","SAHARA","PYRAMID","FUJI","LONDON","TOKYO","NEWYORK","HIMALAYA","KANGAROO","PANDA","SPAGHETTI","CROISSANT"];

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const lettersEl = document.getElementById('letters');
const answerInput = document.getElementById('answer');
const checkBtn = document.getElementById('check');
const statusEl = document.getElementById('status');

let target = '';
let clue = '';

function pickWord(){
  target = WORDS[Math.floor(Math.random()*WORDS.length)];
  const arr = target.split('');
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  clue = arr.join(' ');
  lettersEl.textContent = clue;
  answerInput.value = '';
  statusEl.textContent = '';
}

function speak(text){
  if('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'id-ID';
    // Pilih voice Google jika tersedia
    const voices = window.speechSynthesis.getVoices();
    const google = voices.find(v=>/google/i.test(v.name));
    if(google) u.voice = google;
    // Percepat sedikit dan turunkan pitch agar terdengar lebih 'robotik'
    u.rate = 1.25;
    u.pitch = 0.2;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
}

checkBtn.addEventListener('click', ()=>{ checkAnswer(); });
answerInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') checkAnswer(); });

function checkAnswer(){
  const v = answerInput.value.trim().toUpperCase();
  if(!v) return;
  if(v===target){
    statusEl.textContent = 'KAMU MENANG!'; statusEl.style.color = 'lime'; speak('Kamu menang!');
    setTimeout(pickWord, 1000);
  } else {
    statusEl.textContent = 'KAMU SALAH!'; statusEl.style.color = 'red'; speak('Kamu payah, jawabanmu salah!');
    answerInput.value='';
  }
}

// Simple parallax trees
const trees = [];
for(let i=0;i<6;i++) trees.push({x: i*180, speed: 0.3 + Math.random()*0.6, scale: 0.7+Math.random()*0.6});

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // sky
  ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,canvas.width,canvas.height);
  // ground
  ctx.fillStyle = '#228B22'; ctx.fillRect(0,450,canvas.width,150);
  // trees
  trees.forEach(t=>{
    t.x -= t.speed;
    if(t.x < -150) t.x = canvas.width + Math.random()*100;
    // trunk
    ctx.fillStyle = '#654321'; ctx.fillRect(t.x+40*t.scale,350+100*t.scale,20*t.scale,150*t.scale);
    // leaves
    ctx.fillStyle = '#228B22'; ctx.beginPath(); ctx.arc(t.x+50*t.scale,350+100*t.scale,50*t.scale,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2E8B57'; ctx.beginPath(); ctx.arc(t.x+30*t.scale,330+80*t.scale,40*t.scale,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#006400'; ctx.beginPath(); ctx.arc(t.x+70*t.scale,330+80*t.scale,40*t.scale,0,Math.PI*2); ctx.fill();
  });
  requestAnimationFrame(draw);
}

pickWord(); draw();
