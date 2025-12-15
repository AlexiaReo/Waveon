package backend.mapper;

import org.mapstruct.Mapper;
import backend.model.User;
import backend.dto.UserDTO;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDto(User user);
    //@Mapping(source = "username", target = "username")
    User toEntity(UserDTO dto);
}