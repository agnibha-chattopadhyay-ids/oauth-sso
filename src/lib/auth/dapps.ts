export type AuthMethod = "credentials" | "google";

// Simple dapp configuration interface
export interface DappConfig {
	dappId: string;
	name: string;
	applicationUrl: string;
	allowedRedirectUrls: string[];
	authMethods: AuthMethod[];
	theme?: {
		primaryColor?: string;
		backgroundColor?: string;
	};
}

// Predefined UUIDs
export const DAPP_IDS = {
	DEFAULT: "0a696f34-1d5e-4cd3-9ede-d06c76cde1fa",
	POLYVERSITY: "716cef84-51de-4735-8102-f5c76b71b7cf"
} as const;

// Simple configurations map
const dappConfigs: Record<string, DappConfig> = {
	[ DAPP_IDS.DEFAULT ]: {
		dappId: DAPP_IDS.DEFAULT,
		name: 'Default Application',
		applicationUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
		allowedRedirectUrls: [ '/dashboard', '/profile' ],
		authMethods: [ 'credentials', 'google' ],
		theme: {
			primaryColor: '#0284c7',
			backgroundColor: '#ffffff'
		}
	},
	[ DAPP_IDS.POLYVERSITY ]: {
		dappId: DAPP_IDS.POLYVERSITY,
		name: 'Polyversity',
		applicationUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
		allowedRedirectUrls: [
			'http://localhost:3001',
			'http://localhost:3001/dashboard',
			'http://localhost:3001/profile',
			'http://localhost:3001/courses'
		],
		authMethods: [ 'credentials', 'google' ],
		theme: {
			primaryColor: '#6366f1',
			backgroundColor: '#f8fafc'
		}
	},
};

// Simple functions to access dapp configs
export const getDapp = (dappId: string) => dappConfigs[ dappId ];
export const validateRedirectUrl = (dappId: string, redirectUrl: string) =>
	dappConfigs[ dappId ]?.allowedRedirectUrls.includes(redirectUrl) ?? false; 