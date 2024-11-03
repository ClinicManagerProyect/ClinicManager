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
             switch (this.userRole) {
               case 'admin':
                 window.location.href = 'admin/admin.html';
                 break;
                   case 'user':
                  window.location.href = 'user/user.html';
                   break;
                   case 'super_admin':
                  window.location.href = 'superAdmin/super-admin.html';
                   break;
                 default:
            console.error('Invalid user role:', this.userRole);
            window.location.href = 'error.html';
    }
}
    }
});
