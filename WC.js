class Persona {
    constructor(id, nombre, apellido, fechaNacimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.fechaNacimiento = fechaNacimiento;
    }

    toString() {
        return `ID: ${this.id}, Nombre: ${this.nombre}, Apellido: ${this.apellido}, Fecha de Nacimiento: ${this.fechaNacimiento}`;
    }
}

class Ciudadano extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, dni) {
        super(id, nombre, apellido, fechaNacimiento);
        this.dni = dni;
    }

    toString() {
        return super.toString() + `, D.N.I.: ${this.dni}`;
    }
}

class Extranjero extends Persona {
    constructor(id, nombre, apellido, fechaNacimiento, paisOrigen) {
        super(id, nombre, apellido, fechaNacimiento);
        this.paisOrigen = paisOrigen;
    }

    toString() {
        return super.toString() + `, País de Origen: ${this.paisOrigen}`;
    }
}

class PersonaComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    async fetchPersonas() {
        try {
            const response = await fetch('https://examenesutn.vercel.app/api/PersonaCiudadanoExtranjero');
            const data = await response.json();
            return data.map(item => {
                return item.dni ? new Ciudadano(item.id, item.nombre, item.apellido, item.fechaNacimiento, item.dni) : 
                new Extranjero(item.id, item.nombre, item.apellido, item.fechaNacimiento, item.paisOrigen);
            });
        } catch (error) {
            console.error('Error fetching de personas:', error);
        }
    }

    async render() {
        const personas = await this.fetchPersonas();
        const personaList = personas.map(persona => {
            return `<li>${persona.toString()}</li>`;
        }).join('');
        
        this.shadowRoot.innerHTML = `
            <ul>
                ${personaList}
            </ul>
        `;
    }
}

customElements.define('persona-component', PersonaComponent);
