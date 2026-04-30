package co.eventinvite.widget;

import co.eventinvite.shared.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/widgets")
public class WidgetController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> catalog() {
        return ResponseEntity.ok(ApiResponse.ok(WidgetCatalog.ALL));
    }
}
