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
        xp
        level
        puzzleStreakCount
        lastPuzzleSolvedAt
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
