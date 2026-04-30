package co.eventinvite.rsvp;

import co.eventinvite.auth.repository.UserRepository;
import co.eventinvite.event.EventService;
import co.eventinvite.event.dto.EventResponse;
import co.eventinvite.rsvp.dto.*;
import co.eventinvite.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class RsvpController {

    private final RsvpService rsvpService;
    private final EventService eventService;
    private final UserRepository userRepository;

    // ---- Public RSVP endpoints ----

    @GetMapping("/rsvp/{token}")
    public ResponseEntity<ApiResponse<GuestDto>> getByToken(@PathVariable UUID token) {
        return ResponseEntity.ok(ApiResponse.ok(rsvpService.getByToken(token)));
    }

    @PostMapping("/rsvp/{token}")
    public ResponseEntity<ApiResponse<RsvpDto>> submit(
            @PathVariable UUID token,
            @Valid @RequestBody RsvpSubmitRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(rsvpService.submitRsvp(token, req)));
    }

    // ---- Admin guest management ----

    @GetMapping("/events/{slug}/guests")
    public ResponseEntity<ApiResponse<Page<GuestDto>>> listGuests(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse event = eventService.getForAdmin(slug, getOrgId(principal));
        return ResponseEntity.ok(ApiResponse.ok(rsvpService.listGuests(event.id(), page, size)));
    }

    @GetMapping("/events/{slug}/guests/stats")
    public ResponseEntity<ApiResponse<GuestStatsDto>> stats(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse event = eventService.getForAdmin(slug, getOrgId(principal));
        return ResponseEntity.ok(ApiResponse.ok(rsvpService.stats(event.id())));
    }

    @PostMapping("/events/{slug}/guests")
    public ResponseEntity<ApiResponse<GuestDto>> addGuest(
            @PathVariable String slug,
            @RequestBody AddGuestRequest req,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse event = eventService.getForAdmin(slug, getOrgId(principal));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(rsvpService.addGuest(event.id(), req)));
    }

    @PostMapping("/events/{slug}/guests/import")
    public ResponseEntity<ApiResponse<List<GuestDto>>> importCsv(
            @PathVariable String slug,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails principal) throws IOException {
        EventResponse event = eventService.getForAdmin(slug, getOrgId(principal));
        List<Map<String, String>> rows = parseCsv(file.getInputStream());
        return ResponseEntity.ok(ApiResponse.ok(rsvpService.importGuests(event.id(), rows)));
    }

    @DeleteMapping("/events/{slug}/guests/{guestId}")
    public ResponseEntity<ApiResponse<Void>> deleteGuest(
            @PathVariable String slug,
            @PathVariable UUID guestId,
            @AuthenticationPrincipal UserDetails principal) {
        eventService.getForAdmin(slug, getOrgId(principal));
        rsvpService.deleteGuest(guestId);
        return ResponseEntity.ok(ApiResponse.ok("Guest removed", null));
    }

    // ---- Custom fields ----

    @GetMapping("/events/{slug}/custom-fields")
    public ResponseEntity<ApiResponse<List<CustomFieldDto>>> getCustomFields(
            @PathVariable String slug,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse event = principal != null
                ? eventService.getForAdmin(slug, getOrgId(principal))
                : eventService.getPublic(slug);
        return ResponseEntity.ok(ApiResponse.ok(rsvpService.getCustomFields(event.id())));
    }

    @PutMapping("/events/{slug}/custom-fields")
    public ResponseEntity<ApiResponse<List<CustomFieldDto>>> saveCustomFields(
            @PathVariable String slug,
            @RequestBody List<CustomFieldDto> fields,
            @AuthenticationPrincipal UserDetails principal) {
        EventResponse event = eventService.getForAdmin(slug, getOrgId(principal));
        return ResponseEntity.ok(ApiResponse.ok(rsvpService.saveCustomFields(event.id(), fields)));
    }

    private UUID getOrgId(UserDetails principal) {
        return userRepository.findByEmailIgnoreCase(principal.getUsername())
                .orElseThrow().getOrgId();
    }

    private List<Map<String, String>> parseCsv(InputStream stream) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String[] headers = reader.readLine().split(",");
            String line;
            while ((line = reader.readLine()) != null) {
                String[] cols = line.split(",", -1);
                Map<String, String> row = new HashMap<>();
                for (int i = 0; i < headers.length && i < cols.length; i++) {
                    row.put(headers[i].trim().toLowerCase(), cols[i].trim());
                }
                rows.add(row);
            }
        }
        return rows;
    }
}
