package co.eventinvite.layout.repository;

import co.eventinvite.layout.entity.Layout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LayoutRepository extends JpaRepository<Layout, UUID> {
    Optional<Layout> findByEventId(UUID eventId);
    List<Layout> findByEventIdIn(Collection<UUID> eventIds);
}
