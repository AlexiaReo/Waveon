package backend.dto;

import java.util.Set;

public record UserDTO(Long id, String username, Set<String> roles) { }