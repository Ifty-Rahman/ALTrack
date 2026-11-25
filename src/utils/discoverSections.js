import {
  GET_POPULAR_SEASONAL_ANIME,
  GET_UPCOMING_SEASONAL_ANIME,
  GET_POPULAR_ANIMANGA,
  GET_TRENDING_ANIMANGA,
  GET_POPULAR_MANHWA,
} from "../services/Queries.jsx";

const SEASON_ORDER = ["WINTER", "SPRING", "SUMMER", "FALL"];

export const MEDIA_TYPES = [
  { value: "ANIME", label: "Anime" },
  { value: "MANGA", label: "Manga" },
];

export function normalizeType(value) {
  return value === "MANGA" ? "MANGA" : "ANIME";
}

export function getSeasons(now = new Date()) {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  let season = "WINTER";
  if (month >= 3 && month <= 5) season = "SPRING";
  else if (month >= 6 && month <= 8) season = "SUMMER";
  else if (month >= 9 && month <= 11) season = "FALL";

  const nextSeason = SEASON_ORDER[(SEASON_ORDER.indexOf(season) + 1) % 4];
  const nextYear = season === "FALL" ? year + 1 : year;
  return { season, year, nextSeason, nextYear };
}

function formatSeason(season, year) {
  return `${season.charAt(0)}${season.slice(1).toLowerCase()} ${year}`;
}

// Order here is the order rows appear on Discover and tabs appear on Browse.
const SECTIONS = [
  {
    key: "trending",
    title: "Trending Now",
    types: ["ANIME", "MANGA"],
    dataKey: "trending",
  },
  {
    key: "seasonal",
    title: "Popular This Season",
    types: ["ANIME"],
    dataKey: "seasonal",
    subtitle: ({ season, year }) => formatSeason(season, year),
  },
  {
    key: "upcoming",
    title: "Upcoming Next Season",
    types: ["ANIME"],
    dataKey: "upcoming",
    subtitle: ({ nextSeason, nextYear }) => formatSeason(nextSeason, nextYear),
  },
  {
    key: "manhwa",
    title: "Popular Manhwa",
    types: ["MANGA"],
    dataKey: "manhwa",
  },
  {
    key: "popular",
    title: "All Time Popular",
    types: ["ANIME", "MANGA"],
    dataKey: "popular",
  },
];

export function getSectionsForType(type) {
  return SECTIONS.filter((section) => section.types.includes(type));
}

export function getSection(key, type) {
  const sections = getSectionsForType(type);
  return sections.find((section) => section.key === key) ?? sections[0];
}

export function getSectionSubtitle(section, seasons = getSeasons()) {
  return section.subtitle ? section.subtitle(seasons) : null;
}

export function getBrowseQuery(sectionKey, type, page, perPage) {
  const { season, year, nextSeason, nextYear } = getSeasons();
  switch (sectionKey) {
    case "popular":
      return {
        query: GET_POPULAR_ANIMANGA,
        variables: { page, perPage, type },
      };
    case "manhwa":
      return { query: GET_POPULAR_MANHWA, variables: { page, perPage } };
    case "seasonal":
      return {
        query: GET_POPULAR_SEASONAL_ANIME,
        variables: {
          page,
          perPage,
          sort: ["POPULARITY_DESC"],
          season,
          seasonYear: year,
        },
      };
    case "upcoming":
      return {
        query: GET_UPCOMING_SEASONAL_ANIME,
        variables: {
          page,
          perPage,
          sort: ["POPULARITY_DESC"],
          season: nextSeason,
          seasonYear: nextYear,
        },
      };
    default:
      return {
        query: GET_TRENDING_ANIMANGA,
        variables: { page, perPage, sort: ["TRENDING_DESC"], type },
      };
  }
}

export function getBrowseUrl(sectionKey, type, page = 1) {
  const params = new URLSearchParams({ section: sectionKey, type });
  if (page > 1) params.set("page", String(page));
  return `/Browse?${params}`;
}
