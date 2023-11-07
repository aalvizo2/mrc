var menu_toggle= document.querySelector('.menu_toggle');

menu_toggle.addEventListener('click', ()=>{
   var ul= document.querySelector('ul');
   ul.classList.toggle('active')
})