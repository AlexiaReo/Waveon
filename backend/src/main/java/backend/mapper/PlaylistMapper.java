package backend.mapper;

import backend.dto.PlaylistDTO;
import backend.dto.UserDTO;
import backend.model.Playlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

// CHANGED: Added SongMapper to uses
@Mapper(componentModel = "spring", uses = {SongMapper.class})
public interface PlaylistMapper {
    @Mapping(source = "user", target = "user_id")
    PlaylistDTO toDto(Playlist playlist);

    Playlist toEntity(PlaylistDTO dto);

    default UserDTO mapUser(backend.model.User user) {
        if (user == null) return null;
        return new UserDTO(user.getId(), user.getUsername());
    }
}