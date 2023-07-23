
import { api } from "~/utils/api";
import AlbumSearch from "~/componets/Albumsearch";
import Navbar from "~/componets/Navbar";



export default function Home() {
  const { data } = api.spotify.url.useQuery();
  const { data: userData } = api.spotify.secret.useQuery();

 







  return (

    

      <Navbar userData={userData}>

{userData && (

<div className="text-white text-center pt-10"> {/* Added 'text-center' class to center the content */}


<AlbumSearch />


</div>


          )}
      <main className="flex min-h-screen flex-col items-center justify-center ">
        { data?.url && !userData && 
        <div className="text-white text-center pb-20 text-2xl  font-sans "> {/* Added 'text-center' class to center the content */}
        
        <a
            href={data.url}
            className="py-2 px-4 mt-4 rounded bg-green-500 text-white hover:bg-green-600"
          >
            Login to Spotify
          </a>

        </div>
          
          }


  
        <div className="container flex flex-col items-center justify-center gap-2  ">
        { !userData &&
     
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          
            <div
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
 
            >
              <h3 className="text-2xl font-bold">Purpose→</h3>
              <div className="text-lg">
                Get the best cuts of your favourite albums! Did you ever wanted to just listen to the best songs of an album? Well now you can!
              </div>
            </div>
            <div
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
 
            >
      
              <h3 className="text-2xl font-bold">How? →</h3>
              <div className="text-lg">
               Easy to use. Just login with your Spotify account and you are ready to go!
              </div>
        
              </div>
              
          </div>

        
        }
         
        </div>
      </main>

      </Navbar>

  );
}
