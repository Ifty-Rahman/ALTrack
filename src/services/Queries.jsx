import { gql } from "@apollo/client";

export const GET_CURRENT_USER = gql`
  query {
    Viewer {
      id
      name
      avatar {
        large
      }
      bannerImage
    }
  }
`;

export const GET_POPULAR_ANIMANGA = gql`
  query ($page: Int, $perPage: Int, $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: $type, sort: POPULARITY_DESC) {
        id
        type
        title {
          english
          romaji
        }
        coverImage {
          large
        }
      }
    }
  }
`;

export const GET_DISCOVER_PAGE = gql`
  query DiscoverPage(
    $type: MediaType
    $perPage: Int
    $season: MediaSeason
    $seasonYear: Int
    $nextSeason: MediaSeason
    $nextYear: Int
  ) {
    trending: Page(page: 1, perPage: $perPage) {
      media(type: $type, sort: TRENDING_DESC) {
        id
        type
        title {
          english
          romaji
        }
        coverImage {
          large
        }
      }
    }
    popular: Page(page: 1, perPage: $perPage) {
      media(type: $type, sort: POPULARITY_DESC) {
        id
        type
        title {
          english
          romaji
        }
        coverImage {
          large
        }
      }
    }
    seasonal: Page(page: 1, perPage: $perPage) {
      media(
        type: ANIME
        sort: POPULARITY_DESC
        season: $season
        seasonYear: $seasonYear
      ) {
        id
        type
        title {
          english
          romaji
        }
        coverImage {
          large
        }
      }
    }
    upcoming: Page(page: 1, perPage: $perPage) {
      media(
        type: ANIME
        sort: POPULARITY_DESC
        season: $nextSeason
        seasonYear: $nextYear
      ) {
        id
        type
        title {
          english
          romaji
        }
        coverImage {
          large
        }
      }
    }
    manhwa: Page(page: 1, perPage: $perPage) {
      media(type: MANGA, countryOfOrigin: KR, sort: POPULARITY_DESC) {
        id
        type
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        popularity
        status
        genres
      }
    }
  }
`;

export const GET_TRENDING_ANIMANGA = gql`
  query ($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: $type, sort: $sort) {
        id
        type
        title {
          english
          romaji
        }
        coverImage {
          large
        }
      }
    }
  }
`;

export const GET_POPULAR_SEASONAL_ANIME = gql`
  query (
    $page: Int
    $perPage: Int
    $sort: [MediaSort]
    $season: MediaSeason
    $seasonYear: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        type: ANIME
        sort: $sort
        season: $season
        seasonYear: $seasonYear
      ) {
        id
        type
        title {
          english
          romaji
        }
        coverImage {
          large
        }
      }
    }
  }
`;

export const GET_UPCOMING_SEASONAL_ANIME = gql`
  query (
    $page: Int
    $perPage: Int
    $sort: [MediaSort]
    $season: MediaSeason
    $seasonYear: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        type: ANIME
        sort: $sort
        season: $season
        seasonYear: $seasonYear
      ) {
        id
        type
        title {
          english
          romaji
        }
        coverImage {
          large
        }
      }
    }
  }
`;

export const GET_POPULAR_MANHWA = gql`
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(type: MANGA, countryOfOrigin: KR, sort: POPULARITY_DESC) {
        id
        type
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        popularity
        status
        genres
      }
    }
  }
`;

export const GET_USER_MEDIA_LIST = gql`
  query GetUserAnimeList($userName: String) {
    Viewer {
      id
      name
    }
    anime: MediaListCollection(
      userName: $userName
      type: ANIME
      sort: UPDATED_TIME_DESC
    ) {
      lists {
        name
        entries {
          media {
            id
            type
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            episodes
          }
          score
          progress
        }
      }
    }
    manga: MediaListCollection(
      userName: $userName
      type: MANGA
      sort: UPDATED_TIME_DESC
    ) {
      lists {
        name
        entries {
          media {
            id
            type
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            chapters
            volumes
          }
          score
          progress
          progressVolumes
        }
      }
    }
    User(name: $userName) {
      id
      mediaListOptions {
        scoreFormat
      }
    }
  }
`;

export const GET_USER_STATISTICS = gql`
  query Query {
    Viewer {
      id
      statistics {
        anime {
          count
          minutesWatched
          episodesWatched
          meanScore
          genres {
            count
            genre
          }
        }
        manga {
          count
          chaptersRead
          meanScore
          volumesRead
          genres {
            count
            genre
          }
        }
      }
      favourites {
        anime {
          nodes {
            id
            type
            title {
              romaji
              english
              userPreferred
            }
            coverImage {
              large
              medium
            }
          }
        }
        manga {
          nodes {
            id
            type
            title {
              romaji
              english
              userPreferred
            }
            coverImage {
              large
              medium
            }
          }
        }
        characters {
          nodes {
            id
            name {
              full
            }
            image {
              large
              medium
            }
          }
        }
        staff {
          nodes {
            id
            name {
              full
            }
            image {
              large
              medium
            }
          }
        }
        studios {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_CURRENT_MEDIA = gql`
  query GetCurrentMedia($userName: String, $type: MediaType) {
    MediaListCollection(
      userName: $userName
      type: $type
      status: CURRENT
      sort: UPDATED_TIME_DESC
    ) {
      lists {
        entries {
          id
          mediaId
          status
          score
          progress
          progressVolumes
          media {
            id
            type
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            episodes
            nextAiringEpisode {
              episode
            }
            chapters
            volumes
          }
        }
      }
    }
    User(name: $userName) {
      id
      mediaListOptions {
        scoreFormat
      }
    }
  }
`;

export const GET_USER_MEDIA_STATUS = gql`
  query GetUserMediaStatus($userId: Int, $mediaId: Int) {
    MediaList(userId: $userId, mediaId: $mediaId) {
      id
      status
    }
  }
`;

export const GET_SEARCH_DATA = gql`
  query ($search: String, $page: Int, $perPage: Int, $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: $type) {
        id
        type
        title {
          romaji
          english
        }
        coverImage {
          large
        }
      }
    }
  }
`;

export const GET_MEDIA_DETAILS = gql`
  query GetMediaDetails($id: Int!, $type: MediaType!) {
    Media(id: $id, type: $type) {
      id
      type
      title {
        romaji
        english
        native
        userPreferred
      }
      coverImage {
        large
        medium
      }
      bannerImage
      description
      status
      episodes
      chapters
      volumes
      duration
      genres
      averageScore
      meanScore
      popularity
      favourites
      season
      seasonYear
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      isAdult
      format
      source
      nextAiringEpisode {
        airingAt
        episode
        timeUntilAiring
      }
      characters(sort: [ROLE, RELEVANCE]) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      staff(sort: [RELEVANCE, ROLE]) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      studios(isMain: true) {
        edges {
          node {
            id
            name
          }
        }
      }
      externalLinks {
        site
        url
      }
      rankings {
        rank
        type
        allTime
        context
      }
      recommendations {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
              english
              userPreferred
            }
            coverImage {
              medium
              large
            }
          }
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            type
            title {
              romaji
              english
              userPreferred
            }
            coverImage {
              medium
              large
            }
          }
        }
      }
      streamingEpisodes {
        title
        thumbnail
        url
      }
    }
  }
`;

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
  query {
    Viewer {
      unreadNotificationCount
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query (
    $page: Int
    $perPage: Int
    $type_in: [NotificationType]
    $resetNotificationCount: Boolean
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      notifications(
        type_in: $type_in
        resetNotificationCount: $resetNotificationCount
      ) {
        __typename
        ... on AiringNotification {
          id
          type
          episode
          contexts
          createdAt
          media {
            id
            type
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
        ... on FollowingNotification {
          id
          type
          context
          createdAt
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ActivityMessageNotification {
          id
          type
          context
          createdAt
          message {
            id
            message
          }
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ActivityMentionNotification {
          id
          type
          context
          createdAt
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ActivityReplyNotification {
          id
          type
          context
          createdAt
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ActivityReplySubscribedNotification {
          id
          type
          context
          createdAt
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ActivityLikeNotification {
          id
          type
          context
          createdAt
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ActivityReplyLikeNotification {
          id
          type
          context
          createdAt
          activityId
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ThreadCommentMentionNotification {
          id
          type
          context
          createdAt
          thread {
            id
            title
          }
          comment {
            id
          }
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ThreadCommentReplyNotification {
          id
          type
          context
          createdAt
          thread {
            id
            title
          }
          comment {
            id
          }
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ThreadCommentSubscribedNotification {
          id
          type
          context
          createdAt
          thread {
            id
            title
          }
          comment {
            id
          }
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ThreadCommentLikeNotification {
          id
          type
          context
          createdAt
          thread {
            id
            title
          }
          comment {
            id
          }
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on ThreadLikeNotification {
          id
          type
          context
          createdAt
          thread {
            id
            title
          }
          user {
            id
            name
            avatar {
              large
            }
          }
        }
        ... on RelatedMediaAdditionNotification {
          id
          type
          context
          createdAt
          media {
            id
            type
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
        ... on MediaDataChangeNotification {
          id
          type
          context
          reason
          createdAt
          media {
            id
            type
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
        ... on MediaMergeNotification {
          id
          type
          context
          reason
          createdAt
          media {
            id
            type
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
        ... on MediaDeletionNotification {
          id
          type
          context
          reason
          createdAt
          deletedMediaTitle
        }
        ... on MediaSubmissionUpdateNotification {
          id
          type
          contexts
          status
          createdAt
          media {
            id
            type
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
          submittedTitle
        }
        ... on StaffSubmissionUpdateNotification {
          id
          type
          contexts
          status
          createdAt
          staff {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
        ... on CharacterSubmissionUpdateNotification {
          id
          type
          contexts
          status
          createdAt
          character {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
    }
  }
`;
