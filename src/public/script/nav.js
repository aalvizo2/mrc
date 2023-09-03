window.addEventListener("scroll", () =>{
    var header= document.querySelector("header");
    header.classList.toggle("red", window.scrollY >0);
});
