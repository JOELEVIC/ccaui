import { gql } from "@apollo/client";

export const PLATFORM_METRICS = gql`
  query PlatformMetrics {
    platformMetrics {
      playersTotal
      playingNow
    }
  }
`;

export const PLAYERS_LEADERBOARD = gql`
  query PlayersLeaderboard($limit: Int) {
    playersLeaderboard(limit: $limit) {
      rank
      rating
      gamesPlayed
      ratingTrend
      user {
        id
        username
        rating
        profile {
          chessTitle
          avatarUrl
          country
        }
      }
    }
  }
`;

export const RATING_DISTRIBUTION = gql`
  query RatingDistribution {
    ratingDistribution {
      ratingMin
      ratingMax
      count
    }
  }
`;

export const SOONEST_TOURNAMENTS = gql`
  query SoonestTournaments($limit: Int) {
    soonestTournaments(limit: $limit) {
      id
      name
      startDate
      status
      chessVariant
      arenaTimeControl
      currentPlayers
      maxPlayers
      school {
        name
      }
    }
  }
`;

export const TOURNAMENT_SCHEDULE = gql`
  query TournamentSchedule(
    $rangeStart: DateTime!
    $rangeEnd: DateTime!
    $search: String
    $chessVariant: String
    $joinedOnly: Boolean
  ) {
    tournamentSchedule(
      rangeStart: $rangeStart
      rangeEnd: $rangeEnd
      search: $search
      chessVariant: $chessVariant
      joinedOnly: $joinedOnly
    ) {
      id
      name
      startDate
      endDate
      status
      chessVariant
      arenaTimeControl
      format
      maxPlayers
      durationMinutes
      cardColor
      isSponsored
      isRated
      iconType
      prizePoolJson
      currentPlayers
      school {
        id
        name
      }
      participants {
        user {
          id
        }
      }
    }
  }
`;

export const PUZZLE_DASHBOARD = gql`
  query PuzzleDashboard {
    puzzleDashboard {
      periodDays
      solvedCount
      performanceRating
      successRate
      radar {
        sacrifice
        endgame
        positional
        matingAttack
        tactics
        opening
      }
    }
  }
`;

export const LEARN_COURSES = gql`
  query LearnCourses {
    learnCourses {
      id
      slug
      title
      category
      sortOrder
      completed
      bookmarked
    }
  }
`;

export const ME_TOURNAMENT_STATS = gql`
  query MeTournamentStats {
    meTournamentStats {
      totalJoined
      breakdown {
        variant
        count
      }
    }
  }
`;

export const PROFILE_FULL = gql`
  query ProfileFull {
    me {
      id
      username
      rating
      createdAt
      totalGamesPlayed
      profile {
        firstName
        lastName
        country
        chessTitle
        avatarUrl
        followerCount
        friendCount
        ratingTrend
      }
      variantRatings {
        variant
        rating
        ratingDelta
        gamesPlayed
      }
    }
  }
`;

export const GAME_WITH_ANALYSIS = gql`
  query GameWithAnalysis($id: ID!) {
    game(id: $id) {
      id
      moves
      status
      result
      timeControl
      analysisJson
      white {
        id
        username
        rating
        profile {
          avatarUrl
        }
      }
      black {
        id
        username
        rating
        profile {
          avatarUrl
        }
      }
    }
  }
`;
