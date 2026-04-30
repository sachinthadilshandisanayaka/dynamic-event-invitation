package co.eventinvite.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;

public record EventRequest(
        @NotBlank String title,
        @Pattern(regexp = "^[a-z0-9][a-z0-9\\-]{1,198}[a-z0-9]$",
                 message = "Slug must be lowercase letters, numbers and hyphens only") String slug,
        @NotNull Instant eventDate,
        Instant eventEndDate,
        @NotBlank String timezone,
        String description,
        String ogTitle,
        String ogDescription,
        String ogImageUrl
) {}
