new Vue({
    el: "#app",
    data: {
        verTareasU: [],
        tareasComp: [],
        showCompletedTasks: false
    },

    methods: {
        async viewTasksCompletes(idEmpleado) {
            try {
                const response = await fetch(
                    `http://localhost:4000/verTareasCompletas/${idEmpleado}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (response.ok) {
                    this.tareasComp = await response.json();
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
        const token = sessionStorage.getItem("token");
        const payload = JSON.parse(atob(token.split(".")[1]));
        const idEmpleado = payload.id;
        this.viewTasks(idEmpleado);
    },
});