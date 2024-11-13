new Vue({
    el: '#app',
    data: {
        newPassword: '',
        token: new URLSearchParams(window.location.search).get('token') 
    },
    methods: {
        async resetPassword() {
            try {
                const response = await fetch('http://localhost:4000/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: this.token,
                        newPassword: this.newPassword
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    window.location.href = 'index.html'; 
                } else {
                    const errorData = await response.json();
                    alert(errorData.message);
                }
            } catch (error) {
                console.error('Error al restablecer la contraseña:', error);
            }
        }
    }
});
