import { getStorageItem, setStorageItem, removeStorageItem } from '@/lib/utils/storage';

export interface TokenStore {
	getToken: () => string | null;
	setToken: (token: string) => void;
	removeToken: () => void;
}

export function createTokenStore(dappId: string): TokenStore {
	const TOKEN_KEY = `auth_token_${dappId}`;

	return {
		getToken: () => {
			if (typeof window === 'undefined') return null;
			const cookie = document.cookie
				.split(';')
				.find(c => c.trim().startsWith(`${TOKEN_KEY}=`));
			return cookie ? decodeURIComponent(cookie.split('=')[ 1 ]) : null;
		},
		setToken: (token: string) => {
			if (typeof window === 'undefined') return;
			const secure = window.location.protocol === 'https:';
			document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=86400${secure ? '; secure' : ''}; samesite=strict`;
		},
		removeToken: () => {
			if (typeof window === 'undefined') return;
			document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
		},
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