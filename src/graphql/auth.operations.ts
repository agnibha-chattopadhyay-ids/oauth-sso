import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql(`
	mutation AuthUser($email: String!, $password: String!) {
		loginUser(input: { email: $email, password: $password }) {
			userId
			userRoles {
				title
				type
			}
			token
			firstName
			lastName
			status
      wallet{
        ethAddress
        eosAddress
        solAddress
        didAddress
      }
		}
	}
`);

export const REGISTER_MUTATION = gql(`
  mutation Register($input: CreateUserInput!) {
    register(createUserInput: $input) {
      userId
      token
      firstName
      lastName
      status
    }
  }
`);

export const GOOGLE_AUTH_URL = gql`
  query GetGoogleAuthUrl($dappId: String!, $redirectUri: String) {
    googleAuthUrl(dappId: $dappId, redirectUri: $redirectUri)
  }
`;

export const GOOGLE_AUTH_CALLBACK = gql`
  mutation GoogleAuthCallback($code: String!, $dappId: String!) {
    googleAuthCallback(code: $code, dappId: $dappId) {
      token
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const GET_USER = gql`
  query GetUser {
    me {
      id
      email
      name
    }
  }
`; 