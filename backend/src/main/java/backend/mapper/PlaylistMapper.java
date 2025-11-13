package backend.mapper;

import org.mapstruct.Mapper;
import backend.model.Playlist;
import backend.dto.PlaylistDTO;

@Mapper(componentModel = "spring")
public interface PlaylistMapper {
    PlaylistDTO toDto(Playlist playlist);
    Playlist toEntity(PlaylistDTO dto);
}