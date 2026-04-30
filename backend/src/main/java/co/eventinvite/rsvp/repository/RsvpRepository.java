package co.eventinvite.rsvp.repository;

import co.eventinvite.rsvp.entity.RsvpResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RsvpRepository extends JpaRepository<RsvpResponse, UUID> {
    Optional<RsvpResponse> findByGuestId(UUID guestId);
}
