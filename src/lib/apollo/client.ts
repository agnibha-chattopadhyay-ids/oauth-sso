import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createTokenStore } from '../auth/token';
import { clientRegistry } from '../auth/clients';

export function createApolloClient(clientId = process.env.NEXT_PUBLIC_CLIENT_ID || 'default') {
	const tokenStore = createTokenStore(clientId);

	const httpLink = createHttpLink({
		uri: process.env.NEXT_PUBLIC_GRAPHQL_URI,
		credentials: 'include',
	});

	const authLink = setContext((_, { headers }) => {
		const token = tokenStore.getToken();

		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : '',
				'x-client-id': clientId,
			},
		};
	});

	const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
		if (graphQLErrors) {
			for (const err of graphQLErrors) {
				if (err.extensions?.code === 'UNAUTHENTICATED') {
					const refreshToken = tokenStore.getRefreshToken();

					if (refreshToken) {
						// Implement token refresh logic here
						// For now, just remove the tokens and let the auth flow handle reauth
						tokenStore.removeToken();
						return forward(operation);
					}
				}
			}
		}

		if (networkError) {
			console.error(`[Network error]: ${networkError}`);
		}
	});

	return new ApolloClient({
		link: from([ errorLink, authLink, httpLink ]),
		cache: new InMemoryCache(),
		defaultOptions: {
			watchQuery: {
				fetchPolicy: 'cache-and-network',
			},
		},
	});
}

// Create a singleton instance for the default client
let apolloClient: ApolloClient<any> | null = null;

export function getApolloClient(clientId: string) {
	if (!apolloClient) {
		apolloClient = createApolloClient(clientId);
	}
	return apolloClient;
} 