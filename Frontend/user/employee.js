new Vue({
  el: "#app",
  data: {
    verTareasU: [],
    tareasComp:[]
  },
  methods: {
    async viewTasks(idEmpleado) {
      try {
        const response = await fetch(
          `http://localhost:4000/verTareaE/${idEmpleado}`,
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
    async updateTaskStatus(taskId, newStatus) {
      try {
        const token = localStorage.getItem("token");
        const payload = JSON.parse(atob(token.split(".")[1]));
        const idEmpleado = payload.id;

        const response = await fetch(`http://localhost:4000/actualizarTarea`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idEmpleado,
            idTarea: taskId,
            estado: newStatus,
          }),
        });

        if (response.ok) {
          console.log(
            `Estado de la tarea ${taskId} actualizado a ${newStatus}`
          );

          if (newStatus === "COM") {
            this.verTareasU = this.verTareasU.filter(
              (tarea) => tarea.ID_TAREA !== taskId
            );
          }
        } else {
          const errorData = await response.json();
          console.error("Error del servidor:", errorData);
          alert("No se pudo actualizar el estado de la tarea.");
        }
      } catch (error) {
        console.error("Error al actualizar el estado de la tarea:", error);
        alert("No se pudo conectar con el servidor.");
      }
    },

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
    estadoTexto(estado) {
      switch (estado) {
        case "ASG":
          return "Asignada";
        case "SCM":
          return "En Progreso";
        case "COM":
          return "Completada";
        default:
          return "Desconocido";
      }
    },
    formatFecha(fechaISO) {
      const fecha = new Date(fechaISO);
      return fecha.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  mounted() {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const idEmpleado = payload.id;
    this.viewTasks(idEmpleado);
  },
});
