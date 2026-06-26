import { gql } from "@apollo/client";

export const MY_CHALLENGES = gql`
  query MyChallenges {
    myChallenges {
      id
      creatorColor
      timeControl
      rated
      status
      expiresAt
      createdAt
      creator {
        id
        username
        rating
      }
      opponent {
        id
        username
        rating
      }
    }
  }
`;

export const CHALLENGE = gql`
  query Challenge($id: ID!) {
    challenge(id: $id) {
      id
      creatorColor
      timeControl
      rated
      status
      expiresAt
      creator {
        id
        username
        rating
      }
      opponent {
        id
        username
        rating
      }
      game {
        id
      }
    }
  }
`;

export const CREATE_CHALLENGE = gql`
  mutation CreateChallenge($input: CreateChallengeInput!) {
    createChallenge(input: $input) {
      id
      status
      creatorColor
      timeControl
      rated
      opponent {
        id
        username
      }
      game {
        id
      }
    }
  }
`;

export const ACCEPT_CHALLENGE = gql`
  mutation AcceptChallenge($challengeId: ID!) {
    acceptChallenge(challengeId: $challengeId) {
      id
    }
  }
`;

export const DECLINE_CHALLENGE = gql`
  mutation DeclineChallenge($challengeId: ID!) {
    declineChallenge(challengeId: $challengeId) {
      id
      status
    }
  }
`;

export const CANCEL_CHALLENGE = gql`
  mutation CancelChallenge($challengeId: ID!) {
    cancelChallenge(challengeId: $challengeId) {
      id
      status
    }
  }
`;
