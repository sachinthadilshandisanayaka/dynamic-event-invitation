package co.eventinvite.theme;

import co.eventinvite.shared.exception.NotFoundException;
import co.eventinvite.theme.entity.Theme;
import co.eventinvite.theme.repository.ThemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ThemeService {

    private final ThemeRepository themeRepository;

    private static final String DEFAULT_TOKENS = """
        {
          "--color-primary":"#6366f1",
          "--color-secondary":"#8b5cf6",
          "--color-bg":"#ffffff",
          "--color-text":"#111827",
          "--color-accent":"#f59e0b",
          "--font-heading":"'Inter', sans-serif",
          "--font-body":"'Inter', sans-serif",
          "--border-radius":"8px"
        }
        """;

    @Transactional
    public void initTheme(UUID eventId) {
        Theme theme = Theme.builder()
                .eventId(eventId)
                .primaryColor("#6366f1")
                .secondaryColor("#8b5cf6")
                .backgroundColor("#ffffff")
                .textColor("#111827")
                .accentColor("#f59e0b")
                .fontHeading("Inter")
                .fontBody("Inter")
                .borderRadius("8px")
                .tokens(DEFAULT_TOKENS)
                .build();
        themeRepository.save(theme);
    }

    @Cacheable(value = "theme", key = "#eventId")
    public Theme getByEventId(UUID eventId) {
        return themeRepository.findByEventId(eventId)
                .orElseThrow(() -> new NotFoundException("Theme not found"));
    }

    @CacheEvict(value = "theme", key = "#eventId")
    @Transactional
    public Theme save(UUID eventId, Map<String, Object> dto) {
        Theme theme = themeRepository.findByEventId(eventId)
                .orElseGet(() -> Theme.builder().eventId(eventId).tokens(DEFAULT_TOKENS).build());

        if (dto.containsKey("primaryColor")) theme.setPrimaryColor((String) dto.get("primaryColor"));
        if (dto.containsKey("secondaryColor")) theme.setSecondaryColor((String) dto.get("secondaryColor"));
        if (dto.containsKey("backgroundColor")) theme.setBackgroundColor((String) dto.get("backgroundColor"));
        if (dto.containsKey("textColor")) theme.setTextColor((String) dto.get("textColor"));
        if (dto.containsKey("accentColor")) theme.setAccentColor((String) dto.get("accentColor"));
        if (dto.containsKey("fontHeading")) theme.setFontHeading((String) dto.get("fontHeading"));
        if (dto.containsKey("fontBody")) theme.setFontBody((String) dto.get("fontBody"));
        if (dto.containsKey("borderRadius")) theme.setBorderRadius((String) dto.get("borderRadius"));
        if (dto.containsKey("tokens")) theme.setTokens(dto.get("tokens").toString());

        // Rebuild tokens from theme fields if not provided
        if (!dto.containsKey("tokens")) {
            theme.setTokens(buildTokens(theme));
        }

        return themeRepository.save(theme);
    }

    @Transactional
    public void copyTheme(UUID sourceEventId, UUID targetEventId) {
        Theme src = themeRepository.findByEventId(sourceEventId).orElse(null);
        if (src == null) { initTheme(targetEventId); return; }
        themeRepository.save(Theme.builder()
                .eventId(targetEventId)
                .primaryColor(src.getPrimaryColor())
                .secondaryColor(src.getSecondaryColor())
                .backgroundColor(src.getBackgroundColor())
                .textColor(src.getTextColor())
                .accentColor(src.getAccentColor())
                .fontHeading(src.getFontHeading())
                .fontBody(src.getFontBody())
                .borderRadius(src.getBorderRadius())
                .tokens(src.getTokens())
                .build());
    }

    private String buildTokens(Theme t) {
        return String.format("""
            {
              "--color-primary":"%s",
              "--color-secondary":"%s",
              "--color-bg":"%s",
              "--color-text":"%s",
              "--color-accent":"%s",
              "--font-heading":"'%s', sans-serif",
              "--font-body":"'%s', sans-serif",
              "--border-radius":"%s"
            }
            """,
                t.getPrimaryColor(), t.getSecondaryColor(), t.getBackgroundColor(),
                t.getTextColor(), t.getAccentColor(), t.getFontHeading(),
                t.getFontBody(), t.getBorderRadius());
    }
}
