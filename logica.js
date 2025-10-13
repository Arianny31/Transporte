
// Elementos de tema
const body = document.body;
const oscuroRadio = document.getElementById('oscuro');
const claroRadio = document.getElementById('claro');

function applyTheme(theme){
  if(theme === 'oscuro'){
    body.classList.add('oscuro');
    oscuroRadio.checked = true;
  } else {
    body.classList.remove('oscuro');
    claroRadio.checked = true;
  }
}

// Cargar preferencia desde localStorage
const saved = localStorage.getItem('theme');
if(saved){
  applyTheme(saved);
} else {
  // por defecto claro
  applyTheme('claro');
}

// Listeners para radios
oscuroRadio.addEventListener('change', function(){
  if(this.checked) {
    applyTheme('oscuro');
    localStorage.setItem('theme', 'oscuro');
  }
});

claroRadio.addEventListener('change', function(){
  if(this.checked) {
    applyTheme('claro');
    localStorage.setItem('theme', 'claro');
  }
});