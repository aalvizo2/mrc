const menuToggle = document.querySelector('.menu_toggle');
const menu = document.querySelector('header ul');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
});
