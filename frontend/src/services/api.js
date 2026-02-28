const API_BASE = 'http://127.0.0.1:5000/api';

export const api = {
    async get(endpoint) {
        const token = localStorage.getItem('agro_token');
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        return response.json();
    },
    async post(endpoint, data) {
        const token = localStorage.getItem('agro_token');
        const isFormData = data instanceof FormData;

        const headers = {
            'Authorization': token ? `Bearer ${token}` : ''
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data)
        });
        return response.json();
    },
    async put(endpoint, data) {
        const token = localStorage.getItem('agro_token');
        const isFormData = data instanceof FormData;

        const headers = {
            'Authorization': token ? `Bearer ${token}` : ''
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: headers,
            body: isFormData ? data : JSON.stringify(data)
        });
        return response.json();
    },
    async delete(endpoint) {
        const token = localStorage.getItem('agro_token');
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        return response.json();
    }
};
