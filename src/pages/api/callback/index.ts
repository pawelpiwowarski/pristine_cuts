
import { type NextApiRequest, type NextApiResponse } from "next";
import jwt from 'jsonwebtoken';
import querystring from 'querystring';



const CallbackHandler =  async (req: NextApiRequest, res: NextApiResponse) => {


    try {
    const {code} = req.query;
    if (!code) {
        res.status(400).json({ message: "You have to supply a code to this callback" });


    }


        const spotify_response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',

            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                'Authorization': 'Basic ' + Buffer.from(process.env.VITE_SPOTIFY_CLIENT_ID + ':' + process.env.VITE_SPOTIFY_CLIENT_SECRET).toString('base64')
            },
            body: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.VITE_REDIRECT_URI,
            }),



        });



        const {access_token, refresh_token, expires_in} = await spotify_response.json() as {access_token: string, refresh_token: string, expires_in: number};
        

        // update session with spotify tokens
        const new_expires_in = new Date(Date.now() + expires_in * 1000);

        // get date in 10 years
        const ten_years = new Date();
        ten_years.setFullYear(ten_years.getFullYear() + 10);

        // get email from spotify

        

        
        const signed_access_token = jwt.sign({ access_token }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        const signed_refresh_token = jwt.sign({ refresh_token }, process.env.JWT_SECRET!);



        res.setHeader('Set-Cookie', [
            'dataacc=' + signed_access_token + ';HttpOnly;Secure;path=/api;SameSite=None; expires=' + new_expires_in.toString(),
            'dataref=' + signed_refresh_token + ';HttpOnly;Secure;path=/api;SameSite=None;  expires=' + ten_years.toString(),

        ]);
      

            

        res.status(200).redirect(process.env.VITE_REDIRECT_TARGET!);

      

    }
    catch (error) {

        res.status(500).json({ message: "Internal server error" });
        }

    }



    


export default CallbackHandler;