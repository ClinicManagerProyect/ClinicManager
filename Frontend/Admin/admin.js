new Vue({
    el: "#app",
    data: {
        persona: {
            id_persona: " ",
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
            estado: "A",
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
        estadoFiltro: 'all',  
        empleadosFiltrados: [],  
        empleadoSeleccionado: null,
        gerentes: [],
        viendoDeshabilitados: false,
        searchQuery: "",
        employees:[]
    },
    methods: {

        async registrar() {
            try {
                this.usuario.contrasena = this.persona.id_persona;
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
                    window.location.href = "super-admin.html";
                } else {
                    const errorData = await response.json();
                    alert(errorData.message);
                }
            } catch (error) {
                console.error("Error al registrar:", error);
            }
        },

        async obtenerEmpleadoEspecifico(idUsuario) {
            try {
                const response = await fetch(`http://localhost:4000/obtenerEmpleado/${idUsuario}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    this.empleadoSeleccionado = await response.json();

                    localStorage.setItem('empleadoSeleccionado', JSON.stringify(this.empleadoSeleccionado));
                    window.open('editEmp.html', '_blank');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Error al obtener empleado.");
                }
            } catch (error) {
                console.error("Error al obtener empleado especifico:", error);
                alert("No se pudieron cargar la información del empleado.");
            }
        },

        async actualizarEmpleado() {
            try {
                if (!this.empleadoSeleccionado) {
                    alert("No hay empleado seleccionado para actualizar.");
                    return;
                }

          
                if (!this.empleadoSeleccionado.ID_PERSONA || !this.empleadoSeleccionado.NOMBRES) {
                    alert("Por favor, complete todos los campos requeridos.");
                    return;
                }

                const response = await fetch("http://localhost:4000/actualizarEmpleado", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        persona: {
                            id_persona: this.empleadoSeleccionado.ID_PERSONA,
                            tipo_identificacion: this.empleadoSeleccionado.TIPO_IDENTIFICACION,
                            nombres: this.empleadoSeleccionado.NOMBRES,
                            apellidos: this.empleadoSeleccionado.APELLIDOS,
                            genero: this.empleadoSeleccionado.GENERO,
                            correo: this.empleadoSeleccionado.CORREO,
                            direccion: this.empleadoSeleccionado.DIRECCION,
                            telefono: this.empleadoSeleccionado.TELEFONO,
                        },
                        usuario: {
                            id_usuario: this.empleadoSeleccionado.ID_USUARIO,
                            tipo_usuario: this.empleadoSeleccionado.TIPO_USUARIO,
                            estado: this.empleadoSeleccionado.ESTADO,
                        },
                        empleado: {
                            id_empleo: this.empleadoSeleccionado.ID_EMPLEO,
                            id_gerente: this.empleadoSeleccionado.id_gerente,
                            fecha_contratacion: this.empleadoSeleccionado.FECHA_CONTRATACION,
                            hora_entrada: this.empleadoSeleccionado.HORA_ENTRADA,
                            hora_salida: this.empleadoSeleccionado.HORA_SALIDA,
                        },
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    alert("Empleado actualizado exitosamente.");
                    console.log("Respuesta del servidor:", data);

                    localStorage.removeItem("empleadoSeleccionado");
                    window.location.href = "super-admin.html";
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Error al actualizar el empleado.");
                }
            } catch (error) {
                console.error("Error al actualizar empleado:", error);
                alert("No se pudo actualizar el empleado.");
            }
        },
        async habilitarEmpleado(idUsuario) {
            if (!idUsuario) {
                alert("No se recibió un ID de usuario válido.");
                return;
            }
            try {
                const response = await fetch(
                    `http://localhost:4000/habilitarEmpleado/${idUsuario}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    console.log("Empleado habilitado:", data);

                    const empleado = this.empleados.find(
                        (emp) => emp.id_usuario === idUsuario
                    );
                    if (empleado) {
                        empleado.estado = "activo";
                    }
                    alert("Empleado habilitado exitosamente.");
                    location.reload();
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Error al habilitar el empleado.");
                }
            } catch (error) {
                console.error("Error al habilitar el empleado:", error);
                alert("Error al realizar la solicitud.");
            }
        },

        async DeshabilitarEmpleado(idUsuario) {
            if (!idUsuario) {
                alert("No se recibió un ID de usuario válido.");
                return;
            }
            try {
                const response = await fetch(
                    `http://localhost:4000/deshabilitarEmpleado/${idUsuario}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    console.log("Empleado deshabilitado:", data);

                    const empleado = this.empleados.find(
                        (emp) => emp.id_usuario === idUsuario
                    );
                    if (empleado) {
                        empleado.estado = "Inactivo";
                    }
                    alert("Empleado deshabilitado exitosamente.");
                    location.reload();
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "Error al deshabilitar el empleado.");
                }
            } catch (error) {
                console.error("Error al deshabilitar el empleado:", error);
                alert("Error al realizar la solicitud.");
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
                    this.filterEmpleadosPorNombre();
                    this.filtrarEmpleados();

                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Error desconocido.");
                }
            } catch (error) {
                console.error("Error al obtener empleados:", error);
                alert("No se pudieron cargar los empleados.");
            }
        },

        async verEmpleadosDes() {
            try {
                const response = await fetch("http://localhost:4000/empleadosDes", {
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
                    this.filterEmpleadosPorNombre();
                    this.filtrarEmpleados();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Error desconocido.");
                }
            } catch (error) {
                console.error("Error al obtener empleados Deshabilidatos:", error);
                alert("No se pudieron cargar los empleados deshabilitados.");
            }
        },

        async verGerentes() {
            try {
                const response = await fetch("http://localhost:4000/gerentes", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    this.gerentes = await response.json();
                } else {
                    const errorData = await response.json();
                    alert("Error al obtener gerentes.",errorData);
                }
            } catch (error) {
                console.error("Error al obtener gerentes:", error);
                alert("No se pudieron cargar los gerentes.");
            }
        },

        async verEmpleadosSG() {
            try {
                const response = await fetch("http://localhost:4000/verEmpleadosSG", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (response.ok) {
                    this.employees = await response.json();
                } else {
                    const errorData = await response.json();
                    alert("Error al obtener empleados.", errorData);
                }
            } catch (error) {
                console.error("Error al obtener los empleados del server:", error);
                alert("No se pudieron cargar los empleados.");
            }
        },
        async filtrarEmpleados(event) {
            if (!event || !event.target) {
                console.error("El evento o su target no están definidos aun.");
                return;
            }
            const filtro = event.target.value;
    
            if (filtro === 'all') {
                
                await this.verEmpleados();
            } else if (filtro === 'busy') {
               
                await this.verEmpleadosDes();
            }
        },
        filterEmpleadosPorNombre() {
            if (this.searchQuery) {
                const searchQueryLower = this.searchQuery.toLowerCase();
                this.empleadosFiltrados = this.empleados.filter(empleado => {
                    return empleado.NOMBRE_COMPLETO.toLowerCase().includes(searchQueryLower);
                });
            } else {
                this.empleadosFiltrados = this.empleados;
            }
        },
    },
    watch: {
        searchQuery() {
            this.filterEmpleadosPorNombre();
        }
    },
    mounted() {
        this.verEmpleadosSG();
        this.verEmpleados();
        this.verGerentes();
        const empleadoEnStorage = localStorage.getItem('empleadoSeleccionado');
        if (empleadoEnStorage) {
            this.empleadoSeleccionado = JSON.parse(empleadoEnStorage);
            console.log('Empleado recuperado:', this.empleadoSeleccionado);
        } else {
            console.log('No hay empleado seleccionado en el localStorage');
        }
    },
});