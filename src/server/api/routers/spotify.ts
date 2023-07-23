import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import querystring from 'querystring';
import { TRPCError } from "@trpc/server";
import {z} from 'zod';
import type { Album } from "~/componets/Albumsearch";



export const spotifyRouter = createTRPCRouter({


  playlist: protectedProcedure.input(z.object(
    {
      name: z.string(),
      uris: z.array(z.string()),
      public: z.boolean()
    }
  )).mutation( async ({ctx, input}) => {

    if (!input) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    if (!ctx.userid) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const { accessToken } = ctx;



    try {



    const playlist_creation_response = await fetch(`https://api.spotify.com/v1/users/${encodeURIComponent(ctx.userid)}/playlists`, {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json'
    }, body:  JSON.stringify({
        name: input.name + " - Pristine Cuts",
        public: input.public,
        description: "Created with the Pristine Cuts App. Check it out at https://pristine-cuts.vercel.app/"
      })


    })


    const {id, external_urls: {spotify}} = await playlist_creation_response.json() as {id: string, external_urls: {spotify: string}};
    

    await fetch(`https://api.spotify.com/v1/playlists/${encodeURIComponent(id)}/tracks`, {
      method: "POST", headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({
        uris: input.uris
      })
    })


    return {playlist_url: spotify}


  }

  catch (error) {
    console.log(error);
  }






    

  }),



  cut: protectedProcedure.input(z.string()).mutation(async ({ctx, input}) => {

    
    if (!input) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    const { accessToken } = ctx;

    try {

    
    const spotify_album_response = await fetch(`https://api.spotify.com/v1/albums/${encodeURIComponent(input)}`, {
      method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
      
      })

    const spotify_album_json = await spotify_album_response.json() as {   images:{url: string}[],  name: string, tracks: {items: { artists: {name: string}[], name: string, id: string, external_urls: {spotify: string}, uri: string}[]}};
    



    return {spotify_album_json}

    }
    catch (error) {
      if (error instanceof Error) {
        return {error: error.message}
      }
    }
  }),



  

  


  album: protectedProcedure.input(z.string()).mutation(async ({ctx, input}) => {

    if (!input) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });

    }




    const { accessToken } = ctx;


    console.log(accessToken);
 

   
    try {

    const spotify_album_response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(input)}&type=album&limit=10`, {
      method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
      
      })






 
  

  const spotify_album_json = await spotify_album_response.json() as {albums: {items: Album[]}};


  // filter out singles that is where album_type is single
  const filtered_albums = spotify_album_json.albums.items.filter((album) => album.album_type !== "single");
  


  return {filtered_albums}

    }

    catch (error) {
      if (error instanceof Error) {

        console.log(error);

        return {error: error.message}
      }
    }


  
  }), 


  logout: publicProcedure.mutation(({ctx}) => {

    // check wheter there are any cookies
    if (ctx.req?.cookies) {


      

      
      ctx.res?.setHeader('Set-Cookie', [
        `dataref=;path=/api;HttpOnly;Secure;SameSite=None;expires=Thu, 01 Jan 1970 00:00:00 GMT`,
        `dataacc=;path=/api;HttpOnly;Secure;SameSite=None;expires=Thu, 01 Jan 1970 00:00:00 GMT`
      ]);
      
    


    
    
    }

    else {
      throw new TRPCError({ code: 'UNAUTHORIZED' });

    }

  }),

 

  secret: protectedProcedure.query( ({ctx}) => {

    if (!ctx.userid) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
  
  

    return {
    
      email: ctx.email,
      id: ctx.userid,
      display_name: ctx.display_name,
      image: ctx.image

      
    };
 
    
      
    })
  ,
  url: publicProcedure.query(() => {
    const scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';
    return {
      url: 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: process.env.VITE_SPOTIFY_CLIENT_ID,
          scope: scope,
          redirect_uri: process.env.VITE_REDIRECT_URI,
          show_dialog: true
        })
    };

  



  
})});



