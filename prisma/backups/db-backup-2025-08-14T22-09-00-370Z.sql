--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AdminLevel; Type: TYPE; Schema: public; Owner: kaneko
--

CREATE TYPE public."AdminLevel" AS ENUM (
    'chainadmin',
    'groupadmin',
    'superadmin'
);


ALTER TYPE public."AdminLevel" OWNER TO kaneko;

--
-- Name: CampaignCtaType; Type: TYPE; Schema: public; Owner: kaneko
--

CREATE TYPE public."CampaignCtaType" AS ENUM (
    'NONE',
    'LINK',
    'BUTTON',
    'COUPON'
);


ALTER TYPE public."CampaignCtaType" OWNER TO kaneko;

--
-- Name: CampaignDisplayType; Type: TYPE; Schema: public; Owner: kaneko
--

CREATE TYPE public."CampaignDisplayType" AS ENUM (
    'BANNER',
    'POPUP',
    'NOTIFICATION',
    'FEATURED'
);


ALTER TYPE public."CampaignDisplayType" OWNER TO kaneko;

--
-- Name: CampaignStatus; Type: TYPE; Schema: public; Owner: kaneko
--

CREATE TYPE public."CampaignStatus" AS ENUM (
    'DRAFT',
    'ACTIVE',
    'PAUSED',
    'ENDED',
    'SCHEDULED'
);


ALTER TYPE public."CampaignStatus" OWNER TO kaneko;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    name text NOT NULL,
    domain text,
    status text DEFAULT 'active'::text NOT NULL,
    "contactEmail" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    features text[],
    "planType" text,
    settings jsonb
);


ALTER TABLE public."Tenant" OWNER TO kaneko;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO kaneko;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.admin (
    id text NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    display_name text NOT NULL,
    password_hash text NOT NULL,
    admin_level public."AdminLevel" NOT NULL,
    accessible_group_ids text[],
    accessible_chain_ids text[],
    accessible_tenant_ids text[],
    last_login_at timestamp(3) without time zone,
    login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    totp_secret text,
    totp_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.admin OWNER TO kaneko;

--
-- Name: admin_log; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.admin_log (
    id text NOT NULL,
    admin_id text NOT NULL,
    action text NOT NULL,
    target_type text,
    target_id text,
    ip_address text,
    user_agent text,
    success boolean DEFAULT true NOT NULL,
    error_message text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_log OWNER TO kaneko;

--
-- Name: campaign_categories; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.campaign_categories (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.campaign_categories OWNER TO kaneko;

--
-- Name: campaign_category_relations; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.campaign_category_relations (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.campaign_category_relations OWNER TO kaneko;

--
-- Name: campaign_items; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.campaign_items (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "itemId" text NOT NULL,
    "itemType" text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.campaign_items OWNER TO kaneko;

--
-- Name: campaign_translations; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.campaign_translations (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    description text,
    "imageUrl" text,
    "languageCode" text,
    name text
);


ALTER TABLE public.campaign_translations OWNER TO kaneko;

--
-- Name: campaign_usage_logs; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.campaign_usage_logs (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "userId" text,
    "deviceId" text,
    action text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.campaign_usage_logs OWNER TO kaneko;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.campaigns (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    status public."CampaignStatus" DEFAULT 'DRAFT'::public."CampaignStatus" NOT NULL,
    "displayType" public."CampaignDisplayType" NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    priority integer DEFAULT 0 NOT NULL,
    "ctaType" public."CampaignCtaType" DEFAULT 'NONE'::public."CampaignCtaType" NOT NULL,
    "ctaAction" text,
    "ctaLabel" text,
    "discountType" text,
    "discountValue" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "dayRestrictions" jsonb,
    description text,
    "displayPriority" integer DEFAULT 0 NOT NULL,
    "maxUsageCount" integer,
    name text NOT NULL,
    "timeRestrictions" jsonb,
    "welcomeSettings" jsonb
);


ALTER TABLE public.campaigns OWNER TO kaneko;

--
-- Name: device_video_caches; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.device_video_caches (
    id text NOT NULL,
    "deviceId" text NOT NULL,
    "videoIds" text[],
    "lastShownAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastViewedAt" timestamp(3) without time zone,
    "userId" text,
    viewed boolean DEFAULT false NOT NULL
);


ALTER TABLE public.device_video_caches OWNER TO kaneko;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    tenant_id text NOT NULL,
    type text NOT NULL,
    code text NOT NULL,
    subject text,
    content text NOT NULL,
    variables text[],
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    body text NOT NULL,
    html boolean DEFAULT false NOT NULL,
    locale text NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO kaneko;

--
-- Name: page_histories; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.page_histories (
    "Id" text NOT NULL,
    "PageId" text NOT NULL,
    "Html" text,
    "Css" text,
    "Content" text,
    "Template" text,
    "Version" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "CreatedBy" text
);


ALTER TABLE public.page_histories OWNER TO kaneko;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.pages (
    "Id" text NOT NULL,
    "TenantId" text NOT NULL,
    "Slug" text NOT NULL,
    "Title" text NOT NULL,
    "Html" text,
    "Css" text,
    "Content" text,
    "Template" text,
    "IsPublished" boolean DEFAULT false NOT NULL,
    "PublishedAt" timestamp(3) without time zone,
    "Version" integer DEFAULT 1 NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pages OWNER TO kaneko;

--
-- Name: response_node_translations; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.response_node_translations (
    id text NOT NULL,
    "nodeId" text NOT NULL,
    locale text NOT NULL,
    content text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    answer jsonb,
    language text,
    title text
);


ALTER TABLE public.response_node_translations OWNER TO kaneko;

--
-- Name: response_nodes; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.response_nodes (
    id text NOT NULL,
    "treeId" text NOT NULL,
    "nodeType" text NOT NULL,
    content text,
    metadata jsonb,
    "isRoot" boolean DEFAULT false NOT NULL,
    "parentId" text,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    answer jsonb,
    description text,
    icon text,
    "order" integer DEFAULT 0 NOT NULL,
    title text,
    type text
);


ALTER TABLE public.response_nodes OWNER TO kaneko;

--
-- Name: response_tree_history; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.response_tree_history (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "nodeId" text NOT NULL,
    response text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.response_tree_history OWNER TO kaneko;

--
-- Name: response_tree_mobile_links; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.response_tree_mobile_links (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    code text NOT NULL,
    "qrCodeData" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "connectionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "connectedAt" timestamp(3) without time zone,
    "deviceId" integer
);


ALTER TABLE public.response_tree_mobile_links OWNER TO kaneko;

--
-- Name: response_tree_sessions; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.response_tree_sessions (
    id text NOT NULL,
    "treeId" text NOT NULL,
    "userId" text,
    "deviceId" text,
    "currentNodeId" text,
    metadata jsonb,
    "isComplete" boolean DEFAULT false NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "endedAt" timestamp(3) without time zone,
    "interfaceType" text,
    language text,
    "lastActivityAt" timestamp(3) without time zone,
    "roomId" text,
    "sessionId" text NOT NULL
);


ALTER TABLE public.response_tree_sessions OWNER TO kaneko;

--
-- Name: response_tree_versions; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.response_tree_versions (
    id text NOT NULL,
    "treeId" text NOT NULL,
    version integer NOT NULL,
    snapshot jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text,
    data jsonb
);


ALTER TABLE public.response_tree_versions OWNER TO kaneko;

--
-- Name: response_trees; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.response_trees (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    description text,
    "isPublished" boolean DEFAULT false NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.response_trees OWNER TO kaneko;

--
-- Name: room_grades; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.room_grades (
    id text NOT NULL,
    tenant_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.room_grades OWNER TO kaneko;

--
-- Name: schema_version; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.schema_version (
    version text NOT NULL,
    description text NOT NULL,
    rollback_sql text,
    applied_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    applied_by text
);


ALTER TABLE public.schema_version OWNER TO kaneko;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.staff (
    id text NOT NULL,
    tenant_id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    department text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.staff OWNER TO kaneko;

--
-- Name: system_event; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.system_event (
    id text NOT NULL,
    tenant_id text NOT NULL,
    user_id text,
    event_type text NOT NULL,
    source_system text NOT NULL,
    target_system text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    action text NOT NULL,
    event_data jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at timestamp(3) without time zone,
    status text DEFAULT 'PENDING'::text NOT NULL
);


ALTER TABLE public.system_event OWNER TO kaneko;

--
-- Name: tenant_access_logs; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.tenant_access_logs (
    id text NOT NULL,
    tenant_id text NOT NULL,
    user_id text,
    action text NOT NULL,
    resource text,
    ip_address text,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    source_system text
);


ALTER TABLE public.tenant_access_logs OWNER TO kaneko;

--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Tenant" (id, name, domain, status, "contactEmail", "createdAt", features, "planType", settings) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
947dd9cc-a75d-4197-a5b1-3c63bb15f81f	b14607547680653a6d5b8d70db0f10c692e82d4c255f319224b89628725e3cab	2025-08-11 18:44:30.300536+09	20250716082406_initial_unified_infrastructure	\N	\N	2025-08-11 18:44:30.281709+09	1
649d1ad0-955b-4485-b430-5000ee78ab49	789e90ac70bee44c69a7d52108fb8582e8395e6c1c97b3b4a828f5719b65125d	2025-08-11 18:44:30.312762+09	20250723043735_add_room_grades_and_member_access	\N	\N	2025-08-11 18:44:30.301171+09	1
52e00776-5ef0-49b5-b8e0-299996db9d15	e4621eecc9e60906057fb0e5753d0f53c482c5776e47b0e37e189e587c79d2e2	2025-08-11 18:44:30.474198+09	20250728005730_add_staff_management_system	\N	\N	2025-08-11 18:44:30.313743+09	1
03da7538-240c-41da-98d0-3c661bf12caf	7882814a1eac4b5e5c9fd74392d3d9218cfcddab3a016c7a53e154541218ea1a	\N	20250731020156_add_tenant_service_management	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250731020156_add_tenant_service_management\n\nDatabase error code: 42P01\n\nDatabase error:\nERROR: relation "service_usage_statistics" does not exist\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P01), message: "relation \\"service_usage_statistics\\" does not exist", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("namespace.c"), line: Some(436), routine: Some("RangeVarGetRelidExtended") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250731020156_add_tenant_service_management"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250731020156_add_tenant_service_management"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:226	\N	2025-08-11 18:44:30.474484+09	0
\.


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.admin (id, email, username, display_name, password_hash, admin_level, accessible_group_ids, accessible_chain_ids, accessible_tenant_ids, last_login_at, login_attempts, locked_until, totp_secret, totp_enabled, created_at, updated_at, created_by, is_active) FROM stdin;
\.


--
-- Data for Name: admin_log; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.admin_log (id, admin_id, action, target_type, target_id, ip_address, user_agent, success, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: campaign_categories; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.campaign_categories (id, "tenantId", code, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: campaign_category_relations; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.campaign_category_relations (id, "campaignId", "categoryId", "createdAt") FROM stdin;
\.


--
-- Data for Name: campaign_items; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.campaign_items (id, "campaignId", "itemId", "itemType", priority, "createdAt") FROM stdin;
\.


--
-- Data for Name: campaign_translations; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.campaign_translations (id, "campaignId", locale, title, description, "imageUrl", "languageCode", name) FROM stdin;
\.


--
-- Data for Name: campaign_usage_logs; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.campaign_usage_logs (id, "campaignId", "userId", "deviceId", action, "createdAt") FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.campaigns (id, "tenantId", code, status, "displayType", "startDate", "endDate", priority, "ctaType", "ctaAction", "ctaLabel", "discountType", "discountValue", "createdAt", "updatedAt", "dayRestrictions", description, "displayPriority", "maxUsageCount", name, "timeRestrictions", "welcomeSettings") FROM stdin;
\.


--
-- Data for Name: device_video_caches; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.device_video_caches (id, "deviceId", "videoIds", "lastShownAt", "updatedAt", "lastViewedAt", "userId", viewed) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.notification_templates (id, tenant_id, type, code, subject, content, variables, is_active, created_at, updated_at, body, html, locale) FROM stdin;
\.


--
-- Data for Name: page_histories; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.page_histories ("Id", "PageId", "Html", "Css", "Content", "Template", "Version", "CreatedAt", "CreatedBy") FROM stdin;
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.pages ("Id", "TenantId", "Slug", "Title", "Html", "Css", "Content", "Template", "IsPublished", "PublishedAt", "Version", "CreatedAt", "UpdatedAt") FROM stdin;
\.


--
-- Data for Name: response_node_translations; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.response_node_translations (id, "nodeId", locale, content, "createdAt", "updatedAt", answer, language, title) FROM stdin;
\.


--
-- Data for Name: response_nodes; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.response_nodes (id, "treeId", "nodeType", content, metadata, "isRoot", "parentId", "position", "createdAt", "updatedAt", answer, description, icon, "order", title, type) FROM stdin;
\.


--
-- Data for Name: response_tree_history; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.response_tree_history (id, "sessionId", "nodeId", response, metadata, "createdAt", action, "timestamp") FROM stdin;
\.


--
-- Data for Name: response_tree_mobile_links; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.response_tree_mobile_links (id, "sessionId", code, "qrCodeData", "isActive", "connectionId", "createdAt", "expiresAt", "connectedAt", "deviceId") FROM stdin;
\.


--
-- Data for Name: response_tree_sessions; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.response_tree_sessions (id, "treeId", "userId", "deviceId", "currentNodeId", metadata, "isComplete", "startedAt", "updatedAt", "completedAt", "endedAt", "interfaceType", language, "lastActivityAt", "roomId", "sessionId") FROM stdin;
\.


--
-- Data for Name: response_tree_versions; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.response_tree_versions (id, "treeId", version, snapshot, "createdAt", "createdBy", data) FROM stdin;
\.


--
-- Data for Name: response_trees; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.response_trees (id, "tenantId", name, description, "isPublished", "publishedAt", version, "createdAt", "updatedAt", "isActive") FROM stdin;
\.


--
-- Data for Name: room_grades; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.room_grades (id, tenant_id, code, name, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_version; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.schema_version (version, description, rollback_sql, applied_at, applied_by) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.staff (id, tenant_id, email, name, role, department, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_event; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.system_event (id, tenant_id, user_id, event_type, source_system, target_system, entity_type, entity_id, action, event_data, created_at, processed_at, status) FROM stdin;
\.


--
-- Data for Name: tenant_access_logs; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.tenant_access_logs (id, tenant_id, user_id, action, resource, ip_address, user_agent, created_at, source_system) FROM stdin;
\.


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_log admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.admin_log
    ADD CONSTRAINT admin_log_pkey PRIMARY KEY (id);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- Name: campaign_categories campaign_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_categories
    ADD CONSTRAINT campaign_categories_pkey PRIMARY KEY (id);


--
-- Name: campaign_category_relations campaign_category_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_category_relations
    ADD CONSTRAINT campaign_category_relations_pkey PRIMARY KEY (id);


--
-- Name: campaign_items campaign_items_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_items
    ADD CONSTRAINT campaign_items_pkey PRIMARY KEY (id);


--
-- Name: campaign_translations campaign_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_translations
    ADD CONSTRAINT campaign_translations_pkey PRIMARY KEY (id);


--
-- Name: campaign_usage_logs campaign_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_usage_logs
    ADD CONSTRAINT campaign_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: device_video_caches device_video_caches_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.device_video_caches
    ADD CONSTRAINT device_video_caches_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: page_histories page_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.page_histories
    ADD CONSTRAINT page_histories_pkey PRIMARY KEY ("Id");


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY ("Id");


--
-- Name: response_node_translations response_node_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_node_translations
    ADD CONSTRAINT response_node_translations_pkey PRIMARY KEY (id);


--
-- Name: response_nodes response_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_nodes
    ADD CONSTRAINT response_nodes_pkey PRIMARY KEY (id);


--
-- Name: response_tree_history response_tree_history_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_history
    ADD CONSTRAINT response_tree_history_pkey PRIMARY KEY (id);


--
-- Name: response_tree_mobile_links response_tree_mobile_links_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_mobile_links
    ADD CONSTRAINT response_tree_mobile_links_pkey PRIMARY KEY (id);


--
-- Name: response_tree_sessions response_tree_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_sessions
    ADD CONSTRAINT response_tree_sessions_pkey PRIMARY KEY (id);


--
-- Name: response_tree_versions response_tree_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_versions
    ADD CONSTRAINT response_tree_versions_pkey PRIMARY KEY (id);


--
-- Name: response_trees response_trees_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_trees
    ADD CONSTRAINT response_trees_pkey PRIMARY KEY (id);


--
-- Name: room_grades room_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.room_grades
    ADD CONSTRAINT room_grades_pkey PRIMARY KEY (id);


--
-- Name: schema_version schema_version_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.schema_version
    ADD CONSTRAINT schema_version_pkey PRIMARY KEY (version);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: system_event system_event_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.system_event
    ADD CONSTRAINT system_event_pkey PRIMARY KEY (id);


--
-- Name: tenant_access_logs tenant_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.tenant_access_logs
    ADD CONSTRAINT tenant_access_logs_pkey PRIMARY KEY (id);


--
-- Name: Tenant_domain_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Tenant_domain_key" ON public."Tenant" USING btree (domain);


--
-- Name: admin_email_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX admin_email_key ON public.admin USING btree (email);


--
-- Name: admin_log_action_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX admin_log_action_idx ON public.admin_log USING btree (action);


--
-- Name: admin_log_admin_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX admin_log_admin_id_idx ON public.admin_log USING btree (admin_id);


--
-- Name: admin_log_created_at_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX admin_log_created_at_idx ON public.admin_log USING btree (created_at);


--
-- Name: admin_username_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX admin_username_key ON public.admin USING btree (username);


--
-- Name: campaign_categories_code_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX campaign_categories_code_key ON public.campaign_categories USING btree (code);


--
-- Name: campaign_categories_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "campaign_categories_tenantId_idx" ON public.campaign_categories USING btree ("tenantId");


--
-- Name: campaign_category_relations_campaignId_categoryId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "campaign_category_relations_campaignId_categoryId_key" ON public.campaign_category_relations USING btree ("campaignId", "categoryId");


--
-- Name: campaign_items_campaignId_itemId_itemType_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "campaign_items_campaignId_itemId_itemType_key" ON public.campaign_items USING btree ("campaignId", "itemId", "itemType");


--
-- Name: campaign_translations_campaignId_locale_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "campaign_translations_campaignId_locale_key" ON public.campaign_translations USING btree ("campaignId", locale);


--
-- Name: campaign_translations_languageCode_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "campaign_translations_languageCode_idx" ON public.campaign_translations USING btree ("languageCode");


--
-- Name: campaign_usage_logs_campaignId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "campaign_usage_logs_campaignId_idx" ON public.campaign_usage_logs USING btree ("campaignId");


--
-- Name: campaign_usage_logs_deviceId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "campaign_usage_logs_deviceId_idx" ON public.campaign_usage_logs USING btree ("deviceId");


--
-- Name: campaign_usage_logs_userId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "campaign_usage_logs_userId_idx" ON public.campaign_usage_logs USING btree ("userId");


--
-- Name: campaigns_code_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX campaigns_code_key ON public.campaigns USING btree (code);


--
-- Name: campaigns_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "campaigns_startDate_endDate_idx" ON public.campaigns USING btree ("startDate", "endDate");


--
-- Name: campaigns_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX campaigns_status_idx ON public.campaigns USING btree (status);


--
-- Name: campaigns_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "campaigns_tenantId_idx" ON public.campaigns USING btree ("tenantId");


--
-- Name: device_video_caches_deviceId_userId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "device_video_caches_deviceId_userId_key" ON public.device_video_caches USING btree ("deviceId", "userId");


--
-- Name: notification_templates_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX notification_templates_tenant_id_idx ON public.notification_templates USING btree (tenant_id);


--
-- Name: notification_templates_tenant_id_type_code_locale_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX notification_templates_tenant_id_type_code_locale_key ON public.notification_templates USING btree (tenant_id, type, code, locale);


--
-- Name: notification_templates_type_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX notification_templates_type_idx ON public.notification_templates USING btree (type);


--
-- Name: page_histories_PageId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "page_histories_PageId_idx" ON public.page_histories USING btree ("PageId");


--
-- Name: page_histories_Version_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "page_histories_Version_idx" ON public.page_histories USING btree ("Version");


--
-- Name: pages_IsPublished_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "pages_IsPublished_idx" ON public.pages USING btree ("IsPublished");


--
-- Name: pages_Slug_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "pages_Slug_idx" ON public.pages USING btree ("Slug");


--
-- Name: pages_TenantId_Slug_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "pages_TenantId_Slug_key" ON public.pages USING btree ("TenantId", "Slug");


--
-- Name: pages_TenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "pages_TenantId_idx" ON public.pages USING btree ("TenantId");


--
-- Name: response_node_translations_nodeId_language_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "response_node_translations_nodeId_language_key" ON public.response_node_translations USING btree ("nodeId", language);


--
-- Name: response_node_translations_nodeId_locale_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "response_node_translations_nodeId_locale_key" ON public.response_node_translations USING btree ("nodeId", locale);


--
-- Name: response_nodes_isRoot_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_nodes_isRoot_idx" ON public.response_nodes USING btree ("isRoot");


--
-- Name: response_nodes_parentId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_nodes_parentId_idx" ON public.response_nodes USING btree ("parentId");


--
-- Name: response_nodes_treeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_nodes_treeId_idx" ON public.response_nodes USING btree ("treeId");


--
-- Name: response_tree_history_sessionId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_tree_history_sessionId_idx" ON public.response_tree_history USING btree ("sessionId");


--
-- Name: response_tree_mobile_links_code_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX response_tree_mobile_links_code_idx ON public.response_tree_mobile_links USING btree (code);


--
-- Name: response_tree_mobile_links_code_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX response_tree_mobile_links_code_key ON public.response_tree_mobile_links USING btree (code);


--
-- Name: response_tree_mobile_links_isActive_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_tree_mobile_links_isActive_idx" ON public.response_tree_mobile_links USING btree ("isActive");


--
-- Name: response_tree_sessions_deviceId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_tree_sessions_deviceId_idx" ON public.response_tree_sessions USING btree ("deviceId");


--
-- Name: response_tree_sessions_isComplete_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_tree_sessions_isComplete_idx" ON public.response_tree_sessions USING btree ("isComplete");


--
-- Name: response_tree_sessions_sessionId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "response_tree_sessions_sessionId_key" ON public.response_tree_sessions USING btree ("sessionId");


--
-- Name: response_tree_sessions_treeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_tree_sessions_treeId_idx" ON public.response_tree_sessions USING btree ("treeId");


--
-- Name: response_tree_sessions_userId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_tree_sessions_userId_idx" ON public.response_tree_sessions USING btree ("userId");


--
-- Name: response_tree_versions_treeId_version_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "response_tree_versions_treeId_version_key" ON public.response_tree_versions USING btree ("treeId", version);


--
-- Name: response_trees_isPublished_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_trees_isPublished_idx" ON public.response_trees USING btree ("isPublished");


--
-- Name: response_trees_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "response_trees_tenantId_idx" ON public.response_trees USING btree ("tenantId");


--
-- Name: room_grades_tenant_id_code_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX room_grades_tenant_id_code_key ON public.room_grades USING btree (tenant_id, code);


--
-- Name: room_grades_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX room_grades_tenant_id_idx ON public.room_grades USING btree (tenant_id);


--
-- Name: staff_role_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX staff_role_idx ON public.staff USING btree (role);


--
-- Name: staff_tenant_id_email_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX staff_tenant_id_email_key ON public.staff USING btree (tenant_id, email);


--
-- Name: staff_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX staff_tenant_id_idx ON public.staff USING btree (tenant_id);


--
-- Name: system_event_created_at_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX system_event_created_at_idx ON public.system_event USING btree (created_at);


--
-- Name: system_event_event_type_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX system_event_event_type_idx ON public.system_event USING btree (event_type);


--
-- Name: system_event_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX system_event_status_idx ON public.system_event USING btree (status);


--
-- Name: system_event_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX system_event_tenant_id_idx ON public.system_event USING btree (tenant_id);


--
-- Name: tenant_access_logs_created_at_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX tenant_access_logs_created_at_idx ON public.tenant_access_logs USING btree (created_at);


--
-- Name: tenant_access_logs_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX tenant_access_logs_tenant_id_idx ON public.tenant_access_logs USING btree (tenant_id);


--
-- Name: tenant_access_logs_user_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX tenant_access_logs_user_id_idx ON public.tenant_access_logs USING btree (user_id);


--
-- Name: admin_log admin_log_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.admin_log
    ADD CONSTRAINT admin_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: campaign_category_relations campaign_category_relations_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_category_relations
    ADD CONSTRAINT "campaign_category_relations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: campaign_category_relations campaign_category_relations_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_category_relations
    ADD CONSTRAINT "campaign_category_relations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.campaign_categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: campaign_items campaign_items_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_items
    ADD CONSTRAINT "campaign_items_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: campaign_translations campaign_translations_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_translations
    ADD CONSTRAINT "campaign_translations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: campaign_usage_logs campaign_usage_logs_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.campaign_usage_logs
    ADD CONSTRAINT "campaign_usage_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: page_histories page_histories_PageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.page_histories
    ADD CONSTRAINT "page_histories_PageId_fkey" FOREIGN KEY ("PageId") REFERENCES public.pages("Id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pages pages_TenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT "pages_TenantId_fkey" FOREIGN KEY ("TenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: response_node_translations response_node_translations_nodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_node_translations
    ADD CONSTRAINT "response_node_translations_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES public.response_nodes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: response_nodes response_nodes_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_nodes
    ADD CONSTRAINT "response_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.response_nodes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: response_nodes response_nodes_treeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_nodes
    ADD CONSTRAINT "response_nodes_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES public.response_trees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: response_tree_history response_tree_history_nodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_history
    ADD CONSTRAINT "response_tree_history_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES public.response_nodes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: response_tree_history response_tree_history_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_history
    ADD CONSTRAINT "response_tree_history_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.response_tree_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: response_tree_mobile_links response_tree_mobile_links_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_mobile_links
    ADD CONSTRAINT "response_tree_mobile_links_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.response_tree_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: response_tree_sessions response_tree_sessions_currentNodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_sessions
    ADD CONSTRAINT "response_tree_sessions_currentNodeId_fkey" FOREIGN KEY ("currentNodeId") REFERENCES public.response_nodes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: response_tree_sessions response_tree_sessions_treeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_sessions
    ADD CONSTRAINT "response_tree_sessions_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES public.response_trees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: response_tree_versions response_tree_versions_treeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.response_tree_versions
    ADD CONSTRAINT "response_tree_versions_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES public.response_trees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: kaneko
--

GRANT ALL ON SCHEMA public TO hotel_app;


--
-- Name: TABLE "Tenant"; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public."Tenant" TO hotel_app;


--
-- Name: TABLE _prisma_migrations; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public._prisma_migrations TO hotel_app;


--
-- Name: TABLE admin; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.admin TO hotel_app;


--
-- Name: TABLE admin_log; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.admin_log TO hotel_app;


--
-- Name: TABLE campaign_categories; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_categories TO hotel_app;


--
-- Name: TABLE campaign_category_relations; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_category_relations TO hotel_app;


--
-- Name: TABLE campaign_items; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_items TO hotel_app;


--
-- Name: TABLE campaign_translations; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_translations TO hotel_app;


--
-- Name: TABLE campaign_usage_logs; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaign_usage_logs TO hotel_app;


--
-- Name: TABLE campaigns; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.campaigns TO hotel_app;


--
-- Name: TABLE device_video_caches; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.device_video_caches TO hotel_app;


--
-- Name: TABLE notification_templates; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.notification_templates TO hotel_app;


--
-- Name: TABLE page_histories; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.page_histories TO hotel_app;


--
-- Name: TABLE pages; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.pages TO hotel_app;


--
-- Name: TABLE response_node_translations; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.response_node_translations TO hotel_app;


--
-- Name: TABLE response_nodes; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.response_nodes TO hotel_app;


--
-- Name: TABLE response_tree_history; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.response_tree_history TO hotel_app;


--
-- Name: TABLE response_tree_mobile_links; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.response_tree_mobile_links TO hotel_app;


--
-- Name: TABLE response_tree_sessions; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.response_tree_sessions TO hotel_app;


--
-- Name: TABLE response_tree_versions; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.response_tree_versions TO hotel_app;


--
-- Name: TABLE response_trees; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.response_trees TO hotel_app;


--
-- Name: TABLE room_grades; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.room_grades TO hotel_app;


--
-- Name: TABLE schema_version; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.schema_version TO hotel_app;


--
-- Name: TABLE staff; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.staff TO hotel_app;


--
-- Name: TABLE system_event; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.system_event TO hotel_app;


--
-- Name: TABLE tenant_access_logs; Type: ACL; Schema: public; Owner: kaneko
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.tenant_access_logs TO hotel_app;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: kaneko
--

ALTER DEFAULT PRIVILEGES FOR ROLE kaneko IN SCHEMA public GRANT ALL ON SEQUENCES  TO hotel_app;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: kaneko
--

ALTER DEFAULT PRIVILEGES FOR ROLE kaneko IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO hotel_app;


--
-- PostgreSQL database dump complete
--

