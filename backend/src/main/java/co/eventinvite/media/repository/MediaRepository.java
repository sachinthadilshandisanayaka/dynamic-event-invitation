package co.eventinvite.media.repository;

import co.eventinvite.media.entity.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<MediaAsset, UUID> {
    List<MediaAsset> findByEventIdOrderByUploadedAtDesc(UUID eventId);
    void deleteAllByEventId(UUID eventId);
}
