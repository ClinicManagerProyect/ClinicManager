new Vue({
    el: '#app',
    data: {
        username: '',
        password: ''
    },
    methods: {
        async login() {
            try {
                const response = await fetch('endpoint aun no definido', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Inicio de sesión exitoso:', data);
                    
                } else {
                    console.error('Error en el inicio de sesión:', response.statusText);
                    alert('Usuario o contraseña incorrectos.');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
            }
        }
    }
});
