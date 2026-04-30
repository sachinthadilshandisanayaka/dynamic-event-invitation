package co.eventinvite.rsvp.repository;

import co.eventinvite.rsvp.entity.Guest;
import co.eventinvite.rsvp.entity.GuestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GuestRepository extends JpaRepository<Guest, UUID> {
    Optional<Guest> findByInviteToken(UUID inviteToken);
    Page<Guest> findByEventIdOrderByInvitedAtDesc(UUID eventId, Pageable pageable);
    List<Guest> findByEventId(UUID eventId);
    long countByEventIdAndStatus(UUID eventId, GuestStatus status);

    @Query("SELECT COUNT(g) FROM Guest g WHERE g.eventId = ?1")
    long countByEventId(UUID eventId);
}
