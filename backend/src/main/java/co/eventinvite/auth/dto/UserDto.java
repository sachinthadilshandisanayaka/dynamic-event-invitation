package co.eventinvite.auth.dto;

import java.util.UUID;

public record UserDto(UUID id, String name, String email, String role, UUID orgId) {}
