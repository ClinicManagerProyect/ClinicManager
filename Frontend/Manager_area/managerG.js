new Vue({
  el: "#app",
  data: {
    idGerente: localStorage.getItem("idGerente"),
    empleados: [],
    mostrarFormulario:false,
    idEmpleado:null,
    tarea:"",
    descripcion: "",
    prioridad: "", // Valor por defecto
    fechaVencimiento: "",
    idHabitacion: "", // Asumiendo que es un campo adicional
    estado: "" // 
  },

  methods: {
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
    logout() {
      localStorage.removeItem('idGerente'); 
      this.idGerente = null; 
      this.empleados = [];
      window.location.href = '../index.html'; 
    },
    mostrarFormularioTarea(idEmpleado) {
      this.idEmpleado = idEmpleado; // Guardar el ID del empleado seleccionado
      this.mostrarFormulario = true; // Mostrar el formulario de asignación de tarea
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
          this.mostrarFormulario = false;
          this.tarea = "";
          this.descripcion = "";
          this.fechaVencimiento = "";
          this.idHabitacion = "";
          this.prioridad="";
          this.estado="";
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Error al asignar tarea.");
        }
      } catch (error) {
        console.error("Error al asignar tarea:", error);
        alert("No se pudo asignar la tarea.");
      }
    }
  },
  mounted() {
    if (this.idGerente) {
      this.verEmpleadosAsociados();
    }
  },
});
