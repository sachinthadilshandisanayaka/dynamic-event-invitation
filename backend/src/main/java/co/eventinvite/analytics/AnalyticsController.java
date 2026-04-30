package co.eventinvite.analytics;

import co.eventinvite.analytics.entity.AnalyticsEvent;
import co.eventinvite.analytics.repository.AnalyticsRepository;
import co.eventinvite.auth.repository.UserRepository;
import co.eventinvite.event.EventService;
import co.eventinvite.event.dto.EventResponse;
import co.eventinvite.shared.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsRepository analyticsRepository;
    private final EventService eventService;
    private final UserRepository userRepository;

    @PostMapping("/track")
    public ResponseEntity<ApiResponse<Void>> track(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        try {
            String slug = (String) body.get("eventSlug");
            String type = (String) body.getOrDefault("eventType", "page_view");
            String tokenStr = (String) body.get("inviteToken");

            EventResponse event = null;
            try { event = eventService.getPublic(slug); } catch (Exception ignored) {}
            if (event == null) return ResponseEntity.ok(ApiResponse.ok(null));

            AnalyticsEvent ae = AnalyticsEvent.builder()
                    .eventId(event.id())
                    .eventType(type)
                    .inviteToken(tokenStr != null ? UUID.fromString(tokenStr) : null)
                    .ipAddress(getClientIp(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .metadata("{}")
                    .build();
            analyticsRepository.save(ae);
        } catch (Exception e) { /* swallow tracking errors */ }
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/events/{slug}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> summary(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        UUID orgId = userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow().getOrgId();
        EventResponse event = eventService.getForAdmin(slug, orgId);

        long views = analyticsRepository.countByEventIdAndEventType(event.id(), "page_view");
        long rsvpStarted = analyticsRepository.countByEventIdAndEventType(event.id(), "rsvp_started");
        long rsvpSubmitted = analyticsRepository.countByEventIdAndEventType(event.id(), "rsvp_submitted");

        List<Object[]> daily = analyticsRepository.dailyViewsForEvent(event.id());
        List<Map<String, Object>> dailyList = daily.stream()
                .map(r -> Map.of("day", r[0].toString(), "views", ((Number) r[1]).longValue()))
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "totalViews", views,
                "rsvpStarted", rsvpStarted,
                "rsvpSubmitted", rsvpSubmitted,
                "conversionRate", views > 0 ? (double) rsvpSubmitted / views : 0,
                "dailyViews", dailyList
        )));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isEmpty()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
    }
}
