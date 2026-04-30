package co.eventinvite.auth;

import co.eventinvite.auth.dto.*;
import co.eventinvite.auth.entity.*;
import co.eventinvite.auth.repository.UserRepository;
import co.eventinvite.shared.exception.BadRequestException;
import co.eventinvite.shared.exception.ConflictException;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new ConflictException("Email already in use");
        }

        // Create org
        String orgSlug = req.orgName() != null
                ? req.orgName().toLowerCase().replaceAll("[^a-z0-9]", "-")
                : req.email().split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "-");

        UUID orgId = UUID.randomUUID();
        em.createNativeQuery(
                "INSERT INTO organizations(id, name, slug) VALUES (?1, ?2, ?3)")
                .setParameter(1, orgId)
                .setParameter(2, req.orgName() != null ? req.orgName() : req.name() + "'s Organization")
                .setParameter(3, orgSlug + "-" + orgId.toString().substring(0, 8))
                .executeUpdate();

        User user = User.builder()
                .orgId(orgId)
                .email(req.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.password()))
                .name(req.name())
                .role(UserRole.ORG_ADMIN)
                .active(true)
                .build();

        user = userRepository.save(user);
        return buildTokens(user);
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = userRepository.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return buildTokens(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }
        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return buildTokens(user);
    }

    public UserDto me(String token) {
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return toDto(user);
    }

    private AuthResponse buildTokens(User user) {
        Map<String, Object> claims = Map.of(
                "role", user.getRole().name(),
                "orgId", user.getOrgId() != null ? user.getOrgId().toString() : "",
                "name", user.getName() != null ? user.getName() : ""
        );
        String access = jwtUtil.generateAccessToken(user.getEmail(), claims);
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());
        return new AuthResponse(access, refresh, toDto(user));
    }

    private UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.getOrgId());
    }
}
