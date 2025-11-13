package backend.mapper;

import backend.dto.PlaylistDTO;
import backend.model.Playlist;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PlaylistMapper{
    // Entity → DTO
    PlaylistDTO toDTO(Playlist playlist);

    // DTO → Entity
    Playlist toEntity(PlaylistDTO dto);
}