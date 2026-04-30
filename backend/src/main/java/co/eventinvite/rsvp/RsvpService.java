package co.eventinvite.rsvp;

import co.eventinvite.event.EventService;
import co.eventinvite.event.dto.EventResponse;
import co.eventinvite.rsvp.dto.*;
import co.eventinvite.rsvp.entity.*;
import co.eventinvite.rsvp.repository.*;
import co.eventinvite.shared.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RsvpService {

    private final GuestRepository guestRepository;
    private final RsvpRepository rsvpRepository;
    private final CustomFieldRepository customFieldRepository;
    private final RsvpFieldValueRepository fieldValueRepository;
    private final EventService eventService;

    // ---- Guest Management ----

    @Transactional
    public GuestDto addGuest(UUID eventId, AddGuestRequest req) {
        Guest guest = Guest.builder()
                .eventId(eventId)
                .name(req.name())
                .email(req.email())
                .phone(req.phone())
                .inviteToken(UUID.randomUUID())
                .status(GuestStatus.INVITED)
                .notes(req.notes())
                .build();
        return toGuestDto(guestRepository.save(guest));
    }

    @Transactional
    public List<GuestDto> importGuests(UUID eventId, List<Map<String, String>> rows) {
        List<Guest> guests = rows.stream().map(row -> Guest.builder()
                .eventId(eventId)
                .name(row.get("name"))
                .email(row.get("email"))
                .phone(row.get("phone"))
                .inviteToken(UUID.randomUUID())
                .status(GuestStatus.INVITED)
                .build()).toList();
        return guestRepository.saveAll(guests).stream().map(this::toGuestDto).toList();
    }

    public Page<GuestDto> listGuests(UUID eventId, int page, int size) {
        return guestRepository.findByEventIdOrderByInvitedAtDesc(
                eventId, PageRequest.of(page, size)).map(this::toGuestDto);
    }

    public GuestStatsDto stats(UUID eventId) {
        long total = guestRepository.countByEventId(eventId);
        long yes = guestRepository.countByEventIdAndStatus(eventId, GuestStatus.RSVP_YES);
        long no = guestRepository.countByEventIdAndStatus(eventId, GuestStatus.RSVP_NO);
        long opened = guestRepository.countByEventIdAndStatus(eventId, GuestStatus.OPENED);
        long pending = total - yes - no;
        return new GuestStatsDto(total, yes, no, opened, pending);
    }

    @Transactional
    public void deleteGuest(UUID guestId) {
        guestRepository.deleteById(guestId);
    }

    // ---- RSVP Submission (public) ----

    public GuestDto getByToken(UUID token) {
        Guest guest = findGuest(token);
        if (guest.getStatus() == GuestStatus.INVITED) {
            guest.setStatus(GuestStatus.OPENED);
            guestRepository.save(guest);
        }
        return toGuestDtoWithRsvp(guest);
    }

    @Transactional
    public RsvpDto submitRsvp(UUID token, RsvpSubmitRequest req) {
        Guest guest = findGuest(token);
        EventResponse event = eventService.getPublic(
                findEventSlugByGuestId(guest.getEventId()));

        // Check deadline if set via widget props - this is advisory only
        RsvpResponse rsvp = rsvpRepository.findByGuestId(guest.getId())
                .orElse(RsvpResponse.builder().guestId(guest.getId()).build());

        rsvp.setAttending(req.attending());
        rsvp.setPlusOnes(req.plusOnes() != null ? req.plusOnes() : 0);
        rsvp.setMessage(req.message());
        rsvp = rsvpRepository.save(rsvp);

        guest.setStatus(req.attending() ? GuestStatus.RSVP_YES : GuestStatus.RSVP_NO);
        guestRepository.save(guest);

        // Save custom field values
        if (req.fieldValues() != null && !req.fieldValues().isEmpty()) {
            final UUID savedRsvpId = rsvp.getId();
            fieldValueRepository.deleteByRsvpId(savedRsvpId);
            List<RsvpFieldValue> values = req.fieldValues().entrySet().stream()
                    .map(e -> customFieldRepository.findById(UUID.fromString(e.getKey()))
                            .map(cf -> RsvpFieldValue.builder()
                                    .rsvpId(savedRsvpId)
                                    .fieldId(cf.getId())
                                    .value(e.getValue())
                                    .build())
                            .orElse(null))
                    .filter(Objects::nonNull)
                    .toList();
            fieldValueRepository.saveAll(values);
        }

        log.info("RSVP submitted: guest={} attending={}", guest.getId(), req.attending());
        return toRsvpDto(rsvp, guest);
    }

    // ---- Custom Fields ----

    @Transactional
    public List<CustomFieldDto> saveCustomFields(UUID eventId, List<CustomFieldDto> fields) {
        customFieldRepository.deleteByEventId(eventId);
        List<CustomField> saved = fields.stream()
                .map(f -> CustomField.builder()
                        .eventId(eventId)
                        .fieldKey(f.fieldKey())
                        .fieldLabel(f.fieldLabel())
                        .fieldType(f.fieldType())
                        .options(f.options())
                        .required(f.required())
                        .displayOrder(f.displayOrder())
                        .build())
                .map(customFieldRepository::save)
                .toList();
        return saved.stream().map(this::toCustomFieldDto).toList();
    }

    public List<CustomFieldDto> getCustomFields(UUID eventId) {
        return customFieldRepository.findByEventIdOrderByDisplayOrderAsc(eventId)
                .stream().map(this::toCustomFieldDto).toList();
    }

    // ---- Helpers ----

    private Guest findGuest(UUID token) {
        return guestRepository.findByInviteToken(token)
                .orElseThrow(() -> new NotFoundException("Invalid invitation token"));
    }

    private String findEventSlugByGuestId(UUID eventId) {
        // We need to look up the event slug — use EventService via a query
        // For now, we pass eventId and call a different method
        return eventId.toString(); // placeholder; EventController resolves the slug
    }

    private GuestDto toGuestDto(Guest g) {
        return new GuestDto(g.getId(), g.getName(), g.getEmail(), g.getPhone(),
                g.getInviteToken(), g.getStatus().name(), g.getNotes(), g.getInvitedAt(), null);
    }

    private GuestDto toGuestDtoWithRsvp(Guest g) {
        RsvpDto rsvp = rsvpRepository.findByGuestId(g.getId())
                .map(r -> toRsvpDto(r, g)).orElse(null);
        return new GuestDto(g.getId(), g.getName(), g.getEmail(), g.getPhone(),
                g.getInviteToken(), g.getStatus().name(), g.getNotes(), g.getInvitedAt(), rsvp);
    }

    private RsvpDto toRsvpDto(RsvpResponse r, Guest g) {
        return new RsvpDto(r.getId(), g.getId(), r.isAttending(), r.getPlusOnes(),
                r.getMessage(), r.getRespondedAt());
    }

    private CustomFieldDto toCustomFieldDto(CustomField f) {
        return new CustomFieldDto(f.getId(), f.getFieldKey(), f.getFieldLabel(),
                f.getFieldType(), f.getOptions(), f.isRequired(), f.getDisplayOrder());
    }
}
