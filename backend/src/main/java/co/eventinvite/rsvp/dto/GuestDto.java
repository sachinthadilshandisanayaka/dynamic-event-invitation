package co.eventinvite.rsvp.dto;

import java.time.Instant;
import java.util.UUID;

public record GuestDto(
        UUID id,
        String name,
        String email,
        String phone,
        UUID inviteToken,
        String status,
        String notes,
        Instant invitedAt,
        RsvpDto rsvp
) {}
