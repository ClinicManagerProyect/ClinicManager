new Vue({
    el: "#app",
    data: {
        idEmpleado: null,
        verTareasU: []
    },
    watch: {
        verTareasU(newVal) {
            console.log("Actualización en verTareasU:", newVal);
        }
    },
    methods: {
        async verTareas() {
            try {
                console.log(`Fetching tasks for employee ID: ${this.idEmpleado}`);
                const response = await fetch(`http://localhost:4000/verTarea/${this.idEmpleado}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    this.verTareasU = await response.json();
                    console.log("Tareas obtenidas:", this.verTareasU);
                } else {
                    const errorData = await response.json();
                    console.error("Error del servidor:", errorData);
                    throw new Error(errorData.message || "Error desconocido.");
                }
            } catch (error) {
                console.error("Error al obtener las tareas:", error);
                alert("No se pudieron cargar las tareas.");
            }
        },
    },

    mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        this.idEmpleado = urlParams.get('idEmpleado');
        console.log("ID del empleado en mounted:", this.idEmpleado);
        if (this.idEmpleado) {
            this.verTareas();
        }
    }
});