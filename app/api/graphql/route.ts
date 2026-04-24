import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { typeDefs } from "@/graphql/typeDefs";
import { resolvers } from "@/graphql/resolvers";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please add JWT_SECRET to .env.local");
}

type JwtUser = {
  id: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
};

type GraphQLContext = {
  user: JwtUser | null;
};

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

const apolloHandler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  {
    context: async (req) => {
      const authHeader = req.headers.get("authorization");

      let user: JwtUser | null = null;

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        try {
          user = jwt.verify(token, JWT_SECRET) as JwtUser;
        } catch {
          user = null;
        }
      }

      return { user };
    },
  }
);

export async function GET(request: NextRequest): Promise<Response> {
  return apolloHandler(request) as Promise<Response>;
}

export async function POST(request: NextRequest): Promise<Response> {
  return apolloHandler(request) as Promise<Response>;
}