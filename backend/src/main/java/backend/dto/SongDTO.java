package backend.dto;

import backend.model.Genre;

public record SongDTO(Long id, String name, ArtistDTO artist, Genre genre) {
}
