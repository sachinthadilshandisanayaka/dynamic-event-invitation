package co.eventinvite.rsvp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "rsvp_field_values")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RsvpFieldValue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rsvp_id", nullable = false)
    private UUID rsvpId;

    @Column(name = "field_id", nullable = false)
    private UUID fieldId;

    private String value;
}
