// src/types/index.ts

export interface Artist {
    id: number;
    name: string;
    followers: number;
    imageUrl: string;
}

export interface Song {
    id: number;
    name: string;
    artist: Artist;
    genre: string;
    filepath: string;
    imageUrl: string;
    isLiked?: boolean;
}

export interface Playlist {
    id: number;
    title: string;
    imageUrl: string;
    description: string;
    user_id?: { id: number };// ADDED: Fixes the "Property description does not exist" error
    songs: Song[];       // ADDED: Required to list songs in the playlist page
}

export interface UserLibrary {
    playlists: Playlist[];
    followedArtists: Artist[];
}

export type PageContentProps = {
    songs: Song[];
    filteredSongs: Song[];
    handleSongSelect: (song: Song) => void;
    onArtistClick?: (id: number) => void;
};