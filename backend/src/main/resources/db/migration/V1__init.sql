-- Organizations (multi-tenant support)
CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(255),
    role          VARCHAR(50) NOT NULL DEFAULT 'ORG_ADMIN',
    active        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
    slug            VARCHAR(200) UNIQUE NOT NULL,
    title           VARCHAR(500) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    event_date      TIMESTAMPTZ NOT NULL,
    event_end_date  TIMESTAMPTZ,
    timezone        VARCHAR(100) NOT NULL DEFAULT 'UTC',
    description     TEXT,
    og_title        VARCHAR(255),
    og_description  TEXT,
    og_image_url    TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_events_slug   ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_org    ON events(org_id);

-- Layouts (drag-drop sections JSON per event)
CREATE TABLE layouts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id   UUID UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    sections   JSONB NOT NULL DEFAULT '[]',
    version    INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes (CSS design tokens per event)
CREATE TABLE themes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id         UUID UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    primary_color    VARCHAR(20) DEFAULT '#6366f1',
    secondary_color  VARCHAR(20) DEFAULT '#8b5cf6',
    background_color VARCHAR(20) DEFAULT '#ffffff',
    text_color       VARCHAR(20) DEFAULT '#111827',
    accent_color     VARCHAR(20) DEFAULT '#f59e0b',
    font_heading     VARCHAR(100) DEFAULT 'Inter',
    font_body        VARCHAR(100) DEFAULT 'Inter',
    border_radius    VARCHAR(20) DEFAULT '8px',
    tokens           JSONB NOT NULL DEFAULT '{}'
);

-- Custom RSVP fields per event
CREATE TABLE custom_fields (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id      UUID REFERENCES events(id) ON DELETE CASCADE,
    field_key     VARCHAR(100) NOT NULL,
    field_label   VARCHAR(255) NOT NULL,
    field_type    VARCHAR(50) NOT NULL,
    options       JSONB,
    required      BOOLEAN DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    UNIQUE(event_id, field_key)
);

-- Guests (invitees per event)
CREATE TABLE guests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
    name         VARCHAR(255),
    email        VARCHAR(255),
    phone        VARCHAR(50),
    invite_token UUID UNIQUE DEFAULT gen_random_uuid(),
    status       VARCHAR(50) NOT NULL DEFAULT 'INVITED',
    notes        TEXT,
    invited_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_guests_invite_token ON guests(invite_token);
CREATE INDEX idx_guests_event        ON guests(event_id);
CREATE INDEX idx_guests_status       ON guests(event_id, status);

-- RSVP responses
CREATE TABLE rsvp_responses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id     UUID UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
    attending    BOOLEAN NOT NULL,
    plus_ones    INT DEFAULT 0,
    message      TEXT,
    responded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVP custom field values
CREATE TABLE rsvp_field_values (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rsvp_id  UUID REFERENCES rsvp_responses(id) ON DELETE CASCADE,
    field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
    value    TEXT
);

-- Media assets (uploaded to MinIO)
CREATE TABLE media_assets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
    filename    VARCHAR(500) NOT NULL,
    content_type VARCHAR(100),
    size_bytes  BIGINT,
    cdn_url     TEXT NOT NULL,
    object_key  TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_media_event ON media_assets(event_id);

-- Analytics events
CREATE TABLE analytics_events (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
    event_type   VARCHAR(100) NOT NULL,
    invite_token UUID,
    ip_address   VARCHAR(50),
    user_agent   TEXT,
    metadata     JSONB DEFAULT '{}',
    tracked_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analytics_event    ON analytics_events(event_id);
CREATE INDEX idx_analytics_type     ON analytics_events(event_type);
CREATE INDEX idx_analytics_tracked  ON analytics_events(tracked_at);

-- Notification log (stub — replaces email/SMS sending)
CREATE TABLE notification_logs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
    guest_id     UUID REFERENCES guests(id) ON DELETE SET NULL,
    type         VARCHAR(100) NOT NULL,
    channel      VARCHAR(50) NOT NULL DEFAULT 'EMAIL',
    recipient    VARCHAR(500),
    subject      TEXT,
    body         TEXT,
    status       VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sent_at      TIMESTAMPTZ,
    error_msg    TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_event ON notification_logs(event_id);

-- Seed default org + admin user (password: Admin@1234)
INSERT INTO organizations (id, name, slug) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'default');

INSERT INTO users (id, org_id, email, password_hash, name, role) VALUES
    ('00000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     'admin@eventinvite.local',
     '$2a$12$5T9/MxnZ5pxZpXnVYZhZKuISJKlSJniTT06Pa7Iy56HDnqtH6QE6.',
     'System Admin',
     'SUPER_ADMIN');
