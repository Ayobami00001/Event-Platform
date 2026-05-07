export async function graphqlRequest<T>({
  query,
  variables,
  token,
}: {
  query: string;
  variables?: Record<string, any>;
  token?: string;
}): Promise<T> {
  const authToken =
    token || (typeof window !== "undefined" && localStorage.getItem("token"));

  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: "no-store",
  });

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "Something went wrong");
  }

  return json.data;
}