package co.eventinvite.rsvp.repository;

import co.eventinvite.rsvp.entity.CustomField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CustomFieldRepository extends JpaRepository<CustomField, UUID> {
    List<CustomField> findByEventIdOrderByDisplayOrderAsc(UUID eventId);
    void deleteByEventId(UUID eventId);
}
