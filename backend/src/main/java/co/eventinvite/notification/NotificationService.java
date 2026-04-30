package co.eventinvite.notification;

import co.eventinvite.notification.entity.NotificationLog;
import co.eventinvite.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

/**
 * Notification stub — logs to DB.
 * To enable email: set smtp.enabled=true and configure SMTP credentials.
 * To enable SMS: integrate Twilio SDK here.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Value("${smtp.enabled:false}")
    private boolean smtpEnabled;

    @Async
    public void sendInvitation(UUID eventId, UUID guestId, String recipient, String eventTitle) {
        log.info("[NOTIFICATION] Invitation would be sent to {} for event '{}'", recipient, eventTitle);
        save(eventId, guestId, "INVITATION", "EMAIL", recipient,
                "You're invited to " + eventTitle,
                "Please check your invitation at the event link.");
    }

    @Async
    public void sendRsvpConfirmation(UUID eventId, UUID guestId, String recipient, boolean attending) {
        String msg = attending ? "Your RSVP has been confirmed — we'll see you there!" : "Thanks for letting us know.";
        log.info("[NOTIFICATION] RSVP confirmation would be sent to {}", recipient);
        save(eventId, guestId, "RSVP_CONFIRMATION", "EMAIL", recipient,
                "RSVP Confirmed", msg);
    }

    @Async
    public void sendReminder(UUID eventId, UUID guestId, String recipient, String eventTitle, String when) {
        log.info("[NOTIFICATION] Reminder ({}) would be sent to {} for event '{}'", when, recipient, eventTitle);
        save(eventId, guestId, "REMINDER_" + when.toUpperCase(), "EMAIL", recipient,
                "Reminder: " + eventTitle + " is coming up",
                "Don't forget — " + eventTitle + " is " + when + "!");
    }

    private void save(UUID eventId, UUID guestId, String type, String channel,
                      String recipient, String subject, String body) {
        NotificationLog log = NotificationLog.builder()
                .eventId(eventId)
                .guestId(guestId)
                .type(type)
                .channel(channel)
                .recipient(recipient)
                .subject(subject)
                .body(body)
                .status("LOGGED")
                .sentAt(Instant.now())
                .build();
        notificationRepository.save(log);
    }
}
