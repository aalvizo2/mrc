document.getElementById('sweetalert').addEventListener('click', ()=>{
    Swal.fire({
        title: '¡Hola!',
        text: 'Esto es un SweetAlert en EJS',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
})