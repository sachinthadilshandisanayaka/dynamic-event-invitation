package co.eventinvite.analytics.repository;

import co.eventinvite.analytics.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AnalyticsRepository extends JpaRepository<AnalyticsEvent, UUID> {

    long countByEventIdAndEventType(UUID eventId, String eventType);

    @Query(value = """
        SELECT event_type, COUNT(*) as count
        FROM analytics_events WHERE event_id = ?1
        GROUP BY event_type ORDER BY count DESC
        """, nativeQuery = true)
    List<Object[]> countByTypeForEvent(UUID eventId);

    @Query(value = """
        SELECT DATE(tracked_at) as day, COUNT(*) as views
        FROM analytics_events WHERE event_id = ?1 AND event_type = 'page_view'
        GROUP BY day ORDER BY day DESC LIMIT 30
        """, nativeQuery = true)
    List<Object[]> dailyViewsForEvent(UUID eventId);
}
