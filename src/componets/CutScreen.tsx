import React, { useState, useEffect } from 'react';
import { api } from "~/utils/api";
import Image from 'next/image';
interface Props {
  id: string
}

interface AlbumData {
  spotify_album_json: {

  
    name: string;
    images: {
      url: string;
    }[];
    tracks: {
      items: {

        artists: {
          name: string;
        }[];
        name: string;
        id: string;
        external_urls: {
          spotify: string;
        };
        uri: string;
      }[];
    };
  };
}
const AlbumCutSearch = ({ id }: Props) => {


  const [data, setData] = useState<AlbumData | null | undefined>(null);
  const [error, setError] = useState<string>('');

  const mutationCut = api.spotify.cut.useMutation();
  
  


  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const albumData = await mutationCut.mutateAsync(id);
        if (albumData === undefined) {
          setError('Something went wrong');

        }

        else if (albumData.error) {
          setError(albumData.error);
        }
        
        else if (albumData.spotify_album_json !== undefined){
          setData(albumData);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      }
    }

    fetchAlbum().catch((error) => {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
    )

  }, [id]);

  const [totalTracks, setTotalTracks] = useState(0);

  useEffect(() => {
    setTotalTracks(data?.spotify_album_json.tracks.items.length ?? 0);
    setSelectedTracks(Array(data?.spotify_album_json.tracks.items.length ?? 0).fill(''));
  }, [data]);


  




  const [selectedTracks, setSelectedTracks] = useState<string[]>(Array(totalTracks).fill(''));

  const [isPublic, setIsPublic] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState<string>('');

  const playlistCreationMutation = api.spotify.playlist.useMutation();

  const handleTrackSelection = (index: number, trackId: string) => {
    setSelectedTracks((prevSelected) => {
      const updatedSelection = [...prevSelected];
      updatedSelection[index] = prevSelected[index] === trackId ? '' : trackId;
      return updatedSelection;
    });
  };

  const handleSelectAll = () => {
    setSelectedTracks((prevSelected) => prevSelected.map((trackId, index) => allTracksSelected ? '' : data?.spotify_album_json.tracks.items[index]?.uri ?? ''));
  };

  const allTracksSelected = selectedTracks.every((trackId) => !!trackId);
  const selectedTrackCount = selectedTracks.filter((trackId) => !!trackId).length;
  const isCreatePlaylistEnabled = selectedTrackCount > 0;

  const handleCreatePlaylist =  () => {
    // Logic to create a playlist with the selected tracks
    // Replace this with your actual playlist creation code

    const filtered = selectedTracks.filter((track)=> track !== undefined && track !== '');



    playlistCreationMutation.mutateAsync({
      name: data?.spotify_album_json.name ?? '',
      uris: filtered,
      public: isPublic
    }).then((data) => {
      console.log(data);

      if (data == undefined) {
        setError('Something went wrong');
        return;
      }
    

      setPlaylistUrl(data.playlist_url);
    }
    ).catch((error) => {
      console.log(error);
    }
    )
  };

  return (
    <div>
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  onChange={handleSelectAll}
                  checked={allTracksSelected}
                />

                <span className="ml-2 mb-4">
                  {allTracksSelected ? 'Unselect All' : 'Select All'}
                </span>
                
              </label>
            </th>
            <th>Name</th>
            <th>Artists </th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.spotify_album_json.tracks.items.map((track, index) => (
            <tr key={index}>
              <td>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    onChange={() => handleTrackSelection(index, track.uri)}
                    checked={selectedTracks[index] !== ''}
                  />
                </label>
              </td>
              <td>
                <div className="flex items-center space-x-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      { data?.spotify_album_json.images[0] &&
                      <Image
                        src={data?.spotify_album_json.images[0].url}
                        alt="Avatar Tailwind CSS Component"
                        height={50}
                        width={50}
                      />
                      }
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{track.name}</div>
  
                  </div>
                </div>
              </td>
                      {
                        track.artists.map((artist, index) => (
                          <div key={index}>
                            {artist.name}
                          </div>
                        ))

                      }

              <td>
                <a href={track.external_urls.spotify} target="_blank" rel="noreferrer">
                <button className="btn btn-ghost btn-xs">Listen on Spotify</button>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
        {/* foot */}
        <tfoot>
          <tr>
        
        
          </tr>
        </tfoot>
      </table>
    </div>

    <div className="mt-4 items-center flex space-x-2 justify-center">
   
        <span className="text-sm">{isPublic ? 'Public Playlist' : 'Private Playlist'}</span>
        <input
          type="checkbox"
          disabled={!isCreatePlaylistEnabled}
          className="toggle toggle-success"
          checked={isPublic}
          onChange={() => setIsPublic((prevIsPublic) => !prevIsPublic)}
        />
             <button
          onClick={handleCreatePlaylist}
          disabled={!isCreatePlaylistEnabled}
          className={`border rounded px-4 py-2 ${
            isCreatePlaylistEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
          } `}
        >
          Create Playlist
        </button>
      </div>

      {playlistUrl && (

      <div className="mt-4">
        <a href={playlistUrl} target="_blank" rel="noreferrer">
          <button className="btn btn-accent">
          View Playlist

  
        </button>
        </a>
        <br />

        <button className="btn btn-primary mt-4" onClick={()=> {
          // scroll to top
          window.scrollTo(0, 0);
          window.location.reload();
        }}> 

          Try Again?
        </button>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}

    </div>
  );
};

export default AlbumCutSearch;
