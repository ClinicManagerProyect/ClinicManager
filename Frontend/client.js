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
                const response = await fetch('http://localhost:5000/login', {
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
                    this.userRole = data.user.role; 
                    localStorage.setItem('userRole', this.userRole); 
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
            if (this.userRole === 'admin') {
                window.location.href = './admin.html'; 
            } else if (this.userRole === 'user') {
                window.location.href = './user.html'; 
            }
        }
    }
});
