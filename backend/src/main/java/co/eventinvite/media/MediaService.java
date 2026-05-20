package co.eventinvite.media;

import co.eventinvite.media.entity.MediaAsset;
import co.eventinvite.media.repository.MediaRepository;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MinioClient minioClient;
    private final MediaRepository mediaRepository;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.public-url}")
    private String publicUrl;

    public Map<String, String> presign(UUID eventId, String filename, String contentType) throws Exception {
        String objectKey = eventId + "/" + UUID.randomUUID() + "-" + sanitize(filename);

        // Ensure bucket exists
        ensureBucket();

        String presignedUrl = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.PUT)
                        .bucket(bucket)
                        .object(objectKey)
                        .expiry(15, TimeUnit.MINUTES)
                        .extraHeaders(Map.of("Content-Type", contentType))
                        .build());

        String cdnUrl = publicUrl + "/" + bucket + "/" + objectKey;

        // Register asset in DB
        MediaAsset asset = MediaAsset.builder()
                .eventId(eventId)
                .filename(filename)
                .contentType(contentType)
                .cdnUrl(cdnUrl)
                .objectKey(objectKey)
                .build();
        mediaRepository.save(asset);

        return Map.of("presignedUrl", presignedUrl, "cdnUrl", cdnUrl, "objectKey", objectKey);
    }

    public List<MediaAsset> listByEvent(UUID eventId) {
        return mediaRepository.findByEventIdOrderByUploadedAtDesc(eventId);
    }

    public void delete(UUID assetId) throws Exception {
        MediaAsset asset = mediaRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        minioClient.removeObject(RemoveObjectArgs.builder()
                .bucket(bucket).object(asset.getObjectKey()).build());
        mediaRepository.delete(asset);
    }

    public void deleteAllByEventId(UUID eventId) {
        List<MediaAsset> assets = mediaRepository.findByEventIdOrderByUploadedAtDesc(eventId);
        for (MediaAsset asset : assets) {
            try {
                minioClient.removeObject(RemoveObjectArgs.builder()
                        .bucket(bucket).object(asset.getObjectKey()).build());
            } catch (Exception e) {
                log.warn("Failed to delete object {} from MinIO: {}", asset.getObjectKey(), e.getMessage());
            }
        }
        mediaRepository.deleteAllByEventId(eventId);
    }

    private void ensureBucket() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("Created MinIO bucket: {}", bucket);
            }
        } catch (Exception e) {
            log.warn("Could not verify/create bucket: {}", e.getMessage());
        }
    }

    private String sanitize(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
    }
}
