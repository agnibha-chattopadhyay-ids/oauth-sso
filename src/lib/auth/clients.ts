export type AuthMethod = "credentials" | "google";

export interface TokenConfig {
	accessTokenExpiry: number; // in seconds
	refreshTokenExpiry: number; // in seconds
	tokenType: "JWT" | "opaque";
	rotateRefreshToken: boolean;
}

export interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number; // in milliseconds
	blockDurationMs: number; // in milliseconds
}

export interface SecurityConfig {
	requireMFA: boolean;
	passwordPolicy?: {
		minLength: number;
		requireNumbers: boolean;
		requireSpecialChars: boolean;
		requireUppercase: boolean;
		requireLowercase: boolean;
	};
	sessionPolicy?: {
		maxConcurrentSessions: number;
		revokeOldestSession: boolean;
	};
	ipWhitelist?: string[];
	ipBlacklist?: string[];
}

export interface ClientConfig {
	clientId: string;
	name: string;
	description: string;
	logoUrl?: string;
	applicationUrl: string;
	allowedRedirectUrls: string[];
	allowedOrigins: string[];
	authMethods: AuthMethod[];
	theme?: {
		primaryColor?: string;
		accentColor?: string;
		logo?: {
			light: string;
			dark: string;
		};
	};
	tokens: TokenConfig;
	rateLimit: RateLimitConfig;
	security: SecurityConfig;
	metadata?: Record<string, unknown>;
}

class ClientRegistry {
	private clients: Map<string, ClientConfig> = new Map();
	private rateLimiters: Map<string, Map<string, { count: number; timestamp: number }>> = new Map();

	registerClient(config: ClientConfig): void {
		if (this.clients.has(config.clientId)) {
			throw new Error(`Client with ID ${config.clientId} already exists`);
		}
		this.clients.set(config.clientId, config);
		this.rateLimiters.set(config.clientId, new Map());
	}

	getClient(clientId: string): ClientConfig | undefined {
		return this.clients.get(clientId);
	}

	getAllClients(): ClientConfig[] {
		return Array.from(this.clients.values());
	}

	validateRedirectUrl(clientId: string, redirectUrl: string): boolean {
		const client = this.clients.get(clientId);
		if (!client) return false;

		return client.allowedRedirectUrls.some(allowed => {
			try {
				const allowedUrl = new URL(allowed);
				const redirectUrlObj = new URL(redirectUrl);
				return allowedUrl.origin === redirectUrlObj.origin &&
					redirectUrlObj.pathname.startsWith(allowedUrl.pathname);
			} catch {
				return false;
			}
		});
	}

	validateOrigin(clientId: string, origin: string): boolean {
		const client = this.clients.get(clientId);
		return client?.allowedOrigins.includes(origin) ?? false;
	}

	supportsAuthMethod(clientId: string, method: AuthMethod): boolean {
		const client = this.clients.get(clientId);
		return client?.authMethods.includes(method) ?? false;
	}

	checkRateLimit(clientId: string, identifier: string): { allowed: boolean; resetTime?: Date } {
		const client = this.clients.get(clientId);
		if (!client) return { allowed: false };

		const clientLimiter = this.rateLimiters.get(clientId);
		if (!clientLimiter) return { allowed: false };

		const now = Date.now();
		const attempt = clientLimiter.get(identifier);

		if (!attempt) {
			clientLimiter.set(identifier, { count: 1, timestamp: now });
			return { allowed: true };
		}

		if (now - attempt.timestamp > client.rateLimit.windowMs) {
			clientLimiter.set(identifier, { count: 1, timestamp: now });
			return { allowed: true };
		}

		if (attempt.count >= client.rateLimit.maxAttempts) {
			const resetTime = new Date(attempt.timestamp + client.rateLimit.blockDurationMs);
			return { allowed: false, resetTime };
		}

		attempt.count++;
		return { allowed: true };
	}

	validateIpAccess(clientId: string, ip: string): boolean {
		const client = this.clients.get(clientId);
		if (!client) return false;

		if (client.security.ipWhitelist?.length) {
			return client.security.ipWhitelist.includes(ip);
		}

		if (client.security.ipBlacklist?.length) {
			return !client.security.ipBlacklist.includes(ip);
		}

		return true;
	}
}

export const clientRegistry = new ClientRegistry();

// Register default client
clientRegistry.registerClient({
	clientId: process.env.NEXT_PUBLIC_CLIENT_ID || 'default',
	name: 'Default Application',
	description: 'Main application with full authentication support',
	applicationUrl: process.env.NEXT_PUBLIC_APPLICATION_URL || 'http://localhost:3000',
	allowedRedirectUrls: [ '/dashboard', '/profile' ],
	allowedOrigins: [ typeof window !== 'undefined' ? window.location.origin : '' ],
	authMethods: [ 'credentials', 'google' ],
	theme: {
		primaryColor: '#0070f3',
		accentColor: '#00a3ff',
	},
	tokens: {
		accessTokenExpiry: 3600, // 1 hour
		refreshTokenExpiry: 2592000, // 30 days
		tokenType: "JWT",
		rotateRefreshToken: true,
	},
	rateLimit: {
		maxAttempts: 5,
		windowMs: 300000, // 5 minutes
		blockDurationMs: 900000, // 15 minutes
	},
	security: {
		requireMFA: false,
		passwordPolicy: {
			minLength: 8,
			requireNumbers: true,
			requireSpecialChars: true,
			requireUppercase: true,
			requireLowercase: true,
		},
		sessionPolicy: {
			maxConcurrentSessions: 5,
			revokeOldestSession: true,
		},
	},
});

// Example: Register a client-only application
clientRegistry.registerClient({
	clientId: 'client-app',
	name: 'Client Application',
	description: 'External client application with SSO support',
	applicationUrl: 'http://localhost:3001',
	allowedRedirectUrls: [ 'http://localhost:3001/auth/callback' ],
	allowedOrigins: [ 'http://localhost:3001' ],
	authMethods: [ 'google' ],
	theme: {
		primaryColor: '#10b981',
		accentColor: '#059669',
	},
	tokens: {
		accessTokenExpiry: 1800, // 30 minutes
		refreshTokenExpiry: 604800, // 7 days
		tokenType: "JWT",
		rotateRefreshToken: true,
	},
	rateLimit: {
		maxAttempts: 3,
		windowMs: 60000, // 1 minute
		blockDurationMs: 300000, // 5 minutes
	},
	security: {
		requireMFA: false,
		sessionPolicy: {
			maxConcurrentSessions: 1,
			revokeOldestSession: true,
		},
		ipWhitelist: [ '127.0.0.1' ], // Example IP whitelist
	},
}); 