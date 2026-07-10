const WORDS = ["INDONESIA","PARIS","EIFEL","AMAZON","SAHARA","PYRAMID","FUJI","LONDON","TOKYO","NEWYORK","HIMALAYA","KANGAROO","PANDA","SPAGHETTI","CROISSANT"];

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
const lettersEl = document.getElementById('letters');
const answerInput = document.getElementById('answer');
const checkBtn = document.getElementById('check');
const revealBtn = document.getElementById('reveal');
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
revealBtn.addEventListener('click', revealAnswer);
answerInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') checkAnswer(); });

function revealAnswer(){
  statusEl.textContent = `Jawaban benar: ${target}`;
  statusEl.style.color = '#FFD700';
}

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

// Parallax trees (dynamic count based on canvas width)
let trees = [];
function initTrees(){
  trees = [];
  const count = Math.max(8, Math.floor(canvas.width / 120));
  for(let i=0;i<count;i++){
    trees.push({x: Math.random()*canvas.width, speed: 0.2 + Math.random()*0.8, scale: 0.6 + Math.random()*0.9, y: 300 + Math.random()*150});
  }
}
initTrees();

// Animals: birds, rabbits, deer
const animals = [];
function initAnimals(){
  animals.length = 0;
  for(let i=0;i<6;i++) animals.push({type:'bird', x:Math.random()*canvas.width, y:50+Math.random()*220, vx:1+Math.random()*2});
  for(let i=0;i<5;i++) animals.push({type:'rabbit', x:Math.random()*canvas.width, y:canvas.height-120+Math.random()*20, vx:0.6+Math.random()*0.8});
  for(let i=0;i<3;i++) animals.push({type:'deer', x:Math.random()*canvas.width, y:canvas.height-140+Math.random()*10, vx:0.4+Math.random()*0.6});
}
initAnimals();

window.addEventListener('resize', ()=>{ initTrees(); initAnimals(); });

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // sky
  ctx.fillStyle = '#87CEEB'; ctx.fillRect(0,0,canvas.width,canvas.height);
  // ground (adaptive)
  const groundY = Math.floor(canvas.height * 0.75);
  ctx.fillStyle = '#228B22'; ctx.fillRect(0,groundY,canvas.width,canvas.height-groundY);

  // trees
  trees.forEach(t=>{
    t.x -= t.speed;
    if(t.x < -300) t.x = canvas.width + Math.random()*200;
    const baseY = t.y;
    // trunk
    ctx.fillStyle = '#654321'; ctx.fillRect(t.x+40*t.scale, baseY+100*t.scale, 20*t.scale, 150*t.scale);
    // leaves
    ctx.fillStyle = '#228B22'; ctx.beginPath(); ctx.arc(t.x+50*t.scale, baseY+100*t.scale,50*t.scale,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#2E8B57'; ctx.beginPath(); ctx.arc(t.x+30*t.scale, baseY+80*t.scale,40*t.scale,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#006400'; ctx.beginPath(); ctx.arc(t.x+70*t.scale, baseY+80*t.scale,40*t.scale,0,Math.PI*2); ctx.fill();
  });

  // animals
  animals.forEach(a=>{
    a.x += a.vx;
    if(a.x > canvas.width + 200) a.x = -200;
    if(a.type === 'bird'){
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x+10, a.y+6); ctx.lineTo(a.x+20, a.y); ctx.stroke();
    } else if(a.type === 'rabbit'){
      ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.ellipse(a.x, groundY-60, 12,8,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000'; ctx.fillRect(a.x+8, groundY-62, 6,3);
    } else if(a.type === 'deer'){
      ctx.fillStyle = '#A0522D'; ctx.fillRect(a.x, groundY-70, 30,16);
      ctx.fillStyle = '#603318'; ctx.fillRect(a.x+4, groundY-54,4,12); ctx.fillRect(a.x+18, groundY-54,4,12);
    }
  });

  requestAnimationFrame(draw);
}

pickWord(); draw();
