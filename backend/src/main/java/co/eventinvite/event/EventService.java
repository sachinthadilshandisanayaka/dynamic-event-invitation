package co.eventinvite.event;

import co.eventinvite.event.dto.*;
import co.eventinvite.event.entity.*;
import co.eventinvite.event.repository.EventRepository;
import co.eventinvite.layout.LayoutService;
import co.eventinvite.media.MediaService;
import co.eventinvite.shared.RestPage;
import co.eventinvite.shared.exception.*;
import co.eventinvite.theme.ThemeService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private static final Set<String> RESERVED = Set.of(
            "admin", "api", "login", "rsvp", "preview", "health", "static", "assets", "auth", "media");

    private final EventRepository eventRepository;
    private final LayoutService layoutService;
    private final ThemeService themeService;
    private final MediaService mediaService;
    private final ObjectMapper objectMapper;

    @Transactional
    public EventResponse create(EventRequest req, UUID orgId, UUID userId) {
        String slug = resolveSlug(req.slug(), req.title());
        if (RESERVED.contains(slug)) throw new BadRequestException("Slug '" + slug + "' is reserved");
        if (eventRepository.existsBySlug(slug)) throw new ConflictException("Slug already taken");

        Event event = Event.builder()
                .orgId(orgId)
                .slug(slug)
                .title(req.title())
                .status(EventStatus.DRAFT)
                .eventDate(req.eventDate())
                .eventEndDate(req.eventEndDate())
                .timezone(req.timezone())
                .description(req.description())
                .ogTitle(req.ogTitle())
                .ogDescription(req.ogDescription())
                .ogImageUrl(req.ogImageUrl())
                .createdBy(userId)
                .build();

        event = eventRepository.save(event);
        layoutService.initLayout(event.getId());
        themeService.initTheme(event.getId());
        return toResponse(event);
    }

    @Caching(evict = {
        @CacheEvict(value = "eventPage", key = "#slug"),
        @CacheEvict(value = "events", key = "#orgId")
    })
    @Transactional
    public EventResponse update(String slug, EventRequest req, UUID orgId) {
        Event event = getBySlug(slug);
        assertOwner(event, orgId);

        if (req.title() != null) event.setTitle(req.title());
        if (req.eventDate() != null) event.setEventDate(req.eventDate());
        if (req.eventEndDate() != null) event.setEventEndDate(req.eventEndDate());
        if (req.timezone() != null) event.setTimezone(req.timezone());
        if (req.description() != null) event.setDescription(req.description());
        if (req.ogTitle() != null) event.setOgTitle(req.ogTitle());
        if (req.ogDescription() != null) event.setOgDescription(req.ogDescription());
        if (req.ogImageUrl() != null) event.setOgImageUrl(req.ogImageUrl());

        return toResponse(eventRepository.save(event));
    }

    @Caching(evict = {
        @CacheEvict(value = "eventPage", key = "#slug"),
        @CacheEvict(value = "events", key = "#orgId")
    })
    @Transactional
    public EventResponse publish(String slug, UUID orgId) {
        Event event = getBySlug(slug);
        assertOwner(event, orgId);
        event.setStatus(EventStatus.PUBLISHED);
        return toResponse(eventRepository.save(event));
    }

    @Caching(evict = {
        @CacheEvict(value = "eventPage", key = "#slug"),
        @CacheEvict(value = "events", key = "#orgId")
    })
    @Transactional
    public EventResponse unpublish(String slug, UUID orgId) {
        Event event = getBySlug(slug);
        assertOwner(event, orgId);
        event.setStatus(EventStatus.DRAFT);
        return toResponse(eventRepository.save(event));
    }

    @Cacheable(value = "eventPage", key = "#slug")
    public EventResponse getPublic(String slug) {
        Event event = getBySlug(slug);
        if (event.getStatus() == EventStatus.DRAFT
                || event.getStatus() == EventStatus.ARCHIVED
                || event.getStatus() == EventStatus.DELETED) {
            throw new NotFoundException("Event not found or not published");
        }
        return toResponse(event);
    }

    public EventResponse getForAdmin(String slug, UUID orgId) {
        Event event = getBySlug(slug);
        assertOwner(event, orgId);
        return toResponse(event);
    }

    @Cacheable(value = "events", key = "#orgId + ':' + #page + ':' + #size")
    public RestPage<EventResponse> list(UUID orgId, int page, int size) {
        Page<Event> eventsPage = eventRepository.findByOrgIdAndStatusNotOrderByCreatedAtDesc(
                orgId, EventStatus.DELETED, PageRequest.of(page, size));

        List<UUID> ids = eventsPage.map(Event::getId).toList();
        Map<UUID, String> sectionsMap = layoutService.getSectionsForEvents(ids);

        return new RestPage<>(eventsPage.map(e ->
                toResponse(e, extractHeroTitle(sectionsMap.get(e.getId())))));
    }

    public RestPage<EventResponse> listDeleted(UUID orgId, int page, int size) {
        Page<Event> eventsPage = eventRepository.findByOrgIdAndStatusOrderByDeletedAtDesc(
                orgId, EventStatus.DELETED, PageRequest.of(page, size));
        return new RestPage<>(eventsPage.map(this::toResponse));
    }

    @CacheEvict(value = "events", allEntries = true)
    @Transactional
    public EventResponse copy(String slug, UUID orgId, UUID userId) {
        Event src = getBySlug(slug);
        assertOwner(src, orgId);

        String baseSlug = src.getSlug() + "-copy";
        String newSlug = baseSlug;
        int attempt = 1;
        while (eventRepository.existsBySlug(newSlug)) {
            newSlug = baseSlug + "-" + (++attempt);
        }

        Event copy = Event.builder()
                .orgId(orgId)
                .slug(newSlug)
                .title("Copy of " + src.getTitle())
                .status(EventStatus.DRAFT)
                .eventDate(src.getEventDate())
                .eventEndDate(src.getEventEndDate())
                .timezone(src.getTimezone())
                .description(src.getDescription())
                .ogTitle(src.getOgTitle())
                .ogDescription(src.getOgDescription())
                .ogImageUrl(src.getOgImageUrl())
                .createdBy(userId)
                .build();
        copy = eventRepository.save(copy);

        layoutService.copyLayout(src.getId(), copy.getId());
        themeService.copyTheme(src.getId(), copy.getId());

        return toResponse(copy, null);
    }

    /** Soft delete — moves to history. Permanently purged after 10 days. */
    @Caching(evict = {
        @CacheEvict(value = "eventPage", key = "#slug"),
        @CacheEvict(value = "events", allEntries = true)
    })
    @Transactional
    public void softDelete(String slug, UUID orgId) {
        Event event = getBySlug(slug);
        assertOwner(event, orgId);
        event.setStatus(EventStatus.DELETED);
        event.setDeletedAt(Instant.now());
        eventRepository.save(event);
    }

    /** Hard delete — removes event, layout, theme, and all media from MinIO + DB. */
    @Caching(evict = {
        @CacheEvict(value = "eventPage", key = "#slug"),
        @CacheEvict(value = "events", allEntries = true)
    })
    @Transactional
    public void hardDelete(String slug, UUID orgId) {
        Event event = getBySlug(slug);
        assertOwner(event, orgId);
        purgeEvent(event);
    }

    /** Scheduled: runs daily at 02:00 UTC and permanently deletes events deleted more than 10 days ago. */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void purgeOldDeletedEvents() {
        Instant cutoff = Instant.now().minus(10, ChronoUnit.DAYS);
        List<Event> expired = eventRepository.findByStatusAndDeletedAtBefore(EventStatus.DELETED, cutoff);
        for (Event event : expired) {
            try {
                purgeEvent(event);
                log.info("Auto-purged event {} (deleted at {})", event.getSlug(), event.getDeletedAt());
            } catch (Exception e) {
                log.error("Failed to auto-purge event {}: {}", event.getSlug(), e.getMessage());
            }
        }
    }

    private void purgeEvent(Event event) {
        mediaService.deleteAllByEventId(event.getId());
        eventRepository.delete(event);
    }

    private Event getBySlug(String slug) {
        return eventRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Event not found: " + slug));
    }

    private void assertOwner(Event event, UUID orgId) {
        if (!event.getOrgId().equals(orgId)) throw new NotFoundException("Event not found");
    }

    private String resolveSlug(String provided, String title) {
        if (provided != null && !provided.isBlank()) return provided.toLowerCase();
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^\\p{ASCII}]", "")
                .toLowerCase().replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        return slug.substring(0, Math.min(slug.length(), 60));
    }

    public EventResponse toResponse(Event e) {
        return toResponse(e, null);
    }

    public EventResponse toResponse(Event e, String displayTitle) {
        return new EventResponse(e.getId(), e.getSlug(), e.getTitle(), displayTitle,
                e.getStatus().name(), e.getEventDate(), e.getEventEndDate(), e.getTimezone(),
                e.getDescription(), e.getOgTitle(), e.getOgDescription(), e.getOgImageUrl(),
                e.getOrgId(), e.getCreatedAt(), e.getUpdatedAt(), e.getDeletedAt());
    }

    private String extractHeroTitle(String sectionsJson) {
        if (sectionsJson == null || sectionsJson.isBlank()) return null;
        try {
            JsonNode sections = objectMapper.readTree(sectionsJson);
            for (JsonNode section : sections) {
                if ("hero".equals(section.path("type").asText(null))) {
                    String title = section.path("props").path("title").asText(null);
                    return (title != null && !title.isBlank()) ? title : null;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }
}
