package co.eventinvite.event.dto;

import java.time.Instant;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String slug,
        String title,
        String status,
        Instant eventDate,
        Instant eventEndDate,
        String timezone,
        String description,
        String ogTitle,
        String ogDescription,
        String ogImageUrl,
        UUID orgId,
        Instant createdAt,
        Instant updatedAt
) {}
