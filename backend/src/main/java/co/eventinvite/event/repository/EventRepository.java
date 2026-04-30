package co.eventinvite.event.repository;

import co.eventinvite.event.entity.Event;
import co.eventinvite.event.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    Optional<Event> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Page<Event> findByOrgIdOrderByCreatedAtDesc(UUID orgId, Pageable pageable);
    List<Event> findByOrgIdAndStatusNotOrderByCreatedAtDesc(UUID orgId, EventStatus status);
}
