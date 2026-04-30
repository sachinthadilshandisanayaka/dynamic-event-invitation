package co.eventinvite.layout.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "layouts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Layout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false, unique = true)
    private UUID eventId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String sections;

    @Column(nullable = false)
    private int version;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
