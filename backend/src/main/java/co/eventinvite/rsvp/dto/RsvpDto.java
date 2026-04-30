package co.eventinvite.rsvp.dto;

import java.time.Instant;
import java.util.UUID;

public record RsvpDto(
        UUID id,
        UUID guestId,
        boolean attending,
        int plusOnes,
        String message,
        Instant respondedAt
) {}
