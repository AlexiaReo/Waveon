package backend.dto;

public record   AuthRequest(String email, String password, String role) {}
