package co.eventinvite.layout;

import co.eventinvite.layout.entity.Layout;
import co.eventinvite.layout.repository.LayoutRepository;
import co.eventinvite.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LayoutService {

    private final LayoutRepository layoutRepository;

    @Transactional
    public void initLayout(UUID eventId) {
        Layout layout = Layout.builder()
                .eventId(eventId)
                .sections("[]")
                .version(1)
                .build();
        layoutRepository.save(layout);
    }

    @Cacheable(value = "layout", key = "#eventId")
    public String getByEventId(UUID eventId) {
        return layoutRepository.findByEventId(eventId)
                .orElseThrow(() -> new NotFoundException("Layout not found"))
                .getSections();
    }

    @CacheEvict(value = "layout", key = "#eventId")
    @Transactional
    public String save(UUID eventId, String sectionsJson) {
        Layout layout = layoutRepository.findByEventId(eventId)
                .orElseGet(() -> Layout.builder().eventId(eventId).sections("[]").version(1).build());
        layout.setSections(sectionsJson);
        layout.setVersion(layout.getVersion() + 1);
        return layoutRepository.save(layout).getSections();
    }

    @Transactional
    public void copyLayout(UUID sourceEventId, UUID targetEventId) {
        String sections = layoutRepository.findByEventId(sourceEventId)
                .map(Layout::getSections).orElse("[]");
        layoutRepository.save(Layout.builder()
                .eventId(targetEventId).sections(sections).version(1).build());
    }

    public Map<UUID, String> getSectionsForEvents(Collection<UUID> eventIds) {
        return layoutRepository.findByEventIdIn(eventIds).stream()
                .collect(Collectors.toMap(Layout::getEventId, Layout::getSections));
    }
}
