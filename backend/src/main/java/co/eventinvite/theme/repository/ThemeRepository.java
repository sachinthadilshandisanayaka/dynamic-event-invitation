package co.eventinvite.theme.repository;

import co.eventinvite.theme.entity.Theme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ThemeRepository extends JpaRepository<Theme, UUID> {
    Optional<Theme> findByEventId(UUID eventId);
}
