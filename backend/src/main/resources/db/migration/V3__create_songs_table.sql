CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    artist_id BIGINT NOT NULL,
    genre VARCHAR(50) NOT NULL,
    audio_url VARCHAR(255),

    CONSTRAINT fk_artist
        FOREIGN KEY (artist_id)
        REFERENCES artists(id)
);