package backend.mapper;

import backend.dto.PlaylistDTO;
import backend.dto.UserDTO;
import org.mapstruct.Mapper;
import backend.model.Playlist;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlaylistMapper {
   // @Mapping(source = "user", target = "user_id")
    PlaylistDTO toDto(Playlist playlist);
    Playlist toEntity(PlaylistDTO dto);

    default UserDTO mapUser(backend.model.User user) {
        if (user == null) return null;
        return new UserDTO(user.getId(), user.getUsername());
    }
}