import { gql } from "@apollo/client";

export const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      id
      status
      timeControl
      white {
        id
        username
        rating
      }
      black {
        id
        username
        rating
      }
    }
  }
`;
