var menu_toggle = document.querySelector('.menu_toggle');
var ul = document.querySelector('header ul');

menu_toggle.addEventListener('click', () => {
    ul.classList.toggle('active');
});
