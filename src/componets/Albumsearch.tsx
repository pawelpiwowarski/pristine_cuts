

import { useState, useRef, useEffect } from 'react';
import { api } from "~/utils/api";
import AlbumCutSearch  from './CutScreen';
import Image from 'next/image';
export interface Album {
    id: string
    album_type: string

    artists: {
        name: string
    }[]

    external_urls: {
        spotify: string
    }
    images: {
        url: string
    }[]
    name: string
    release_date: string
    
  // Add more album information as needed
}



const AlbumSearch = () => {


  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');


  const [error, setError] = useState<string>('');





  const searchAlbums = api.spotify.album.useMutation()


  const albumCutSearchRef = useRef<HTMLDivElement>(null);

  const handleSelectAlbum = (albumId: string) => {
    setSelectedAlbum(albumId);
  };

  useEffect(() => {
    // Scroll to the AlbumCutSearch div when selectedAlbum state is updated
    if (selectedAlbum) {
      albumCutSearchRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedAlbum]);
  const handleSearch =  (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    if (event.target.value.length > 0) {
      try {
        searchAlbums.mutateAsync(event.target.value).then((data) => {

          if (data === undefined) {
            setError('Somerthing went wrong try again later');
          }

          else if (data.error)
          {

            setError(data.error);

          } 
          else if (data.filtered_albums !== undefined) 
          {
          setSearchResults(data.filtered_albums);
          }
        }).catch((error) => {
          if (error instanceof Error) {

            setError(error.message);
          }
        })

    
   
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          setError(error.message);
        }

      }


 
    } else {
        setSearchResults([]);
        }
   

  };

  return (
    <div className="p-4">
    <h1 className="text-3xl font-bold mb-4 pt-4">What album are we looking for? 🤔</h1>
    <div className="flex gap-2 justify-center text-black">
      <input
        type="text"
        className="input input-lg input-bordered input-primary cess w-full max-w-xs"
        id="search"
        placeholder="Search for albums..."
        value={searchQuery}
        onChange={handleSearch}
      />
    </div>
    {searchResults.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"> {/* Added 'md:grid-cols-3' */}
        {searchResults.map((album, index) => (
          <div
            className="card w-96 glass cursor-pointer"
            key={index}
            onClick={() => handleSelectAlbum(album.id)}
          >
            <figure>
              { album.images[0]?.url !== undefined &&
              <Image src={album.images[0]?.url} alt="car!" width={500}	height={500}	/>
              }
            </figure>
            <div className="card-body flex flex-col items-center"> {/* Added 'flex' and 'items-center' */}
              <h2 className="card-title">{album.name}</h2>
              <h2 className="card-text">{album.release_date}</h2>
              {album.artists.map((artist, index) => (
                <p key={index} className="card-subtitle">
                  {artist.name}
                </p>
              ))}
              <div className="card-actions justify-end"></div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="mt-4 text-gray-600">No albums found.</p>
    )}

    {selectedAlbum && 
  <div ref={albumCutSearchRef}>
        <h1 className="text-2xl font-bold mb-4">What tracks do you want to take? 💭</h1>
    
    <AlbumCutSearch id={selectedAlbum} /> 
    
    
    </div>}

    {error && <p className="mt-4 text-red-600">{error}</p>}
  </div>
  

  
  );
};

export default AlbumSearch;
