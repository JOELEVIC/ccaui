import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        username
        role
        rating
        profile {
          id
          firstName
          lastName
          dateOfBirth
          country
          badges {
            id
            name
            description
            earnedAt
          }
        }
        school {
          id
          name
          region
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        username
        role
        rating
        profile {
          id
          firstName
          lastName
          dateOfBirth
          country
          badges {
            id
            name
            description
            earnedAt
          }
        }
        school {
          id
          name
          region
        }
        createdAt
        updatedAt
      }
    }
  }
`;
