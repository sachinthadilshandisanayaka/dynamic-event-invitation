package co.eventinvite.shared;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

/**
 * Jackson-serializable wrapper for Spring's PageImpl.
 *
 * Root cause: PageImpl has no @JsonCreator constructor, so Jackson/Redis
 * can deserialize TO it but cannot reconstruct it FROM the stored JSON.
 * This class adds the required @JsonCreator so cached pages round-trip cleanly.
 *
 * Usage: return new RestPage<>(page) instead of returning Page<T> directly
 * from any @Cacheable method.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RestPage<T> extends PageImpl<T> {

    @JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
    public RestPage(
            @JsonProperty("content")       List<T> content,
            @JsonProperty("number")        int number,
            @JsonProperty("size")          int size,
            @JsonProperty("totalElements") long totalElements) {
        super(content, PageRequest.of(number, size > 0 ? size : 1), totalElements);
    }

    /** Wrap an existing Page — use at the return site of @Cacheable methods. */
    public RestPage(Page<T> page) {
        super(page.getContent(), page.getPageable(), page.getTotalElements());
    }
}
