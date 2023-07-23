/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import querystring from 'querystring';

import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';
import { TRPCError } from "@trpc/server";
/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  req: NextApiRequest | null;
  res: NextApiResponse | null;
  accessToken: string | null;
  userid: string | null;
  email: string | null;
  display_name: string | null;
  image: string | null;


}


/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {
    req: _opts.req,
    res: _opts.res,
    accessToken: _opts.accessToken,
    userid: _opts.userid,
    email: _opts.email,
    display_name: _opts.display_name,
    image: _opts.image,




  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (_opts: CreateNextContextOptions) => {

  const { req, res } = _opts;
  return createInnerTRPCContext({
    req,
    res,
    accessToken: null,
    userid: null,
    email: null,
    display_name: null,
    image: null,

  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;


const isAuthorized = t.middleware(async (opts) => {
  const dataacc = opts?.ctx?.req?.cookies?.dataacc;
  const dataref = opts?.ctx?.req?.cookies?.dataref;


  if (!dataref) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  try {
    if (dataacc) {
      const {access_token}  = jwt.verify(dataacc, process.env.JWT_SECRET!) as { access_token: string };
      const spotify_user_response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${access_token}` } 
  });

  const spotify_user_json = await spotify_user_response.json() as {email: string, id: string, display_name: string, images: {url: string}[]};


      return opts.next({
        ctx: {
          ...opts.ctx,
          accessToken: access_token,
          userid: spotify_user_json.id,
          email: spotify_user_json.email,
          display_name: spotify_user_json.display_name,
          image: spotify_user_json.images?.[1]?.url ?? process.env.DEFAULT_PIC

        },
      });
    } else  {
      const {refresh_token}  = jwt.verify(dataref, process.env.JWT_SECRET!) as { refresh_token: string };

      console.log('requesting new access token')

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'Authorization': 'Basic ' + Buffer.from(process.env.VITE_SPOTIFY_CLIENT_ID + ':' + process.env.VITE_SPOTIFY_CLIENT_SECRET).toString('base64'),
        },
        body: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token,
        }),
      });




      const { access_token: newAccessToken, expires_in } = await response.json() as { access_token: string, expires_in: number };
      const new_expires_in = new Date(Date.now() + expires_in * 1000);

      const spotify_user_response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${newAccessToken}` }
  });

    const spotify_user_json = await spotify_user_response.json() as {email: string, id: string, display_name: string, images: {url: string}[]};

      
      opts.ctx.res?.setHeader('Set-Cookie', `dataacc=${jwt.sign({ access_token: newAccessToken }, process.env.JWT_SECRET!, { expiresIn: '1h' })};HttpOnly; Secure; SameSite=None; expires=' + ${new_expires_in.toString()};path=/api`);

      return opts.next({
        ctx: {
          ...opts.ctx,
          accessToken: newAccessToken,
          userid: spotify_user_json.id,
          email: spotify_user_json.email,
          display_name: spotify_user_json.display_name,
          image: spotify_user_json.images?.[1]?.url ?? process.env.DEFAULT_PIC
          
        },
      });
    }

  } catch (err) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
});



export const protectedProcedure = t.procedure.use(isAuthorized);
