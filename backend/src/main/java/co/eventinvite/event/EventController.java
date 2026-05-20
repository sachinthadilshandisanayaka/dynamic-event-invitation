package co.eventinvite.event;

import co.eventinvite.auth.entity.User;
import co.eventinvite.auth.repository.UserRepository;
import co.eventinvite.event.dto.*;
import co.eventinvite.shared.ApiResponse;
import co.eventinvite.shared.RestPage;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<RestPage<EventResponse>>> list(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(eventService.list(user.getOrgId(), page, size)));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<RestPage<EventResponse>>> listDeleted(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(eventService.listDeleted(user.getOrgId(), page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> create(
            @Valid @RequestBody EventRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        User user = getUser(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(eventService.create(req, user.getOrgId(), user.getId())));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<EventResponse>> get(@PathVariable String slug,
            @RequestParam(required = false) boolean preview,
            @AuthenticationPrincipal UserDetails principal) {
        if (principal != null || preview) {
            User user = principal != null ? getUser(principal) : null;
            return ResponseEntity.ok(ApiResponse.ok(
                    user != null ? eventService.getForAdmin(slug, user.getOrgId())
                                 : eventService.getPublic(slug)));
        }
        return ResponseEntity.ok(ApiResponse.ok(eventService.getPublic(slug)));
    }

    @PutMapping("/{slug}")
    public ResponseEntity<ApiResponse<EventResponse>> update(
            @PathVariable String slug,
            @Valid @RequestBody EventRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(eventService.update(slug, req, user.getOrgId())));
    }

    @PutMapping("/{slug}/publish")
    public ResponseEntity<ApiResponse<EventResponse>> publish(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(eventService.publish(slug, user.getOrgId())));
    }

    @PutMapping("/{slug}/unpublish")
    public ResponseEntity<ApiResponse<EventResponse>> unpublish(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        User user = getUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(eventService.unpublish(slug, user.getOrgId())));
    }

    @PostMapping("/{slug}/copy")
    public ResponseEntity<ApiResponse<EventResponse>> copy(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        User user = getUser(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(eventService.copy(slug, user.getOrgId(), user.getId())));
    }

    /** Soft delete — moves event to history (recoverable for 10 days). */
    @DeleteMapping("/{slug}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        User user = getUser(principal);
        eventService.softDelete(slug, user.getOrgId());
        return ResponseEntity.ok(ApiResponse.ok("Event moved to history", null));
    }

    /** Hard delete — permanently removes event and all uploaded media from storage. */
    @DeleteMapping("/{slug}/permanent")
    public ResponseEntity<ApiResponse<Void>> permanentDelete(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        User user = getUser(principal);
        eventService.hardDelete(slug, user.getOrgId());
        return ResponseEntity.ok(ApiResponse.ok("Event permanently deleted", null));
    }

    private User getUser(UserDetails principal) {
        return userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
