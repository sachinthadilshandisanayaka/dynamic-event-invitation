package co.eventinvite.theme;

import co.eventinvite.auth.repository.UserRepository;
import co.eventinvite.event.EventService;
import co.eventinvite.event.dto.EventResponse;
import co.eventinvite.shared.ApiResponse;
import co.eventinvite.theme.entity.Theme;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/events/{slug}/theme")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;
    private final EventService eventService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Theme>> get(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse event = principal != null
                ? eventService.getForAdmin(slug, getOrgId(principal))
                : eventService.getPublic(slug);
        return ResponseEntity.ok(ApiResponse.ok(themeService.getByEventId(event.id())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Theme>> save(
            @PathVariable String slug,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails principal) {
        UUID orgId = getOrgId(principal);
        EventResponse event = eventService.getForAdmin(slug, orgId);
        return ResponseEntity.ok(ApiResponse.ok(themeService.save(event.id(), body)));
    }

    private UUID getOrgId(UserDetails principal) {
        return userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow().getOrgId();
    }
}
