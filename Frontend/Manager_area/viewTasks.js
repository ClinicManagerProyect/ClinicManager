new Vue({
    el: "#app",
    data: {
        idGerente: localStorage.getItem("idGerente"),
        idEmpleado: null,
        verTareasU: [],
        tareasFiltradas: [],
        prioridadSeleccionada: "",
        modalVisible: false,

        tareaSeleccionada: {
            ID_HABITACION: null,
            NOMBRE: "",
            DESCRIPCION: "",
            PRIORIDAD: "",
            FECHA_VENCIMIENTO: "",
            ESTADO: "",
        },
    },
    watch: {
        verTareasU(newVal) {
            console.log("Actualización en verTareasU:", newVal);
        },
    },
    methods: {
        async verTareas() {
            try {
                const response = await fetch(
                    `http://localhost:4000/verTarea/${this.idEmpleado}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    this.verTareasU = await response.json();
                    console.log("Tareas obtenidas:", this.verTareasU);
                    this.tareasFiltradas = this.verTareasU;
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
        abrirModal(tarea) {
            this.modalVisible = true;
            this.tareaSeleccionada = {...tarea};
            console.log("tareas en modal infromacion:", this.tareaSeleccionada);
        },
        cerrarModal() {
            this.modalVisible = false;
            this.tareaSeleccionada = {};
        },
        filtrarPorPrioridad(prioridad) {
            this.prioridadSeleccionada = prioridad; // Actualiza la prioridad seleccionada
            if (prioridad) {
                this.tareasFiltradas = this.verTareasU.filter(
                    (tarea) => tarea.PRIORIDAD === prioridad
                );
            } else {
                this.tareasFiltradas = this.verTareasU; // Muestra todas si no hay filtro
            }
        },


        async editarTarea() {
            try {
                const response = await fetch(
                    `http://localhost:4000/editarTarea/${this.tareaSeleccionada.ID_TAREA}`,
                    {
                        method: "PUT",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify(this.tareaSeleccionada),
                    }
                );
                if (response.ok) {
                    alert("Tarea actualizada exitosamente.");
                    this.verTareas();
                    this.cerrarModal();
                } else {
                    throw new Error("Error al actualizar la tarea.");
                }
            } catch (error) {
                console.error(error);
                alert("No se pudo actualizar la tarea.");
            }
        },
        async eliminarTarea(idTareaD) {
            console.log(idTareaD)
            if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
                try {
                    const response = await fetch(
                        `http://localhost:4000/eliminarTarea/${idTareaD}`,
                        {
                            method: "DELETE",
                        }
                    );
                    if (response.ok) {
                        alert("Tarea eliminada exitosamente.");
                        this.verTareas();
                    } else {
                        const errorData = await response.json();
                        console.error("Error del servidor:", errorData);
                        throw new Error(errorData.message || "Error desconocido.");
                    }
                } catch (error) {
                    console.error("Error al eliminar la tarea:", error);
                    alert("No se pudo eliminar la tarea.");
                }
            }
        },
        logout() {
            localStorage.removeItem('idGerente');
            this.idGerente = null;
            this.empleados = [];
            window.location.href = '../index.html';
        },
    },
    mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        this.idEmpleado = urlParams.get("idEmpleado");
        console.log("ID del empleado en mounted:", this.idEmpleado);
        if (this.idEmpleado) {
            this.verTareas();
        }
    },
});