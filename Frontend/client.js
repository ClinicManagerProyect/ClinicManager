new Vue({
    el: '#app',
    data: {
        username: '',
        password: '',
        userRole: null
    },
    methods: {
        async login() {
            try {
                const response = await fetch('http://localhost:4000/login', {
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
                    console.log("Respuesta del servidor:", data); 
                    this.userRole = data.user.role; 
                    localStorage.setItem('token', data.token); 
                    this.redirectUser();
                } else {
                    const errorData = await response.json();
                    alert(errorData.message);
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
            }
        },
        redirectUser() {
            const token = localStorage.getItem('token'); 
        
            if (!token) {
                alert('Debes iniciar sesión primero.');
                window.location.href = 'index.html'; 
                return;
            }

            switch (this.userRole) {
                case 'GER': 
                
                    window.location.href = 'Manager_area/admin.html';
                    break;
                case 'ADM': 
                    window.location.href = 'Admin/super-admin.html';
                    break;
                case 'EMP': 
                    window.location.href = 'user/user.html';
                    break;
                default:
                    console.error('Rol de usuario no válido:', this.userRole);
                    alert('Rol de usuario no reconocido.');
                    break; 
            }
        }
    }
});
