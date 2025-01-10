import { getStorageItem, setStorageItem, removeStorageItem } from '@/lib/utils/storage';

export interface TokenStore {
	getToken: () => string | null;
	setToken: (token: string) => void;
	removeToken: () => void;
	getRefreshToken: () => string | null;
	setRefreshToken: (token: string) => void;
}

export function createTokenStore(clientId: string): TokenStore {
	const TOKEN_KEY = `auth_token_${clientId}`;
	const REFRESH_TOKEN_KEY = `refresh_token_${clientId}`;

	return {
		getToken: () => getStorageItem(TOKEN_KEY),
		setToken: (token: string) => setStorageItem(TOKEN_KEY, token),
		removeToken: () => removeStorageItem(TOKEN_KEY),
		getRefreshToken: () => getStorageItem(REFRESH_TOKEN_KEY),
		setRefreshToken: (token: string) => setStorageItem(REFRESH_TOKEN_KEY, token),
	};
}

export function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(atob(token.split('.')[ 1 ]));
		const expiryTime = payload.exp * 1000; // Convert to milliseconds
		return Date.now() >= expiryTime;
	} catch {
		return true;
	}
}

export function parseToken(token: string): { userId: string; exp: number } | null {
	try {
		const payload = JSON.parse(atob(token.split('.')[ 1 ]));
		return {
			userId: payload.sub,
			exp: payload.exp,
		};
	} catch {
		return null;
	}
} 