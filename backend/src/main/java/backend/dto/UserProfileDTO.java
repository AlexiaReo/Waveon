package backend.dto;

import java.util.List;

public record UserProfileDTO(UserDTO user, boolean isOwner, List<PlaylistDTO> playlists) {
}

