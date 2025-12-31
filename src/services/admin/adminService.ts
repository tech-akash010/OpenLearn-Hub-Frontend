/**
 * Admin Service
 * Handles admin authentication and user management API calls
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

const ADMIN_TOKEN_KEY = 'openlearn_admin_token';

export const adminService = {
    /**
     * Get stored admin token
     */
    getToken(): string | null {
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    },

    /**
     * Check if admin is logged in
     */
    isLoggedIn(): boolean {
        return this.getToken() !== null;
    },

    /**
     * Admin login
     */
    async login(username: string, password: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${API_BASE}/auth/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || 'Login failed' };
            }

            // Store token
            localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
            return { success: true, message: 'Login successful' };
        } catch (error) {
            console.error('Admin login error:', error);
            return { success: false, message: 'Connection failed. Is the server running?' };
        }
    },

    /**
     * Admin logout
     */
    logout(): void {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    },

    /**
     * Get all users
     */
    async getUsers(status?: 'pending' | 'approved'): Promise<any[]> {
        try {
            const token = this.getToken();
            if (!token) throw new Error('Not authenticated');

            const url = status ? `${API_BASE}/admin/users?status=${status}` : `${API_BASE}/admin/users`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.logout();
                    throw new Error('Session expired');
                }
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Get users error:', error);
            throw error;
        }
    },

    /**
     * Get admin dashboard stats
     */
    async getStats(): Promise<{ total: number; pending: number; approved: number; byRole: Record<string, number> }> {
        try {
            const token = this.getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_BASE}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            return data.stats;
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    },

    /**
     * Approve a user
     */
    async approveUser(userId: string): Promise<{ success: boolean; message: string; emailSent?: boolean }> {
        try {
            const token = this.getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_BASE}/admin/users/${userId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, message: data.message || 'Approval failed' };
            }

            return {
                success: true,
                message: data.message || 'User approved',
                emailSent: data.emailSent
            };
        } catch (error) {
            console.error('Approve user error:', error);
            return { success: false, message: 'Failed to approve user' };
        }
    },

    /**
     * Get single user details
     */
    async getUser(userId: string): Promise<any> {
        try {
            const token = this.getToken();
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }

            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }
};
