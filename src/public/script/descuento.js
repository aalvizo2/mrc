const menu_toggle= document.querySelector('.menu_toggle');

menu_toggle.addEventListener('click', ()=>{
    const ul= document.querySelector('ul');
    ul.classList.add('active');
})