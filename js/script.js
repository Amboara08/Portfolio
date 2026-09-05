document.getElementById('year').textContent = new Date().getFullYear();

/* Theme toggle */
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
themeToggle.addEventListener('click', () => {
  const isDark = body.getAttribute('data-theme') === 'dark';
  body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.innerHTML = isDark
    ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
    : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
});

/* Mobile menu */
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
burgerBtn.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burgerBtn.setAttribute('aria-expanded', open);
  burgerBtn.innerHTML = open
    ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
    : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  burgerBtn.setAttribute('aria-expanded', false);
  burgerBtn.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
}));

/* Skills + languages render */
const skills = [
  {name:'HTML', level:'Bon', pct:85},
  {name:'CSS', level:'Bon', pct:85},
  {name:'JavaScript', level:'Moyen', pct:60},
  {name:'PHP', level:'Moyen', pct:60},
  {name:'React', level:'Débutant', pct:35},
  {name:'MySQL', level:'Moyen', pct:60},
  {name:'Git / GitHub', level:'Bon', pct:85},
  {name:'C', level:'Moyen', pct:60},
  {name:'Java', level:'Moyen', pct:60},
];
const skillsList = document.getElementById('skillsList');
skills.forEach(s => {
  const row = document.createElement('div');
  row.className = 'skill-row';
  row.innerHTML = `<div class="skill-top"><span>${s.name}</span><span class="lvl">${s.level}</span></div>
    <div class="bar-track"><div class="bar-fill" data-pct="${s.pct}"></div></div>`;
  skillsList.appendChild(row);
});

const langs = [
  {name:'Malagasy', level:5},
  {name:'Français', level:5},
  {name:'Anglais', level:4},
];
const langList = document.getElementById('langList');
langs.forEach(l => {
  const row = document.createElement('div');
  row.className = 'lang-row';
  let dots = '';
  for(let i=1;i<=5;i++) dots += `<span class="${i<=l.level?'on':''}"></span>`;
  row.innerHTML = `<span>${l.name}</span><div class="dots">${dots}</div>`;
  langList.appendChild(row);
});

/* Reveal on scroll + bar fill */
const revealEls = document.querySelectorAll('.reveal');
const barFills = document.querySelectorAll('.bar-fill');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, {threshold:.15});
revealEls.forEach(el => io.observe(el));

const barIo = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.style.width = entry.target.dataset.pct + '%';
      barIo.unobserve(entry.target);
    }
  });
}, {threshold:.4});
barFills.forEach(el => barIo.observe(el));

/* Contact form validation + mailto fallback */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
function setErr(id, msg){ document.getElementById('err-'+id).textContent = msg || ''; }
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;
  const nom = document.getElementById('nom').value.trim();
  const email = document.getElementById('email').value.trim();
  const sujet = document.getElementById('sujet').value.trim();
  const message = document.getElementById('message').value.trim();
  ['nom','email','sujet','message'].forEach(id => setErr(id, ''));

  if(nom.length < 2){ setErr('nom','Merci d\'indiquer votre nom.'); valid = false; }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if(!emailOk){ setErr('email','Adresse email invalide.'); valid = false; }
  if(sujet.length < 2){ setErr('sujet','Merci d\'indiquer un sujet.'); valid = false; }
  if(message.length < 10){ setErr('message','Message trop court (10 caractères min).'); valid = false; }

  status.classList.remove('show','ok','bad');
  if(!valid){
    status.textContent = 'Merci de corriger les champs indiqués ci-dessus.';
    status.classList.add('show','bad');
    return;
  }

  const body = encodeURIComponent(`De : ${nom} (${email})\n\n${message}`);
  const mailto = `mailto:amboaraandria61@gmail.com?subject=${encodeURIComponent(sujet)}&body=${body}`;
  window.location.href = mailto;

  status.textContent = 'Votre client mail va s\'ouvrir pour envoyer le message. Merci !';
  status.classList.add('show','ok');
  form.reset();
});
