const input = document.getElementById('excelInput');
const btn = document.getElementById('uploadBtn');
const progressFill = document.querySelector('.progress-fill');
const btnText = document.querySelector('.btn-text');

btn.addEventListener('click', () => input.click());

input.addEventListener('change', async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    btnText.innerText = "Subiendo...";

    const formData = new FormData();
    formData.append('excel', file);

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + "%";
    }, 200);

    try {
        const res = await fetch('/inventario/upload', {
            method: 'POST',
            body: formData
        });

        const text = await res.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(text);
        }

        clearInterval(interval);
        progressFill.style.width = "100%";

        btnText.innerText = "Completado ✔";
        btn.classList.add('done');

        setTimeout(() => {
            notifySuccess(`Insertados: ${data.insertados} | Errores: ${data.errores}`);
            location.reload();
        }, 800);

    } catch (err) {
        clearInterval(interval);
        console.error(err);

        btnText.innerText = "Error ";
        btn.style.background = "#dc3545";
    }
});



//Editable rows in table 
document.querySelectorAll('.editable').forEach(cell => {
    cell.addEventListener('click', function () {

        //Ya esta editando aqui
        if (this.querySelector("input")) return;

        const oldValue = this.innerText.trim();
        const id = this.dataset.id;
        const field = this.dataset.field;

        const input = document.createElement('input');
        input.type = "text";
        input.value = oldValue;
        input.classList.add("form-control", "form-control-sm");

        this.innerHTML = "";
        this.appendChild(input);
        input.focus();

        let saved = false;

        //Enter para guardar 
        input.addEventListener('keydown', async (e) => {

            if (e.key === "Enter") {

                const newValue = input.value;

                try {
                    const res = await fetch("/inventario/update-field", {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            id,
                            field,
                            value: newValue
                        })
                    });

                    const data = await res.json();

                    if (data.ok) {
                        saved = true;
                        cell.innerHTML = newValue;
                        notifySuccess('Campo actualizado');
                        window.location.reload();
                    } else {
                        cell.innerHTML = oldValue;
                        anotifyError('Error al actualizar');
                    }

                } catch (error) {
                    console.error(error);
                    cell.innerHTML = oldValue;
                }
            }

            //ESC para cancelar
            if (e.key === "Escape") {
                cell.innerHTML = oldValue;
            }
        });

        //Salir sin enter
        input.addEventListener("blur", () => {
            if (!saved) {
                cell.innerHTML = oldValue;
            }
        });
    });
});

//Eliminar
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async function () {
        const id = this.dataset.id;

        const confirmDelete = await confirmAction('¿Eliminar este producto?');

        if (!confirmDelete) return;

        try {
            const res = await fetch('/inventario/delete', {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id })
            });

            const data = await res.json();

            if (data.ok) {
                this.closest('tr').remove();
                notifySuccess('Producto eliminado correctamente');
            } else {
                notifyError('Error al eliminar');
            }

        } catch (error) {
            console.error(error);
            notifyError('Error de servidor');
        }
    })
});


//Filtrar en buscador
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('keyup', function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();

        if (text.includes(filter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});




//toast de antd
function notifySuccess(msg) {
    Toastify({
        text: msg,
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
            background: "#28a745"
             
        }
    }).showToast();
}

function notifyError(msg) {
    Toastify({
        text: msg,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: "#dc3545"
        }
    }).showToast();
};


//PopConfirm
function confirmAction(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const text = document.getElementById('confirmText');
        const yes = document.getElementById('confirmYes');
        const no = document.getElementById('confirmNo');

        text.innerText = message;
        modal.classList.remove('hidden');

        const clean = () => {
            modal.classList.add('hidden');
            yes.onclick = null;
            no.onclick = null;
        };

        yes.onclick = () => {
            clean();
            resolve(true);
        };

        no.onclick = () => {
            clean();
            resolve(false);
        };
    });
}


document.addEventListener('DOMContentLoaded', () => {

    const modalElement = document.getElementById('modalProducto')
    const openBtn = document.getElementById('openModalBtn')

    if (!modalElement || !openBtn) {
        console.error('No existe el modal o el botón')
        return
    }

    const modal = new bootstrap.Modal(modalElement)

    openBtn.addEventListener('click', () => {
        modal.show()
    })

    // FORM
    document.getElementById('formProducto').addEventListener('submit', async (e) => {
        e.preventDefault()

        const form = e.target

        const data = {
            producto: form.producto.value,
            descripcion: form.descripcion.value,
            cantidad: form.cantidad.value,
            precio_publico: form.precio_publico.value,
            precio_descuento: form.precio_descuento.value,
            marca: form.marca.value,
            codigo_barras: form.codigo_barras.value
        }

        try {
            const res = await fetch('/inventario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            await res.json()

            notifySuccess("Producto agregado")
            modal.hide()
            location.reload()

        } catch (error) {
            console.error(error)
            notifyError("Error al guardar")
        }
    })

})