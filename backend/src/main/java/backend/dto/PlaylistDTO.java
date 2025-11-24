package backend.dto;

import backend.model.Privacy;

public record PlaylistDTO(Long id, String title, UserDTO user_id, String description, Privacy visibility, String imageUrl) { }