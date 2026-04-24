import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import jwt from "jsonwebtoken";
import { typeDefs } from "@/graphql/typeDefs";
import { resolvers } from "@/graphql/resolvers";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please add JWT_SECRET to .env.local");
}

type JwtUser = {
  id: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
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
});

export { handler as GET, handler as POST };