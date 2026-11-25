import { valueFromASTUntyped } from "graphql";

function resolveArgs(argumentNodes, variables) {
  const args = {};
  for (const node of argumentNodes ?? []) {
    args[node.name.value] = valueFromASTUntyped(node.value, variables);
  }
  return Object.keys(args)
    .sort()
    .reduce((sorted, key) => ({ ...sorted, [key]: args[key] }), {});
}

// AniList's Page only takes page/perPage, so every list query (trending,
// popular, search, notifications, ...) would otherwise share one cache slot
// per page number and overwrite each other. Key each Page by its own args plus
// the args of the list fields inside it (e.g. media(type, sort)).
function pageKeyArgs(args, { field, variables }) {
  const key = { page: args?.page ?? null, perPage: args?.perPage ?? null };
  for (const selection of field?.selectionSet?.selections ?? []) {
    if (selection.kind !== "Field" || !selection.arguments?.length) continue;
    key[selection.name.value] = resolveArgs(selection.arguments, variables);
  }
  return JSON.stringify(key);
}

export const typePolicies = {
  Query: {
    fields: {
      Page: { keyArgs: pageKeyArgs },
    },
  },
  Page: { keyFields: false },
  // Unnormalized children of Media: merge so queries selecting different
  // subfields (e.g. coverImage { large } vs { large medium }) don't evict each other.
  MediaTitle: { merge: true },
  MediaCoverImage: { merge: true },
};
