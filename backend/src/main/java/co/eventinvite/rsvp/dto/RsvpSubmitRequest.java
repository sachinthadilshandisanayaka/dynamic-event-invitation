package co.eventinvite.rsvp.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record RsvpSubmitRequest(
        @NotNull Boolean attending,
        Integer plusOnes,
        String message,
        Map<String, String> fieldValues
) {}
