package backend.mapper;

import backend.dto.UserDTO;
import backend.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Entity → DTO
    UserDTO toDTO(User user);

    // DTO → Entity
    User toEntity(UserDTO dto);
}
