package co.eventinvite.widget;

import java.util.List;
import java.util.Map;

public class WidgetCatalog {

    public static final List<Map<String, Object>> ALL = List.of(
        Map.of("type", "hero", "label", "Hero Banner", "category", "layout", "icon", "image",
            "schema", Map.of(
                "title", Map.of("type", "text", "label", "Title", "required", true),
                "subtitle", Map.of("type", "text", "label", "Subtitle"),
                "bgImage", Map.of("type", "media", "label", "Background Image"),
                "bgColor", Map.of("type", "color", "label", "Background Color", "default", "#6366f1"),
                "textColor", Map.of("type", "color", "label", "Text Color", "default", "#ffffff"),
                "height", Map.of("type", "select", "label", "Height",
                    "options", List.of("small", "medium", "large", "full"),
                    "default", "large")
            )),

        Map.of("type", "countdown", "label", "Countdown Timer", "category", "interactive", "icon", "clock",
            "schema", Map.of(
                "targetDate", Map.of("type", "datetime", "label", "Target Date/Time", "required", true),
                "timezone", Map.of("type", "text", "label", "Timezone (e.g. Asia/Colombo)"),
                "endedMessage", Map.of("type", "text", "label", "Message when event starts",
                    "default", "The event has started!"),
                "bgColor", Map.of("type", "color", "label", "Background Color", "default", "#ffffff"),
                "textColor", Map.of("type", "color", "label", "Text Color", "default", "#111827")
            )),

        Map.of("type", "event-details", "label", "Event Details", "category", "content", "icon", "info",
            "schema", Map.of(
                "dateLabel", Map.of("type", "text", "label", "Date Label", "default", "Date & Time"),
                "locationLabel", Map.of("type", "text", "label", "Location Label", "default", "Venue"),
                "venueName", Map.of("type", "text", "label", "Venue Name"),
                "address", Map.of("type", "text", "label", "Full Address"),
                "showMap", Map.of("type", "boolean", "label", "Show Map Button", "default", true),
                "bgColor", Map.of("type", "color", "label", "Background Color", "default", "#f9fafb"),
                "textColor", Map.of("type", "color", "label", "Text Color", "default", "#111827")
            )),

        Map.of("type", "map", "label", "Map / Location", "category", "interactive", "icon", "map-pin",
            "schema", Map.of(
                "venueName", Map.of("type", "text", "label", "Venue Name", "required", true),
                "address", Map.of("type", "text", "label", "Full Address"),
                "latitude", Map.of("type", "number", "label", "Latitude (optional)"),
                "longitude", Map.of("type", "number", "label", "Longitude (optional)"),
                "googleMapsUrl", Map.of("type", "text", "label", "Google Maps URL (optional — auto-extracts coordinates)"),
                "zoom", Map.of("type", "number", "label", "Map Zoom Level", "default", 15),
                "height", Map.of("type", "number", "label", "Map Height (px)", "default", 400)
            )),

        Map.of("type", "rsvp-form", "label", "RSVP Form", "category", "interactive", "icon", "check-circle",
            "schema", Map.of(
                "title", Map.of("type", "text", "label", "Form Title", "default", "Will you attend?"),
                "maxPlusOnes", Map.of("type", "number", "label", "Max Plus-Ones", "default", 0),
                "deadline", Map.of("type", "datetime", "label", "RSVP Deadline"),
                "showMessage", Map.of("type", "boolean", "label", "Show personal message field", "default", false),
                "bgColor", Map.of("type", "color", "label", "Background Color", "default", "#f0fdf4"),
                "buttonColor", Map.of("type", "color", "label", "Button Color", "default", "#16a34a")
            )),

        Map.of("type", "gallery", "label", "Photo Gallery", "category", "media", "icon", "grid",
            "schema", Map.of(
                "title", Map.of("type", "text", "label", "Gallery Title"),
                "images", Map.of("type", "media-list", "label", "Images"),
                "columns", Map.of("type", "select", "label", "Columns",
                    "options", List.of("2", "3", "4"), "default", "3"),
                "rounded", Map.of("type", "boolean", "label", "Rounded corners", "default", true)
            )),

        Map.of("type", "agenda", "label", "Event Agenda", "category", "content", "icon", "list",
            "schema", Map.of(
                "title",       Map.of("type", "text",         "label", "Section Title",   "default", "Schedule"),
                "subtitle",    Map.of("type", "text",         "label", "Subtitle / Tagline"),
                "style",       Map.of("type", "agenda-style", "label", "Display Style",   "default", "timeline"),
                "items",       Map.of("type", "agenda-list",  "label", "Agenda Items"),
                "accentColor", Map.of("type", "color",        "label", "Accent Color",    "default", "#6366f1"),
                "bgColor",     Map.of("type", "color",        "label", "Background Color","default", "#ffffff"),
                "textColor",   Map.of("type", "color",        "label", "Text Color",      "default", "#111827")
            )),

        Map.of("type", "rich-text", "label", "Text Block", "category", "content", "icon", "type",
            "schema", Map.of(
                "content", Map.of("type", "richtext", "label", "Content", "required", true),
                "align", Map.of("type", "select", "label", "Alignment",
                    "options", List.of("left", "center", "right"), "default", "center"),
                "bgColor", Map.of("type", "color", "label", "Background Color", "default", "#ffffff"),
                "textColor", Map.of("type", "color", "label", "Text Color", "default", "#111827"),
                "padding", Map.of("type", "select", "label", "Padding",
                    "options", List.of("small", "medium", "large"), "default", "medium")
            )),

        Map.of("type", "video", "label", "Video Embed", "category", "media", "icon", "play",
            "schema", Map.of(
                "title", Map.of("type", "text", "label", "Title"),
                "embedUrl", Map.of("type", "text", "label", "YouTube / Vimeo URL", "required", true),
                "autoplay", Map.of("type", "boolean", "label", "Autoplay", "default", false)
            )),

        Map.of("type", "spacer", "label", "Spacer", "category", "layout", "icon", "minus",
            "schema", Map.of(
                "height", Map.of("type", "number", "label", "Height (px)", "default", 40),
                "bgColor", Map.of("type", "color", "label", "Background Color", "default", "transparent")
            ))
    );
}
