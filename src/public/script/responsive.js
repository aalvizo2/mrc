const menuToggle = document.querySelector('.menu_toggle');
const menu = document.querySelector('header ul');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
});

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu_toggle');
    const centerLinks = document.querySelector('.center-links');
    const icons = document.querySelector('.icons');

    menuToggle.addEventListener('click', () => {
        centerLinks.classList.toggle('active');
        icons.classList.toggle('active');
    });
});
