import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createTokenStore } from '../auth/token';

export function createApolloClient(dappId = process.env.NEXT_PUBLIC_DAPP_ID || 'default') {
	const httpLink = createHttpLink({
		uri: process.env.NEXT_PUBLIC_GRAPHQL_URI,
		credentials: 'include',
	});

	const authLink = setContext((_, { headers }) => {
		const tokenStore = createTokenStore(dappId);
		const token = tokenStore.getToken();

		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : '',
				'x-dapp-id': dappId,
			},
		};
	});

	return new ApolloClient({
		link: from([ authLink, httpLink ]),
		cache: new InMemoryCache(),
	});
}

export const getApolloClient = (dappId: string) => createApolloClient(dappId); 