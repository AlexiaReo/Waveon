CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    followers BIGINT
);
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    artist_id BIGINT NOT NULL,
    genre VARCHAR(50) NOT NULL,

    CONSTRAINT fk_artist
        FOREIGN KEY (artist_id)
        REFERENCES artists(id)
);
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    description TEXT,
    visibility VARCHAR(50) NOT NULL,

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
         REFERENCES users(id)
);