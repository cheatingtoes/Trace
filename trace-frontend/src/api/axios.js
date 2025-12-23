import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let _accessToken = null;

// Helper we can export if other files need to set the token manually (e.g. at login)
export const setAccessToken = (token) => {
    _accessToken = token;
};

let isRefreshing = false;
let failedQueue = [];

// Helper to queue requests while refreshing
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// 2. REQUEST INTERCEPTOR: Attach Access Token
api.interceptors.request.use(
    (config) => {
        if (_accessToken) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR: Handle 401s
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/login')) {
            return Promise.reject(error);
        }

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject});
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call your Refresh Endpoint
                // Note: We don't send data, the Cookie sends itself!
                const rs = await api.post('/auth/refresh');
                
                const { accessToken } = rs.data;
                
                setAccessToken(accessToken);
                
                // Update header for this instance
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                // Process any queued requests
                processQueue(null, accessToken);
                
                // Retry the original failed request
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (_error) {
                processQueue(_error, null);
                window.location.href = '/login';
                return Promise.reject(_error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;