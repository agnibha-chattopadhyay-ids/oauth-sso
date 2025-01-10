import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

export const GOOGLE_AUTH_URL = gql`
  query GetGoogleAuthUrl {
    googleAuthUrl
  }
`;

export const GOOGLE_AUTH_CALLBACK = gql`
  mutation GoogleAuthCallback($code: String!) {
    googleAuthCallback(code: $code) {
      token
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