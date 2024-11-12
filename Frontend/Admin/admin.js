new Vue({
  el: "#app",
  data: {
    persona: {
      id_persona: "",
      tipo_identificacion: "",
      nombres: "",
      apellidos: "",
      genero: "",
      correo: "",
      direccion: "",
      telefono: "",
    },
    usuario: {
      id_usuario: "",
      contrasena: "",
      tipo_usuario: "",
      estado: "",
      id_persona: "",
    },
    empleado: {
      id_empleo: "",
      estado: "",
      id_gerente: "",
      fecha_contratacion: "",
      hora_entrada: "",
      hora_salida: "",
    },
    empleados: [],
    empleadoSeleccionado: null,
  },
  methods: {
    async registrar() {
      try {
        const response = await fetch("http://localhost:4000/registro", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            persona: this.persona,
            usuario: this.usuario,
            empleado: this.empleado,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Registro exitoso:", data);
          alert("Registro completado exitosamente.");
          window.location.href = 'super-admin.html';
        } else {
          const errorData = await response.json();
          alert(errorData.message);
        }
      } catch (error) {
        console.error("Error al registrar:", error);
      }
    },

    async DeshabilitarEmpleado() {

      const idUsuario = prompt("Por favor, ingresa el ID del usuario a deshabilitar:");
      if (!idUsuario) {
        alert("No ingresaste un ID de usuario.");
        return;
      }
      alert("Usuario Deshabilitado")
      try {
        const response = await fetch(
          `http://localhost:4000/deshabilitarEmpleado/${idUsuario}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usuario: this.usuario,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Empleado deshabilitado:", data);
          alert("Empleado deshabilitado exitosamente.");

          this.usuario = this.usuario.map((usuario) =>
              usuario.ID_USUARIO === idUsuario
                  ? { ...usuario, ESTADO_USUARIO: "I" } // Cambiar el estado a "Inactivo"
                  : usuario
          );
        } else {
          const errorData = await response.json();
          alert(errorData.message);
        }
      } catch (error) {
        console.error("Error al deshabilitar el empleado:", error);
      }
    },

    async verEmpleados() {
      try {
        const response = await fetch("http://localhost:4000/empleados", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

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

    async verEmpleado(idEmpleado) {
      try {
        const response = await fetch(
          `http://localhost:4000/empleados/${idEmpleado}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          this.empleadoSeleccionado = await response.json();
          console.log("Empleado obtenido:", this.empleadoSeleccionado);
        } else {
          const errorData = await response.json();
          alert(errorData.message);
        }
      } catch (error) {
        console.error("Error al obtener el empleado:", error);
      }
    },
  },
  mounted() {
    this.verEmpleados();
  },
});
