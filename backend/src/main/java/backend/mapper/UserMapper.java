package backend.mapper;

import org.mapstruct.Mapper;
import backend.model.User;
import backend.dto.UserDTO;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDto(User user);
    User toEntity(UserDTO dto);
}