export type AuthMethod = "credentials" | "google";

// Extended theme configuration interface
interface ThemeConfig {
	primaryColor: string;
	backgroundColor: string;
	particleColor: string;
	foregroundColor: string;
	cardColor: string;
	cardForeground: string;
	popoverColor: string;
	popoverForeground: string;
	primaryForeground: string;
	secondaryColor: string;
	secondaryForeground: string;
	mutedColor: string;
	mutedForeground: string;
	accentColor: string;
	accentForeground: string;
	borderColor: string;
	inputColor: string;
	ringColor: string;
	brandIcon?: string;
}

// Simple dapp configuration interface
export interface DappConfig {
	dappId: string;
	name: string;
	applicationUrl: string;
	allowedRedirectUrls: string[];
	authMethods: AuthMethod[];
	theme?: Partial<ThemeConfig>;
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
			backgroundColor: '#ffffff',
			particleColor: '#000000',
			foregroundColor: '#020817',
			cardColor: '#ffffff',
			cardForeground: '#020817',
			popoverColor: '#ffffff',
			popoverForeground: '#020817',
			primaryForeground: '#ffffff',
			secondaryColor: '#f1f5f9',
			secondaryForeground: '#020817',
			mutedColor: '#f1f5f9',
			mutedForeground: '#64748b',
			accentColor: '#f1f5f9',
			accentForeground: '#020817',
			borderColor: '#e2e8f0',
			inputColor: 'rgba(0, 0, 0, 0.1)',
			ringColor: 'rgba(2, 8, 23, 0.5)',
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
			primaryColor: '#FF5F1F',
			backgroundColor: '#1A0B2E',
			particleColor: '#ffffff',
			foregroundColor: '#ffffff',
			cardColor: '#2D1B4E',
			cardForeground: '#ffffff',
			popoverColor: '#2D1B4E',
			popoverForeground: '#ffffff',
			primaryForeground: '#ffffff',
			secondaryColor: '#3B2064',
			secondaryForeground: '#ffffff',
			mutedColor: '#2D1B4E',
			mutedForeground: '#ffffff',
			accentColor: '#FF5F1F',
			accentForeground: '#ffffff',
			borderColor: '#df7c41',
			inputColor: 'rgba(255, 255, 255, 0.1)',
			ringColor: '#FF5F1F',
			brandIcon: "/logos/bon-light.png"
		}
	},
};

// Simple functions to access dapp configs
export const getDapp = (dappId: string) => dappConfigs[ dappId ];
export const validateRedirectUrl = (dappId: string, redirectUrl: string) =>
	dappConfigs[ dappId ]?.allowedRedirectUrls.includes(redirectUrl) ?? false; 