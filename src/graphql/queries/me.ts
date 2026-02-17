import { gql } from "@apollo/client";

export const ME = gql`
  query Me {
    me {
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
`;
