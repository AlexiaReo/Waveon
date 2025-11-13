package backend.dto;

import backend.model.Privacy;

public record PlaylistDTO(Long id, String title, Long userID, String description, Privacy visibility) { }