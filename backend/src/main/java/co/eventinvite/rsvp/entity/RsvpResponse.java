package co.eventinvite.rsvp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rsvp_responses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RsvpResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "guest_id", unique = true, nullable = false)
    private UUID guestId;

    @Column(nullable = false)
    private boolean attending;

    @Column(name = "plus_ones")
    private int plusOnes;

    private String message;

    @CreationTimestamp
    @Column(name = "responded_at", updatable = false)
    private Instant respondedAt;
}
