/* ======================================================
   PANEL ADMINISTRATIVO
   ESTEBAN ESPITIA VALERO
   admin.js
====================================================== */

let asistentes = [];
let asistentesFiltrados = [];
let registroEliminar = null;

/* ======================================================
   ELEMENTOS
====================================================== */

const loginSection =
    document.getElementById("loginSection");

const dashboard =
    document.getElementById("dashboard");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const tableBody =
    document.getElementById("tableBody");

const totalRegistros =
    document.getElementById("totalRegistros");

const totalPersonas =
    document.getElementById("totalPersonas");

const refreshBtn =
    document.getElementById("refreshBtn");

const exportBtn =
    document.getElementById("exportBtn");

const printBtn =
    document.getElementById("printBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const deleteModal =
    document.getElementById("deleteModal");

const confirmDelete =
    document.getElementById("confirmDelete");

const cancelDelete =
    document.getElementById("cancelDelete");

/* ======================================================
   SESIÓN
====================================================== */

verificarSesion();

function verificarSesion() {

    const logged =
        sessionStorage.getItem(
            "adminLogged"
        );

    if (logged === "true") {

        mostrarDashboard();

    }

}

function mostrarDashboard() {

    loginSection.classList.add(
        "hidden"
    );

    dashboard.classList.remove(
        "hidden"
    );

    cargarTodo();

}

function cerrarSesion() {

    sessionStorage.removeItem(
        "adminLogged"
    );

    location.reload();

}

/* ======================================================
   LOGIN
====================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const password =
                document
                    .getElementById(
                        "password"
                    )
                    .value
                    .trim();

            if (!password) {

                loginMessage.innerHTML =
                    "Ingresa la contraseña.";

                loginMessage.style.color =
                    "red";

                return;

            }

            try {

                loginMessage.innerHTML =
                    "Verificando...";

                loginMessage.style.color =
                    "#6f4e37";

                const response =
                    await fetch(
                        "/admin/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    password
                                })
                        }
                    );

                const data =
                    await response.json();

                if (
                    data.success
                ) {

                    sessionStorage.setItem(
                        "adminLogged",
                        "true"
                    );

                    mostrarDashboard();

                } else {

                    loginMessage.innerHTML =
                        data.message;

                    loginMessage.style.color =
                        "red";

                }

            } catch (error) {

                console.error(error);

                loginMessage.innerHTML =
                    "Error de conexión.";

                loginMessage.style.color =
                    "red";

            }

        }
    );

}

/* ======================================================
   CARGAR DATOS
====================================================== */

async function cargarTodo() {

    await Promise.all([
        cargarAsistentes(),
        cargarEstadisticas()
    ]);

}

async function cargarAsistentes() {

    try {

        const response =
            await fetch(
                "/admin/asistentes"
            );

        asistentes =
            await response.json();

        asistentesFiltrados =
            [...asistentes];

        aplicarOrden();

    } catch (error) {

        console.error(error);

    }

}

async function cargarEstadisticas() {

    try {

        const response =
            await fetch(
                "/admin/estadisticas"
            );

        const data =
            await response.json();

        totalRegistros.textContent =
            data.registros || 0;

        totalPersonas.textContent =
            data.personas || 0;

    } catch (error) {

        console.error(error);

    }

}

/* ======================================================
   TABLA
====================================================== */

function renderizarTabla() {

    tableBody.innerHTML = "";

    if (
        asistentesFiltrados.length === 0
    ) {

        tableBody.innerHTML =
        `
        <tr>
            <td colspan="5">
                No hay registros.
            </td>
        </tr>
        `;

        return;

    }

    asistentesFiltrados.forEach(
        (item) => {

            const fila =
            `
            <tr>

                <td>
                    ${item.id}
                </td>

                <td>
                    ${escapeHtml(
                        item.nombre
                    )}
                </td>

                <td>
                    ${item.asistentes}
                </td>

                <td>
                    ${formatearFecha(
                        item.fecha_registro
                    )}
                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="abrirEliminar(${item.id})"
                    >
                        Eliminar
                    </button>

                </td>

            </tr>
            `;

            tableBody.insertAdjacentHTML(
                "beforeend",
                fila
            );

        }
    );

}

/* ======================================================
   BÚSQUEDA
====================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const texto =
                searchInput.value
                    .toLowerCase()
                    .trim();

            asistentesFiltrados =
                asistentes.filter(
                    (item) =>
                        item.nombre
                            .toLowerCase()
                            .includes(texto)
                );

            aplicarOrden();

        }
    );

}

/* ======================================================
   ORDENAMIENTO
====================================================== */

if (sortSelect) {

    sortSelect.addEventListener(
        "change",
        aplicarOrden
    );

}

function aplicarOrden() {

    const tipo =
        sortSelect.value;

    switch (tipo) {

        case "oldest":

            asistentesFiltrados.sort(
                (a, b) =>
                    a.id - b.id
            );

            break;

        case "nameAsc":

            asistentesFiltrados.sort(
                (a, b) =>
                    a.nombre.localeCompare(
                        b.nombre
                    )
            );

            break;

        case "nameDesc":

            asistentesFiltrados.sort(
                (a, b) =>
                    b.nombre.localeCompare(
                        a.nombre
                    )
            );

            break;

        case "guests":

            asistentesFiltrados.sort(
                (a, b) =>
                    b.asistentes -
                    a.asistentes
            );

            break;

        default:

            asistentesFiltrados.sort(
                (a, b) =>
                    b.id - a.id
            );

    }

    renderizarTabla();

}

/* ======================================================
   ELIMINAR
====================================================== */

window.abrirEliminar =
function(id) {

    registroEliminar = id;

    deleteModal.classList.remove(
        "hidden"
    );

};

if (cancelDelete) {

    cancelDelete.addEventListener(
        "click",
        () => {

            registroEliminar = null;

            deleteModal.classList.add(
                "hidden"
            );

        }
    );

}

if (confirmDelete) {

    confirmDelete.addEventListener(
        "click",
        async () => {

            if (
                !registroEliminar
            ) return;

            try {

                const response =
                    await fetch(
                        `/admin/asistentes/${registroEliminar}`,
                        {
                            method:
                                "DELETE"
                        }
                    );

                const data =
                    await response.json();

                if (
                    data.success
                ) {

                    deleteModal.classList.add(
                        "hidden"
                    );

                    registroEliminar =
                        null;

                    await cargarTodo();

                }

            } catch (error) {

                console.error(error);

            }

        }
    );

}

/* ======================================================
   EXPORTAR CSV
====================================================== */

if (exportBtn) {

    exportBtn.addEventListener(
        "click",
        () => {

            window.open(
                "/admin/exportar-csv",
                "_blank"
            );

        }
    );

}

/* ======================================================
   IMPRIMIR
====================================================== */

if (printBtn) {

    printBtn.addEventListener(
        "click",
        () => {

            window.print();

        }
    );

}

/* ======================================================
   ACTUALIZAR
====================================================== */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        cargarTodo
    );

}

/* ======================================================
   LOGOUT
====================================================== */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        cerrarSesion
    );

}

/* ======================================================
   AUTO REFRESH
====================================================== */

setInterval(() => {

    const logged =
        sessionStorage.getItem(
            "adminLogged"
        );

    if (
        logged === "true"
    ) {

        cargarTodo();

    }

}, 30000);

/* ======================================================
   HELPERS
====================================================== */

function formatearFecha(fecha) {

    if (!fecha) return "";

    const date =
        new Date(fecha);

    return date.toLocaleString(
        "es-MX",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );

    div.innerText = text;

    return div.innerHTML;

}

/* ======================================================
   CERRAR MODAL CON FONDO
====================================================== */

if (deleteModal) {

    deleteModal.addEventListener(
        "click",
        (e) => {

            if (
                e.target ===
                deleteModal
            ) {

                deleteModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}

/* ======================================================
   INICIO
====================================================== */

console.log(`
==================================
PANEL ADMINISTRATIVO
ESTEBAN ESPITIA VALERO
==================================
`);