package co.eventinvite.media;

import co.eventinvite.auth.repository.UserRepository;
import co.eventinvite.event.EventService;
import co.eventinvite.event.dto.EventResponse;
import co.eventinvite.media.entity.MediaAsset;
import co.eventinvite.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;
    private final EventService eventService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> upload(
            @RequestParam("eventSlug") String slug,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        UUID orgId = getOrgId(principal);
        EventResponse event = eventService.getForAdmin(slug, orgId);
        Map<String, String> result = mediaService.upload(event.id(), file);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/presign")
    public ResponseEntity<ApiResponse<Map<String, String>>> presign(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        UUID orgId = getOrgId(principal);
        String slug = body.get("eventSlug");
        EventResponse event = eventService.getForAdmin(slug, orgId);
        Map<String, String> result = mediaService.presign(
                event.id(),
                body.get("filename"),
                body.getOrDefault("contentType", "application/octet-stream"));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/events/{slug}")
    public ResponseEntity<ApiResponse<List<MediaAsset>>> listByEvent(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse event = eventService.getForAdmin(slug, getOrgId(principal));
        return ResponseEntity.ok(ApiResponse.ok(mediaService.listByEvent(event.id())));
    }

    @DeleteMapping("/{assetId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID assetId,
            @AuthenticationPrincipal UserDetails principal) throws Exception {
        mediaService.delete(assetId);
        return ResponseEntity.ok(ApiResponse.ok("Asset deleted", null));
    }

    private UUID getOrgId(UserDetails principal) {
        return userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow().getOrgId();
    }
}
