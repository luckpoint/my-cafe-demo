const USER_KEY = 'my_coffee_user';

export const auth = {
    login() {
        const user = {
            name: 'Demo User',
            email: 'demo@example.com',
            image: 'https://ui-avatars.com/api/?name=Demo+User&background=00704A&color=fff'
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        window.location.reload(); // Simple reload to update state
    },

    logout() {
        localStorage.removeItem(USER_KEY);
        window.location.href = '/';
    },

    isAuthenticated() {
        return !!localStorage.getItem(USER_KEY);
    },

    getUser() {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    }
};
