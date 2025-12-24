import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
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
            config.headers['Authorization'] = `Bearer ${_accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR: Handle Data Unwrapping and 401s
api.interceptors.response.use(
    (response) => {
        // If the response has the standardized success format, unwrap the data
        if (response.data && typeof response.data.success === 'boolean' && response.data.success) {
            response.data = response.data.data;
        }
        return response;
    },
    async (error) => {
        // If the API returns a standardized error, make the message easily accessible
        if (error.response?.data?.success === false && error.response.data.error) {
            error.response.data.message = error.response.data.error.message;
        }

        const originalRequest = error.config;

        // Don't retry refresh or login failures
        if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/login')) {
            return Promise.reject(error);
        }

        // If error is 401 and we haven't retried yet, try to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                // If a refresh is already in progress, queue this request
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
                // Call the refresh token endpoint
                const rs = await api.post('/auth/refresh');
                
                const { accessToken } = rs.data;
                
                setAccessToken(accessToken);
                
                // Update the default header for subsequent requests
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                // Process any queued requests with the new token
                processQueue(null, accessToken);
                
                // Retry the original failed request
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (_error) {
                // If refresh fails, clear queue and redirect to login
                processQueue(_error, null);
                setAccessToken(null); // Clear expired token
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
