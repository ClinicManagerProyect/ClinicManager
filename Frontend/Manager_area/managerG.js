new Vue({
    el: "#app",
    data: {
        idGerente: localStorage.getItem("idGerente"),
        empleados: [],
        mostrarFormulario: false,
        idEmpleado: null,
        tarea: "",
        descripcion: "",
        prioridad: "",
        fechaVencimiento: "",
        idHabitacion: "",
        estado: "",
        verTareasU: []
    },
    watch: {
        verTareasU(newVal) {
            console.log("Actualización en verTareasU:", newVal);
        }
    },
    methods: {
        mostrarFormularioTarea(idEmpleado) {
            this.idEmpleado = idEmpleado;
            this.mostrarFormulario = true;
        },

        mostrarFormularioTarea(idEmpleado) {
            this.idEmpleado = idEmpleado;
            this.mostrarFormulario = true;
        },

        cerrarFormularioTarea() {
            this.mostrarFormulario = false;
            this.tarea = "";
            this.descripcion = "";
            this.prioridad = "";
            this.fechaVencimiento = "";
            this.idHabitacion = "";
            this.estado = "";
        },        
        async verEmpleadosAsociados() {
            try {
                this.empleados = [];
                const response = await fetch(
                    `http://localhost:4000/empleadosAsociados/${this.idGerente}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    this.empleados = await response.json();
                    if (!Array.isArray(this.empleados)) {
                        throw new Error("Formato de respuesta no válido.");
                    }
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Error desconocido.");
                }
            } catch (error) {
                console.error("Error al obtener empleados:", error);
                alert("No se pudieron cargar los empleados.");
            }
        },
        async verTareas(idEmpleado) {
            console.log("el id a enviar es", idEmpleado)
            window.location.href = `viewTasks.html?idEmpleado=${idEmpleado}`;
        },
        logout() {
            localStorage.removeItem('idGerente');
            this.idGerente = null;
            this.empleados = [];
            window.location.href = '../index.html';
        },

        async asignarTarea() {
            try {
                const response = await fetch('http://localhost:4000/asignarTarea', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idEmpleado: this.idEmpleado,
                        nombreTarea: this.tarea,
                        descripcion: this.descripcion,
                        prioridad: this.prioridad,
                        fechaVencimiento: this.fechaVencimiento,
                        estado: this.estado,
                        idHabitacion: this.idHabitacion
                    })
                });
                if (response.ok) {
                    alert("Tarea asignada correctamente");
                    this.cerrarFormularioTarea();
                    location.reload();
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Error al asignar tarea.");
                }
            } catch (error) {
                console.error("Error al asignar tarea:", error);
                alert("No se pudo asignar la tarea.");
            }
        },
        async generarInforme() {
            try {
                const response = await fetch(`http://localhost:4000/generarInforme/${this.idGerente}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (response.ok) {
                    
                    const blob = await response.blob();
    
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'informe_empleados.pdf'); // Nombre del archivo
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Error al generar el informe.");
                }
            } catch (error) {
                console.error("Error al generar informe:", error);
                alert("No se pudo generar el informe.");
            }
        }       
    },
    mounted() {
        if (this.idGerente) {
            this.verEmpleadosAsociados();
        }
    },
});
