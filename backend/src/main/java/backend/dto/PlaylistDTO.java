package backend.dto;

import backend.model.Privacy;
import java.util.List;

public record PlaylistDTO(
        Long id,
        String title,
        UserDTO user_id,
        String description,
        Privacy visibility,
        String imageUrl,
        List<SongDTO> songs // ADDED: List of songs
) { }