var menu_toggle= document.querySelector('.menu_toggle');

menu_toggle.addEventListener('click', ()=>{
   var nav= document.querySelector('nav');
   nav.classList.toggle('active')
})