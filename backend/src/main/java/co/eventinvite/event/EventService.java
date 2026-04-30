package co.eventinvite.event;

import co.eventinvite.event.dto.*;
import co.eventinvite.event.entity.*;
import co.eventinvite.event.repository.EventRepository;
import co.eventinvite.layout.LayoutService;
import co.eventinvite.shared.exception.*;
import co.eventinvite.theme.ThemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EventService {

    private static final Set<String> RESERVED = Set.of(
            "admin", "api", "login", "rsvp", "preview", "health", "static", "assets", "auth", "media");

    private final EventRepository eventRepository;
    private final LayoutService layoutService;
    private final ThemeService themeService;

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
        if (event.getStatus() == EventStatus.DRAFT || event.getStatus() == EventStatus.ARCHIVED) {
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
    public Page<EventResponse> list(UUID orgId, int page, int size) {
        return eventRepository.findByOrgIdOrderByCreatedAtDesc(
                orgId, PageRequest.of(page, size)).map(this::toResponse);
    }

    @Caching(evict = {
        @CacheEvict(value = "eventPage", key = "#slug"),
        @CacheEvict(value = "events", allEntries = true)
    })
    @Transactional
    public void archive(String slug, UUID orgId) {
        Event event = getBySlug(slug);
        assertOwner(event, orgId);
        event.setStatus(EventStatus.ARCHIVED);
        eventRepository.save(event);
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
        return new EventResponse(e.getId(), e.getSlug(), e.getTitle(), e.getStatus().name(),
                e.getEventDate(), e.getEventEndDate(), e.getTimezone(), e.getDescription(),
                e.getOgTitle(), e.getOgDescription(), e.getOgImageUrl(),
                e.getOrgId(), e.getCreatedAt(), e.getUpdatedAt());
    }
}
