import { gql } from "@apollo/client";

export const CREATE_TOURNAMENT = gql`
  mutation CreateTournament($input: CreateTournamentInput!) {
    createTournament(input: $input) {
      id
      name
      status
      startDate
      endDate
      school {
        id
        name
        region
      }
    }
  }
`;

export const JOIN_TOURNAMENT = gql`
  mutation JoinTournament($tournamentId: ID!) {
    joinTournament(tournamentId: $tournamentId) {
      id
      name
      status
      participants {
        id
        user {
          id
          username
        }
      }
    }
  }
`;

export const START_TOURNAMENT = gql`
  mutation StartTournament($tournamentId: ID!) {
    startTournament(tournamentId: $tournamentId) {
      id
      name
      status
    }
  }
`;

export const COMPLETE_TOURNAMENT = gql`
  mutation CompleteTournament($tournamentId: ID!) {
    completeTournament(tournamentId: $tournamentId) {
      id
      name
      status
    }
  }
`;
