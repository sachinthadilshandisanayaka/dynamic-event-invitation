package co.eventinvite.rsvp.dto;

import java.util.UUID;

public record CustomFieldDto(
        UUID id,
        String fieldKey,
        String fieldLabel,
        String fieldType,
        String options,
        boolean required,
        int displayOrder
) {}
