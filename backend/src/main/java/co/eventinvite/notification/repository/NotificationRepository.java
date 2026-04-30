package co.eventinvite.notification.repository;

import co.eventinvite.notification.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationLog, UUID> {}
