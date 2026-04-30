package co.eventinvite.rsvp.repository;

import co.eventinvite.rsvp.entity.RsvpFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RsvpFieldValueRepository extends JpaRepository<RsvpFieldValue, UUID> {
    List<RsvpFieldValue> findByRsvpId(UUID rsvpId);
    void deleteByRsvpId(UUID rsvpId);
}
