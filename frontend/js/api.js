// /frontend/js/api.js
const API_BASE_URL = 'http://localhost:3000';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const config = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Ocorreu um erro na requisição.');
        }
        return data;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error; // Lança o erro para que a tela possa tratá-lo
    }
}