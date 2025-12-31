/**
 * Auth API Service
 * Handles user authentication with backend
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role: string;
    verificationData?: Record<string, any>;
}

export interface LoginResult {
    success: boolean;
    message: string;
    user?: any;
    approved?: boolean;
    notFound?: boolean;
}

export interface RegisterResult {
    success: boolean;
    message: string;
    user?: any;
}

export const authApiService = {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<RegisterResult> {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message: result.message || 'Registration failed'
                };
            }

            return {
                success: true,
                message: result.message || 'Account created successfully',
                user: result.user
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Connection failed. Please ensure the server is running.'
            };
        }
    },

    /**
     * Login user
     */
    async login(email: string, password: string): Promise<LoginResult> {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                // Check for account not found (email doesn't exist)
                if (response.status === 404 && result.notFound) {
                    return {
                        success: false,
                        message: result.message || 'Account not found',
                        notFound: true
                    };
                }

                // Check specifically for not approved status
                if (response.status === 403 && result.approved === false) {
                    return {
                        success: false,
                        message: result.message || 'Account pending verification',
                        approved: false
                    };
                }

                return {
                    success: false,
                    message: result.message || 'Login failed'
                };
            }

            return {
                success: true,
                message: 'Login successful',
                user: result.user,
                approved: true
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Connection failed. Please ensure the server is running.'
            };
        }
    },

    /**
     * Check if email exists and approval status
     */
    async checkEmail(email: string): Promise<{ exists: boolean; approved?: boolean }> {
        try {
            const response = await fetch(`${API_BASE}/auth/check/${encodeURIComponent(email)}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Check email error:', error);
            return { exists: false };
        }
    }
};
