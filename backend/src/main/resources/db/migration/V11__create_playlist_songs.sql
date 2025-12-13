CREATE TABLE playlist_songs (
    playlist_id BIGINT NOT NULL,
    song_id BIGINT NOT NULL,
    PRIMARY KEY (playlist_id, song_id),
    CONSTRAINT fk_playlist FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
    CONSTRAINT fk_song FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE
);