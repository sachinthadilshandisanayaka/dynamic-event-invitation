package co.eventinvite.layout;

import co.eventinvite.auth.repository.UserRepository;
import co.eventinvite.event.EventService;
import co.eventinvite.event.dto.EventResponse;
import co.eventinvite.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/events/{slug}/layout")
@RequiredArgsConstructor
public class LayoutController {

    private final LayoutService layoutService;
    private final EventService eventService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> get(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse event = principal != null
                ? eventService.getForAdmin(slug, getOrgId(principal))
                : eventService.getPublic(slug);
        String sections = layoutService.getByEventId(event.id());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("sections", sections, "eventId", event.id())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> save(
            @PathVariable String slug,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails principal) {
        UUID orgId = getOrgId(principal);
        EventResponse event = eventService.getForAdmin(slug, orgId);
        String sections = body.get("sections").toString();
        String saved = layoutService.save(event.id(), sections);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("sections", saved)));
    }

    private UUID getOrgId(UserDetails principal) {
        return userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow().getOrgId();
    }
}
