let personas = [];
let modoActual = "";

//#region Manejo del Spinnep
function mostrarSpinner() {
    document.getElementById("spinner").style.display = "flex";
}

function ocultarSpinner() {
    document.getElementById("spinner").style.display = "none";
}
//#endregion

//#region Obtener personas
document.addEventListener("DOMContentLoaded", () => {
    obtenerPersonas();
});

function obtenerPersonas() {
    mostrarSpinner();
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", false);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            ocultarSpinner();
            if (xhr.status === 200) {
                personas = JSON.parse(xhr.responseText);
                mostrarLista();
            } else {
                alert("Error al obtener las personas: " + xhr.status);
            }
        }
    };
    xhr.send();
}
//#endregion

//#region Mostrar información de personas (Individual y listado)
function mostrarCamposPorTipo() {
    const tipo = document.getElementById("tipo").value;
    const camposCiudadano = ["dni"];
    const camposExtranjero = ["paisOrigen"];

    [...camposCiudadano, ...camposExtranjero].forEach(id => {
        document.getElementById(id).style.display = "none";
        document.querySelector(`label[for="${id}"]`).style.display = "none";
    });

    if (tipo === "tipo_ciudadano") {
        camposCiudadano.forEach(id => {
            document.getElementById(id).style.display = "inline-block";
            document.querySelector(`label[for="${id}"]`).style.display = "inline-block";
        });
    } else if (tipo === "tipo_extranjero") {
        camposExtranjero.forEach(id => {
            document.getElementById(id).style.display = "inline-block";
            document.querySelector(`label[for="${id}"]`).style.display = "inline-block";
        });
    }
}

function mostrarLista() {
    const lista = document.getElementById("lista-personas");
    lista.innerHTML = "";

    personas.forEach(persona => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${persona.id}</td>
            <td>${persona.nombre}</td>
            <td>${persona.apellido}</td>
            <td>${persona.fechaNacimiento}</td>
            <td>${persona.dni || "N/A"}</td>
            <td>${persona.paisOrigen || "N/A"}</td>
            <td><button onclick="modificarElemento(${persona.id})">Modificar</button></td>
            <td><button onclick="eliminarElemento(${persona.id})">Eliminar</button></td>
        `;
        lista.appendChild(row);
    });
}
//#endregion

//#region Validaciones de campos
function validarDatosIngresados(persona) {
    const tipoPersona = document.getElementById("tipo").value;
    datosCorrectos = true;

    if (persona.fechaNacimiento) {
        fechaNacimientoSinGuiones = persona.fechaNacimiento.replace(/-/g, "");
    }

    if (!persona.nombre || persona.nombre.trim() === "") {
        alert("El campo 'Nombre' es requerido.");
        datosCorrectos = false;
    } else if (!persona.apellido || persona.apellido.trim() === "") {
        alert("El campo 'Apellido' es requerido.");
        datosCorrectos = false;
    } else if (!persona.fechaNacimiento) {
        alert("El campo 'Fecha de Nacimiento' no ha sido ingresado o el formato no corresponde.");
    } else if (persona.fechaNacimiento && (fechaNacimientoSinGuiones.length !== 8 || isNaN(fechaNacimientoSinGuiones))){
        alert("El campo 'Fecha de Nacimiento' debe tener el formato AAAAMMDD.");
        datosCorrectos = false;
    } else if (tipoPersona === "tipo_ciudadano" && isNaN(persona.dni)) {
        alert("Debe ingresar un número de D.N.I. para la persona ciudadana seleccionada.");
        datosCorrectos = false;
    } else if (tipoPersona === "tipo_ciudadano" && persona.dni < 0) {
        alert("El número de D.N.I. ingresado no debe ser menor a 0.");
        datosCorrectos = false;
    } else if (tipoPersona === "tipo_extranjero" && (!persona.paisOrigen || persona.paisOrigen.trim() === "")) {
        alert("Debe ingresar un país de origen para la persona extranjera seleccionada.");
        datosCorrectos = false;
    }

    return datosCorrectos;
}
//#endregion

//#region Métodos de formateo de fecha y selección de tipo de persona
function formatearFechaNacimientoSinGuiones(fechaNacimiento) {
    if (fechaNacimiento) {
        return fechaNacimiento.replace(/-/g, "");
    }

    return null;
}

function convertirAFormatoDatePicker(fechaNacimiento) {
    if (!fechaNacimiento) {
        return "";
    }

    const fechaNacimientoString = fechaNacimiento.toString();

    if (fechaNacimientoString.length !== 8) {
        return "";
    }

    const anio = fechaNacimientoString.substring(0, 4);
    const mes = fechaNacimientoString.substring(4, 6);
    const dia = fechaNacimientoString.substring(6, 8);

    return `${anio}-${mes}-${dia}`;
}

function seleccionarTipoDePersona(persona) {
    if (persona.dni) {
        return "tipo_ciudadano";
    }
    else if (persona.paisOrigen) {
        return "tipo_extranjero";
    }
}
//#endregion

//#region Alta, Modificación y Baja del Formulario Lista
function generarPersona(persona){
    fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(persona)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al guardar los datos de la persona.");
        }
        return response.json();
    })
    .then(data => {
        if (data.id) {
            persona.id = data.id;
            personas.push({ id: persona.id, ...persona });
            mostrarLista();
        }

        ocultarSpinner();
        alert("Persona agregada correctamente.");
        cancelarABM();
    })
    .catch(error => {
        ocultarSpinner();
        alert("Error al intentar guardar la persona ingresada: " + error.message);
        cancelarABM();
    });
}

function modificarPersona(persona) {
    fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...persona })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al actualizar los datos de la persona.");
        }
        return response.text();
    })
    .then(text => {
        if (text === "Registro Actualizado") {
            const index = personas.findIndex(v => v.id === persona.id);
            
            if (index !== -1) {
                personas[index] = persona;
            }
            
            alert("Persona actualizada correctamente.");
        } else {
            throw new Error("Respuesta inesperada de la API.");
        }
    })
    .catch(error => {
        alert("Error al intentar modificar la persona seleccionada: " + error.message);
    })
    .finally(() => {
        ocultarSpinner();
        cancelarABM();
        mostrarLista();
    });
}

function eliminarPersona(id) {
    fetch("https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al eliminar los datos de la persona.");
        }
        return response.text();
    })
    .then(text => {
        if (text === "Registro Eliminado") {
            const index = personas.findIndex(v => v.id === id);
            if (index !== -1) {
                personas.splice(index, 1);
            }

            alert("Persona eliminada correctamente.");
        } else {
            throw new Error("Respuesta inesperada de la API.");
        }
    })
    .catch(error => {
        alert("Error al intentar eliminar la persona seleccionada: " + error.message);
    })
    .finally(() => {
        ocultarSpinner();
        cancelarABM();
        mostrarLista();
    });
}
//#endregion

//#region Dibujado para Alta, Modificación y Baja del Formulario ABM
function deshabilitarControles(deshabilitar) {
    const campos = document.querySelectorAll("#formulario-abm input, #formulario-abm select");

    campos.forEach(campo => {
        if (campo.id === "id") {
            campo.disabled = true;
        } else {
            campo.disabled = deshabilitar;
        }
    });
}

function agregarElemento() {
    document.getElementById("formulario-lista").style.display = "none";
    document.getElementById("formulario-abm").style.display = "block";
    document.getElementById("titulo-abm").innerText = "Alta";
    document.getElementById("label-id").style.display = "none";
    document.getElementById("id").style.display = "none";

    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("fechaNacimiento").value = "";
    document.getElementById("tipo").value = "tipo_ciudadano";
    document.getElementById("dni").value = 0;
    document.getElementById("paisOrigen").value = "";

    mostrarCamposPorTipo();

    modoActual = "alta";

    deshabilitarControles(false);
}

function modificarElemento(id) {
    const persona = personas.find(v => v.id === id);

    if (persona) {
        document.getElementById("formulario-lista").style.display = "none";
        document.getElementById("formulario-abm").style.display = "block";
        document.getElementById("titulo-abm").innerText = "Modificación";

        document.getElementById("label-id").style.display = "block";
        document.getElementById("id").style.display = "inline-block";
        document.getElementById("id").value = id;
        document.getElementById("nombre").value = persona.nombre;
        document.getElementById("apellido").value = persona.apellido;
        document.getElementById("fechaNacimiento").value = convertirAFormatoDatePicker(persona.fechaNacimiento);
        document.getElementById("dni").value = persona.dni || 0;
        document.getElementById("paisOrigen").value = persona.paisOrigen || "";

        document.getElementById("tipo").value = seleccionarTipoDePersona(persona);
        mostrarCamposPorTipo();

        modoActual = "modificacion";

        deshabilitarControles(false);
    } else {
        alert("La persona seleccionada no se encuentra en el listado de personas.");
    }
}

function eliminarElemento(id) {
    const persona = personas.find(v => v.id === id);

    if (persona) {
        document.getElementById("formulario-lista").style.display = "none";
        document.getElementById("formulario-abm").style.display = "block";
        document.getElementById("titulo-abm").innerText = "Eliminación";

        document.getElementById("label-id").style.display = "block";
        document.getElementById("id").style.display = "inline-block";
        document.getElementById("id").value = id;
        document.getElementById("nombre").value = persona.nombre;
        document.getElementById("apellido").value = persona.apellido;
        document.getElementById("fechaNacimiento").value = convertirAFormatoDatePicker(persona.fechaNacimiento);
        document.getElementById("dni").value = persona.dni || 0;
        document.getElementById("paisOrigen").value = persona.paisOrigen;

        document.getElementById("tipo").value = seleccionarTipoDePersona(persona);
        mostrarCamposPorTipo();
        
        modoActual = "baja";

        deshabilitarControles(true);
    } else {
        alert("La persona seleccionada no se encuentra en el listado de personas.");
    }
}
//#endregion

//#region Aceptar - Cancelar
function aceptarABM() {
    const id = parseInt(document.getElementById("id").value);
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const dni = document.getElementById("dni").value;
    const paisOrigen = document.getElementById("paisOrigen").value;

    const tipoPersona = document.getElementById("tipo").value;

    const persona = {
        nombre: nombre,
        apellido: apellido,
        fechaNacimiento: formatearFechaNacimientoSinGuiones(fechaNacimiento)
    };

    if (tipoPersona === "tipo_ciudadano") {
        persona.dni = dni ? parseInt(dni) : undefined;
    } else if (tipoPersona === "tipo_extranjero") {
        persona.paisOrigen = paisOrigen;
    }

    if (!validarDatosIngresados(persona)) {
        return;
    }

    mostrarSpinner();

    if (modoActual === "alta") {
        generarPersona(persona);
    } else if (modoActual === "modificacion") {
        persona.id = id;
        modificarPersona(persona);
    } else if (modoActual === "baja") {
        persona.id = id;
        eliminarPersona(id);
    }    
}

function cancelarABM() {
    document.getElementById("formulario-abm").style.display = "none";
    document.getElementById("formulario-lista").style.display = "block";
}
//#endregion