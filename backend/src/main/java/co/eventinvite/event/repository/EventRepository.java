package co.eventinvite.event.repository;

import co.eventinvite.event.entity.Event;
import co.eventinvite.event.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    Optional<Event> findBySlug(String slug);
    boolean existsBySlug(String slug);

    // Active events (excludes soft-deleted)
    Page<Event> findByOrgIdAndStatusNotOrderByCreatedAtDesc(UUID orgId, EventStatus status, Pageable pageable);

    // Deleted events (history)
    Page<Event> findByOrgIdAndStatusOrderByDeletedAtDesc(UUID orgId, EventStatus status, Pageable pageable);

    // Events deleted more than N days ago — for scheduled purge
    List<Event> findByStatusAndDeletedAtBefore(EventStatus status, Instant cutoff);
}
