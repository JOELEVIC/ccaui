import { gql } from "@apollo/client";

export const PLACEMENT_STATUS = gql`
  query PlacementStatus {
    placementStatus {
      required
      completedAt
      activeRunId
    }
  }
`;

export const START_PLACEMENT = gql`
  mutation StartPlacement {
    startPlacement {
      id
      status
      startedAt
    }
  }
`;

export const SAVE_PLACEMENT_PROGRESS = gql`
  mutation SavePlacementProgress($runId: ID!, $games: [PlacementGameInput!]!) {
    savePlacementProgress(runId: $runId, games: $games) {
      id
      status
    }
  }
`;

export const SUBMIT_PLACEMENT = gql`
  mutation SubmitPlacement($runId: ID!, $games: [PlacementGameInput!]!) {
    submitPlacement(runId: $runId, games: $games) {
      newRating
      estimate {
        rating
        rd
        confidence
        resultRating
        moveRating
        acplRating
        accuracyRating
        weightedAcpl
        meanAccuracy
        totalUserMoves
        gamesScored
      }
    }
  }
`;
