package backend.dto;

import java.util.List;

public record UserLibraryDTO(
        List<PlaylistDTO> playlists,
        List<ArtistDTO> followedArtists
) {}