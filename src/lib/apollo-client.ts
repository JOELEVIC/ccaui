import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const defaultUri =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://blacksilvergroups.xyz/api/graphql"
    : "http://localhost:3000/api/graphql";
const uri = process.env.NEXT_PUBLIC_GRAPHQL_URI ?? defaultUri;

const httpLink = createHttpLink({ uri });

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  const token = localStorage.getItem("cca_token");
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = onError(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      const code = (err as { extensions?: { code?: string } }).extensions?.code;
      if (code === "UNAUTHENTICATED" && typeof window !== "undefined") {
        localStorage.removeItem("cca_token");
        window.location.href = "/login";
      }
    }
  } else if (typeof window !== "undefined") {
    console.error("[Apollo] Error", error);
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          me: { merge: true },
          users: { merge: false },
          liveGames: { merge: false },
          tournaments: { merge: false },
          schools: { merge: false },
          puzzles: { merge: false },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { errorPolicy: "all" },
    query: { errorPolicy: "all" },
    mutate: { errorPolicy: "all" },
  },
});
