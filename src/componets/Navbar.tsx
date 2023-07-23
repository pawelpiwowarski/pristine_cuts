import React from "react";
import type { ReactNode } from "react";
import Head from 'next/head'
import { api } from "~/utils/api";
import Image from 'next/image';




interface NavbarProps {
  children: ReactNode
  userData: {
    email: string
    display_name: string
    image: string | undefined
    id: string
  } | undefined
}

const Navbar: React.FC<NavbarProps> = ({ children, userData }) => {
const deletecookies= api.spotify.logout.useMutation()



    const handleLogout = () => {

  
      deletecookies.mutate()
  
  
      window.location.href = "/thank_you"
  
    }

  return (
    <>
      <Head>
        <title>Pristine Cuts</title>
        <meta name="description" content="Get your favourite tracks from albums!" />
        <link rel="icon" href="/favicon.ico" />

        
      </Head>

      <div className="bg-gradient-to-b from-green-400 to-green-600">
        <div className="navbar ">
          <div className="flex-1">
            <a className=" text-4xl btn btn-ghost normal-case">Pristine Cuts App </a>
          </div>
          <div className="flex-none gap-2 pt-2 w-16 h-16">
            {userData &&
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-16 rounded-full ">
                    { userData.image !== undefined &&
                    <Image src={userData.image} alt="User Avatar" height={200} width={200}/>
}
                  </div>
                </label>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-64">
                  <li>
                    <div className="flex flex-col items-center">

                        <a href={`https://open.spotify.com/user/${userData.id}`} target="_blank">

                      {userData.display_name}

                      </a>
                    </div>

 
                  </li>
          

                  <li className="pt-2">

                  <button
  className="py-2 px-20 mt-4 rounded bg-red-500 text-white hover:bg-green-600 flex"
  onClick={handleLogout}
>
  Logout 
</button>
                  </li>
                </ul>
              </div>
            }
          </div>
        </div>

        {children}

        <footer className="flex items-center justify-center w-full h-24 border-t">

<p className="text-center">
  Built by {'Pawel Piwowarski'} using {' '}
  <a href="https://create.t3.gg/" target="_blank"  rel="noopener noreferrer">  

  T3 Stack

  </a>
  </p>





</footer>
      </div>
    </>
  )
}

export default Navbar;
