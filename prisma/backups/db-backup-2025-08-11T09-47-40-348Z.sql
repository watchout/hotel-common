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
-- Name: CreditCategory; Type: TYPE; Schema: public; Owner: kaneko
--

CREATE TYPE public."CreditCategory" AS ENUM (
    'CONCIERGE',
    'MARKETING_ANALYSIS',
    'PAGE_AUTOGEN'
);


ALTER TYPE public."CreditCategory" OWNER TO kaneko;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: kaneko
--

CREATE TYPE public."Role" AS ENUM (
    'super_admin',
    'store_admin',
    'staff'
);


ALTER TYPE public."Role" OWNER TO kaneko;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdminAccessLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AdminAccessLog" (
    id integer NOT NULL,
    path text NOT NULL,
    method text NOT NULL,
    "userId" text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AdminAccessLog" OWNER TO kaneko;

--
-- Name: AdminAccessLog_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AdminAccessLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AdminAccessLog_id_seq" OWNER TO kaneko;

--
-- Name: AdminAccessLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AdminAccessLog_id_seq" OWNED BY public."AdminAccessLog".id;


--
-- Name: AiConversation; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AiConversation" (
    id integer NOT NULL,
    "sessionId" text NOT NULL,
    "roomId" text,
    "deviceId" integer,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) without time zone,
    language text DEFAULT 'ja'::text NOT NULL
);


ALTER TABLE public."AiConversation" OWNER TO kaneko;

--
-- Name: AiConversation_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AiConversation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AiConversation_id_seq" OWNER TO kaneko;

--
-- Name: AiConversation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AiConversation_id_seq" OWNED BY public."AiConversation".id;


--
-- Name: AiCreditPlan; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AiCreditPlan" (
    id integer NOT NULL,
    month text NOT NULL,
    "baseCreditsUsd" numeric(65,30) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdBy" text NOT NULL
);


ALTER TABLE public."AiCreditPlan" OWNER TO kaneko;

--
-- Name: AiCreditPlan_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AiCreditPlan_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AiCreditPlan_id_seq" OWNER TO kaneko;

--
-- Name: AiCreditPlan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AiCreditPlan_id_seq" OWNED BY public."AiCreditPlan".id;


--
-- Name: AiCreditTopUp; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AiCreditTopUp" (
    id integer NOT NULL,
    "planId" integer NOT NULL,
    "amountUsd" numeric(65,30) NOT NULL,
    "purchasedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text
);


ALTER TABLE public."AiCreditTopUp" OWNER TO kaneko;

--
-- Name: AiCreditTopUp_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AiCreditTopUp_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AiCreditTopUp_id_seq" OWNER TO kaneko;

--
-- Name: AiCreditTopUp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AiCreditTopUp_id_seq" OWNED BY public."AiCreditTopUp".id;


--
-- Name: AiCreditUsage; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AiCreditUsage" (
    id integer NOT NULL,
    "conversationId" integer,
    "modelId" integer NOT NULL,
    "promptTokens" integer NOT NULL,
    "completionTokens" integer NOT NULL,
    "costUsd" numeric(65,30) NOT NULL,
    category public."CreditCategory" DEFAULT 'CONCIERGE'::public."CreditCategory" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AiCreditUsage" OWNER TO kaneko;

--
-- Name: AiCreditUsage_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AiCreditUsage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AiCreditUsage_id_seq" OWNER TO kaneko;

--
-- Name: AiCreditUsage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AiCreditUsage_id_seq" OWNED BY public."AiCreditUsage".id;


--
-- Name: AiKnowledgeBase; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AiKnowledgeBase" (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    "fileType" text NOT NULL,
    "filePath" text NOT NULL,
    language text DEFAULT 'ja'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    vectorized boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AiKnowledgeBase" OWNER TO kaneko;

--
-- Name: AiKnowledgeBase_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AiKnowledgeBase_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AiKnowledgeBase_id_seq" OWNER TO kaneko;

--
-- Name: AiKnowledgeBase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AiKnowledgeBase_id_seq" OWNED BY public."AiKnowledgeBase".id;


--
-- Name: AiMessage; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AiMessage" (
    id integer NOT NULL,
    "conversationId" integer NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AiMessage" OWNER TO kaneko;

--
-- Name: AiMessage_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AiMessage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AiMessage_id_seq" OWNER TO kaneko;

--
-- Name: AiMessage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AiMessage_id_seq" OWNED BY public."AiMessage".id;


--
-- Name: AiModel; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AiModel" (
    id integer NOT NULL,
    name text NOT NULL,
    provider text DEFAULT 'openai'::text NOT NULL,
    "promptPriceUsd" numeric(65,30) NOT NULL,
    "completionPriceUsd" numeric(65,30) NOT NULL,
    "autoMargin" double precision DEFAULT 10.0 NOT NULL,
    "creditOverride" integer,
    description text,
    "useCase" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AiModel" OWNER TO kaneko;

--
-- Name: AiModel_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AiModel_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AiModel_id_seq" OWNER TO kaneko;

--
-- Name: AiModel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AiModel_id_seq" OWNED BY public."AiModel".id;


--
-- Name: AiUsageLimit; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AiUsageLimit" (
    id integer NOT NULL,
    "deviceType" text,
    "maxQueriesPerHour" integer NOT NULL,
    "maxQueriesPerDay" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AiUsageLimit" OWNER TO kaneko;

--
-- Name: AiUsageLimit_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."AiUsageLimit_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AiUsageLimit_id_seq" OWNER TO kaneko;

--
-- Name: AiUsageLimit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."AiUsageLimit_id_seq" OWNED BY public."AiUsageLimit".id;


--
-- Name: Attendance; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Attendance" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    staff_id text NOT NULL,
    staff_number text NOT NULL,
    work_date timestamp(3) without time zone NOT NULL,
    clock_in_time timestamp(3) without time zone NOT NULL,
    clock_out_time timestamp(3) without time zone,
    break_start_time timestamp(3) without time zone,
    break_end_time timestamp(3) without time zone,
    work_duration_minutes integer,
    overtime_minutes integer DEFAULT 0 NOT NULL,
    break_duration_minutes integer DEFAULT 0 NOT NULL,
    attendance_status text DEFAULT 'present'::text NOT NULL,
    notes text,
    approved_by_staff_id text,
    approved_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Attendance" OWNER TO kaneko;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    staff_id text,
    staff_number text,
    staff_name text,
    table_name text NOT NULL,
    record_id text NOT NULL,
    operation text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    changed_fields jsonb,
    session_id text,
    ip_address text,
    user_agent text,
    request_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO kaneko;

--
-- Name: BillingAdjustmentLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."BillingAdjustmentLog" (
    id integer NOT NULL,
    "placeId" integer NOT NULL,
    "orderId" integer,
    "adjustmentType" text NOT NULL,
    "itemName" text NOT NULL,
    "originalValue" text NOT NULL,
    "adjustedValue" text NOT NULL,
    reason text NOT NULL,
    "staffName" text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BillingAdjustmentLog" OWNER TO kaneko;

--
-- Name: BillingAdjustmentLog_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."BillingAdjustmentLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BillingAdjustmentLog_id_seq" OWNER TO kaneko;

--
-- Name: BillingAdjustmentLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."BillingAdjustmentLog_id_seq" OWNED BY public."BillingAdjustmentLog".id;


--
-- Name: BillingSetting; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."BillingSetting" (
    id integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "baseFeeYen" integer DEFAULT 20000 NOT NULL,
    "includedDevices" integer DEFAULT 20 NOT NULL,
    "extraDeviceFeeYen" integer DEFAULT 1000 NOT NULL,
    "includedAiCredits" integer DEFAULT 100 NOT NULL,
    "extraAiCreditAmount" integer DEFAULT 100 NOT NULL,
    "extraAiCreditFeeYen" integer DEFAULT 1000 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BillingSetting" OWNER TO kaneko;

--
-- Name: BillingSetting_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."BillingSetting_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BillingSetting_id_seq" OWNER TO kaneko;

--
-- Name: BillingSetting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."BillingSetting_id_seq" OWNED BY public."BillingSetting".id;


--
-- Name: Category; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    name_ja text NOT NULL,
    description text,
    "parentId" integer,
    "order" integer DEFAULT 0 NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    image text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Category" OWNER TO kaneko;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Category_id_seq" OWNER TO kaneko;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: ComboMeta; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."ComboMeta" (
    id integer NOT NULL,
    "structureType" text NOT NULL,
    "categoryTagId" integer,
    "fixedItemId" integer,
    "requiredOpts" jsonb,
    "addonOpts" jsonb
);


ALTER TABLE public."ComboMeta" OWNER TO kaneko;

--
-- Name: ComboMeta_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."ComboMeta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ComboMeta_id_seq" OWNER TO kaneko;

--
-- Name: ComboMeta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."ComboMeta_id_seq" OWNED BY public."ComboMeta".id;


--
-- Name: ConciergeCharacter; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."ConciergeCharacter" (
    id integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    "imageUrl" text,
    friendly integer DEFAULT 70 NOT NULL,
    humor integer DEFAULT 50 NOT NULL,
    politeness integer DEFAULT 60 NOT NULL,
    "toneTemplate" text DEFAULT '敬語'::text NOT NULL,
    "endingPhrase" text DEFAULT 'です。'::text NOT NULL,
    "rawDescription" text,
    "promptSummary" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ConciergeCharacter" OWNER TO kaneko;

--
-- Name: DeviceAccessLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."DeviceAccessLog" (
    id integer NOT NULL,
    "deviceId" integer NOT NULL,
    "accessTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ipAddress" text NOT NULL,
    "userAgent" text NOT NULL,
    status text NOT NULL,
    "pagePath" text,
    "sessionId" text
);


ALTER TABLE public."DeviceAccessLog" OWNER TO kaneko;

--
-- Name: DeviceAccessLog_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."DeviceAccessLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DeviceAccessLog_id_seq" OWNER TO kaneko;

--
-- Name: DeviceAccessLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."DeviceAccessLog_id_seq" OWNED BY public."DeviceAccessLog".id;


--
-- Name: DeviceRoom; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."DeviceRoom" (
    id integer NOT NULL,
    "tenantId" text NOT NULL,
    "macAddress" text,
    "ipAddress" text,
    "deviceName" text NOT NULL,
    "roomId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastUsedAt" timestamp(3) without time zone,
    "deviceType" text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "placeId" integer
);


ALTER TABLE public."DeviceRoom" OWNER TO kaneko;

--
-- Name: DeviceRoom_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."DeviceRoom_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DeviceRoom_id_seq" OWNER TO kaneko;

--
-- Name: DeviceRoom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."DeviceRoom_id_seq" OWNED BY public."DeviceRoom".id;


--
-- Name: DeviceSecret; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."DeviceSecret" (
    id integer NOT NULL,
    "roomId" text NOT NULL,
    secret text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."DeviceSecret" OWNER TO kaneko;

--
-- Name: DeviceSecret_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."DeviceSecret_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DeviceSecret_id_seq" OWNER TO kaneko;

--
-- Name: DeviceSecret_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."DeviceSecret_id_seq" OWNED BY public."DeviceSecret".id;


--
-- Name: GooglePlayApp; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."GooglePlayApp" (
    id text NOT NULL,
    "packageName" text NOT NULL,
    "displayName" text NOT NULL,
    description text,
    "iconUrl" text,
    category text NOT NULL,
    "deepLinkUrl" text NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GooglePlayApp" OWNER TO kaneko;

--
-- Name: Guest; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Guest" (
    id integer NOT NULL,
    "roomStatusId" integer NOT NULL,
    "guestNumber" integer NOT NULL,
    "ageGroup" text NOT NULL,
    gender text NOT NULL,
    name text,
    phone text,
    email text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Guest" OWNER TO kaneko;

--
-- Name: Guest_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."Guest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Guest_id_seq" OWNER TO kaneko;

--
-- Name: Guest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."Guest_id_seq" OWNED BY public."Guest".id;


--
-- Name: HandoverNote; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."HandoverNote" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    from_staff_id text NOT NULL,
    to_staff_id text,
    to_department text,
    shift_handover_id text,
    title text NOT NULL,
    content text NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    category text NOT NULL,
    related_reservation_id text,
    related_room_id text,
    related_customer_id text,
    photo_urls jsonb DEFAULT '[]'::jsonb NOT NULL,
    video_urls jsonb DEFAULT '[]'::jsonb NOT NULL,
    document_urls jsonb DEFAULT '[]'::jsonb NOT NULL,
    media_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    acknowledged_at timestamp(3) without time zone,
    acknowledged_by_staff_id text,
    resolved_at timestamp(3) without time zone,
    resolution_notes text,
    requires_immediate_action boolean DEFAULT false NOT NULL,
    follow_up_required boolean DEFAULT false NOT NULL,
    follow_up_deadline timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public."HandoverNote" OWNER TO kaneko;

--
-- Name: HotelApp; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."HotelApp" (
    id text NOT NULL,
    "placeId" integer NOT NULL,
    "appId" text NOT NULL,
    "customLabel" text,
    "isEnabled" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."HotelApp" OWNER TO kaneko;

--
-- Name: InfoArticle; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."InfoArticle" (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "customCss" text,
    "customJs" text,
    "coverImg" text,
    category text NOT NULL,
    tags jsonb,
    lang text DEFAULT 'ja'::text NOT NULL,
    "startAt" timestamp(3) without time zone,
    "endAt" timestamp(3) without time zone,
    featured boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "authorId" text NOT NULL,
    "authorRole" text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    "approvedBy" text,
    "approvedAt" timestamp(3) without time zone,
    "isLocked" boolean DEFAULT false NOT NULL,
    "lockedBy" text,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."InfoArticle" OWNER TO kaneko;

--
-- Name: InfoArticle_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."InfoArticle_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."InfoArticle_id_seq" OWNER TO kaneko;

--
-- Name: InfoArticle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."InfoArticle_id_seq" OWNED BY public."InfoArticle".id;


--
-- Name: InfoMediaFile; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."InfoMediaFile" (
    id integer NOT NULL,
    "articleId" integer NOT NULL,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    "fileType" text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    alt text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InfoMediaFile" OWNER TO kaneko;

--
-- Name: InfoMediaFile_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."InfoMediaFile_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."InfoMediaFile_id_seq" OWNER TO kaneko;

--
-- Name: InfoMediaFile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."InfoMediaFile_id_seq" OWNED BY public."InfoMediaFile".id;


--
-- Name: InfoRevision; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."InfoRevision" (
    id integer NOT NULL,
    "articleId" integer NOT NULL,
    version integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "customCss" text,
    "customJs" text,
    "changeLog" text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InfoRevision" OWNER TO kaneko;

--
-- Name: InfoRevision_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."InfoRevision_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."InfoRevision_id_seq" OWNER TO kaneko;

--
-- Name: InfoRevision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."InfoRevision_id_seq" OWNED BY public."InfoRevision".id;


--
-- Name: InfoSearchLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."InfoSearchLog" (
    id integer NOT NULL,
    query text NOT NULL,
    lang text NOT NULL,
    "resultCount" integer NOT NULL,
    "topScore" double precision,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InfoSearchLog" OWNER TO kaneko;

--
-- Name: InfoSearchLog_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."InfoSearchLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."InfoSearchLog_id_seq" OWNER TO kaneko;

--
-- Name: InfoSearchLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."InfoSearchLog_id_seq" OWNED BY public."InfoSearchLog".id;


--
-- Name: InfoTranslation; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."InfoTranslation" (
    id integer NOT NULL,
    "articleId" integer NOT NULL,
    lang text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'auto'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."InfoTranslation" OWNER TO kaneko;

--
-- Name: InfoTranslation_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."InfoTranslation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."InfoTranslation_id_seq" OWNER TO kaneko;

--
-- Name: InfoTranslation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."InfoTranslation_id_seq" OWNED BY public."InfoTranslation".id;


--
-- Name: Layout; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Layout" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    type text DEFAULT 'page'::text NOT NULL,
    category text,
    status text DEFAULT 'draft'::text NOT NULL,
    data jsonb NOT NULL,
    settings jsonb,
    "previewUrl" text,
    "publishedUrl" text,
    version integer DEFAULT 1 NOT NULL,
    "isTemplate" boolean DEFAULT false NOT NULL,
    "templateId" integer,
    "isPublicPage" boolean DEFAULT false NOT NULL,
    "publicPageActivatedAt" timestamp(3) without time zone,
    "publicPageActivatedBy" text,
    "previousPublicPageId" integer,
    "displayStartAt" timestamp(3) without time zone,
    "displayEndAt" timestamp(3) without time zone,
    "isScheduled" boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    "seasonTag" text,
    "isActive" boolean DEFAULT false NOT NULL,
    "activatedAt" timestamp(3) without time zone,
    "deactivatedAt" timestamp(3) without time zone,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Layout" OWNER TO kaneko;

--
-- Name: LayoutAppBlock; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."LayoutAppBlock" (
    id text NOT NULL,
    "layoutId" integer NOT NULL,
    "blockId" text NOT NULL,
    "appConfig" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LayoutAppBlock" OWNER TO kaneko;

--
-- Name: LayoutAsset; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."LayoutAsset" (
    id integer NOT NULL,
    "layoutId" integer,
    "fileName" text NOT NULL,
    "filePath" text NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" text NOT NULL,
    "fileType" text NOT NULL,
    alt text,
    title text,
    "order" integer DEFAULT 0 NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LayoutAsset" OWNER TO kaneko;

--
-- Name: LayoutAsset_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."LayoutAsset_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."LayoutAsset_id_seq" OWNER TO kaneko;

--
-- Name: LayoutAsset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."LayoutAsset_id_seq" OWNED BY public."LayoutAsset".id;


--
-- Name: LayoutRevision; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."LayoutRevision" (
    id integer NOT NULL,
    "layoutId" integer NOT NULL,
    version integer NOT NULL,
    name text NOT NULL,
    data jsonb NOT NULL,
    settings jsonb,
    "changeLog" text,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."LayoutRevision" OWNER TO kaneko;

--
-- Name: LayoutRevision_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."LayoutRevision_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."LayoutRevision_id_seq" OWNER TO kaneko;

--
-- Name: LayoutRevision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."LayoutRevision_id_seq" OWNED BY public."LayoutRevision".id;


--
-- Name: LayoutSetting; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."LayoutSetting" (
    id integer NOT NULL,
    "layoutId" integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "dataType" text DEFAULT 'string'::text NOT NULL
);


ALTER TABLE public."LayoutSetting" OWNER TO kaneko;

--
-- Name: LayoutSetting_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."LayoutSetting_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."LayoutSetting_id_seq" OWNER TO kaneko;

--
-- Name: LayoutSetting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."LayoutSetting_id_seq" OWNED BY public."LayoutSetting".id;


--
-- Name: Layout_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."Layout_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Layout_id_seq" OWNER TO kaneko;

--
-- Name: Layout_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."Layout_id_seq" OWNED BY public."Layout".id;


--
-- Name: MemberGradeAccess; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."MemberGradeAccess" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    room_grade_id text NOT NULL,
    member_rank_id character varying(50) NOT NULL,
    access_type text NOT NULL,
    priority_booking_hours integer DEFAULT 0 NOT NULL,
    max_bookings_per_month integer,
    min_stay_override integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MemberGradeAccess" OWNER TO kaneko;

--
-- Name: MenuAsset; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."MenuAsset" (
    id integer NOT NULL,
    "menuItemId" integer NOT NULL,
    url text NOT NULL,
    type text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."MenuAsset" OWNER TO kaneko;

--
-- Name: MenuAsset_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."MenuAsset_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MenuAsset_id_seq" OWNER TO kaneko;

--
-- Name: MenuAsset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."MenuAsset_id_seq" OWNED BY public."MenuAsset".id;


--
-- Name: MenuComboItem; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."MenuComboItem" (
    id integer NOT NULL,
    "parentId" integer NOT NULL,
    "childId" integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."MenuComboItem" OWNER TO kaneko;

--
-- Name: MenuComboItem_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."MenuComboItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MenuComboItem_id_seq" OWNER TO kaneko;

--
-- Name: MenuComboItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."MenuComboItem_id_seq" OWNED BY public."MenuComboItem".id;


--
-- Name: MenuItem; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."MenuItem" (
    id integer NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    name_ja text NOT NULL,
    description text,
    description_ja text,
    price integer NOT NULL,
    "taxRate" integer DEFAULT 10 NOT NULL,
    "categoryId" integer,
    "imageUrl" text,
    "stockAvailable" boolean DEFAULT true NOT NULL,
    "stockQty" integer,
    "isSecret" boolean DEFAULT false NOT NULL,
    "secretCode" text,
    "isSet" boolean DEFAULT false NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "showFrom" timestamp(3) without time zone,
    "showTo" timestamp(3) without time zone,
    "isPreview" boolean DEFAULT false NOT NULL,
    "showRankingDay" boolean DEFAULT true NOT NULL,
    "showRankingWeek" boolean DEFAULT true NOT NULL,
    "showRankingMonth" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "categoryOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "costPrice" integer
);


ALTER TABLE public."MenuItem" OWNER TO kaneko;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."MenuItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MenuItem_id_seq" OWNER TO kaneko;

--
-- Name: MenuItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."MenuItem_id_seq" OWNED BY public."MenuItem".id;


--
-- Name: OperationLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."OperationLog" (
    id integer NOT NULL,
    "placeId" integer NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    details text,
    "staffName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OperationLog" OWNER TO kaneko;

--
-- Name: OperationLog_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."OperationLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OperationLog_id_seq" OWNER TO kaneko;

--
-- Name: OperationLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."OperationLog_id_seq" OWNED BY public."OperationLog".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    "tenantId" text NOT NULL,
    "roomId" text NOT NULL,
    "placeId" integer,
    status text DEFAULT 'received'::text NOT NULL,
    items jsonb NOT NULL,
    total integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Order" OWNER TO kaneko;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    "tenantId" text NOT NULL,
    "orderId" integer NOT NULL,
    "menuItemId" integer NOT NULL,
    name text NOT NULL,
    price integer NOT NULL,
    quantity integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    "deliveredAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO kaneko;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OrderItem_id_seq" OWNER TO kaneko;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Order_id_seq" OWNER TO kaneko;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: Place; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Place" (
    id integer NOT NULL,
    "tenantId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "placeTypeId" integer NOT NULL,
    description text,
    attributes jsonb,
    floor integer,
    capacity integer,
    area double precision,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Place" OWNER TO kaneko;

--
-- Name: PlaceGroup; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."PlaceGroup" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    color text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."PlaceGroup" OWNER TO kaneko;

--
-- Name: PlaceGroupMember; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."PlaceGroupMember" (
    id integer NOT NULL,
    "placeId" integer NOT NULL,
    "groupId" integer NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PlaceGroupMember" OWNER TO kaneko;

--
-- Name: PlaceGroupMember_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."PlaceGroupMember_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PlaceGroupMember_id_seq" OWNER TO kaneko;

--
-- Name: PlaceGroupMember_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."PlaceGroupMember_id_seq" OWNED BY public."PlaceGroupMember".id;


--
-- Name: PlaceGroup_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."PlaceGroup_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PlaceGroup_id_seq" OWNER TO kaneko;

--
-- Name: PlaceGroup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."PlaceGroup_id_seq" OWNED BY public."PlaceGroup".id;


--
-- Name: PlaceType; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."PlaceType" (
    id integer NOT NULL,
    "tenantId" text NOT NULL,
    name text NOT NULL,
    description text,
    color text,
    icon text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."PlaceType" OWNER TO kaneko;

--
-- Name: PlaceType_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."PlaceType_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."PlaceType_id_seq" OWNER TO kaneko;

--
-- Name: PlaceType_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."PlaceType_id_seq" OWNED BY public."PlaceType".id;


--
-- Name: Place_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."Place_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Place_id_seq" OWNER TO kaneko;

--
-- Name: Place_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."Place_id_seq" OWNED BY public."Place".id;


--
-- Name: RankingLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."RankingLog" (
    id integer NOT NULL,
    day text NOT NULL,
    "menuItemId" integer NOT NULL,
    count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."RankingLog" OWNER TO kaneko;

--
-- Name: RankingLog_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."RankingLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RankingLog_id_seq" OWNER TO kaneko;

--
-- Name: RankingLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."RankingLog_id_seq" OWNED BY public."RankingLog".id;


--
-- Name: Receipt; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Receipt" (
    id text NOT NULL,
    "placeId" integer NOT NULL,
    "receiptData" jsonb NOT NULL,
    "totalAmount" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Receipt" OWNER TO kaneko;

--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    customer_id text,
    room_id text NOT NULL,
    check_in_date timestamp(3) without time zone NOT NULL,
    check_out_date timestamp(3) without time zone NOT NULL,
    guest_name character varying(100) NOT NULL,
    guest_count integer DEFAULT 1 NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    origin character varying(50) NOT NULL,
    total_amount numeric(10,2),
    paid_amount numeric(10,2) DEFAULT 0,
    special_requests text,
    internal_notes text,
    checked_in_at timestamp(3) without time zone,
    checked_out_at timestamp(3) without time zone,
    cancelled_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Reservation" OWNER TO kaneko;

--
-- Name: Room; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Room" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    room_number character varying(50) NOT NULL,
    room_grade_id text,
    floor integer,
    capacity integer DEFAULT 2 NOT NULL,
    status character varying(50) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    accessibility_features jsonb DEFAULT '[]'::jsonb NOT NULL,
    grade_override_amenities jsonb,
    pricing_room_code character varying(50),
    special_features jsonb DEFAULT '{}'::jsonb NOT NULL,
    view_type character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    maintenance_notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public."Room" OWNER TO kaneko;

--
-- Name: RoomGrade; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."RoomGrade" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    grade_code character varying(50) NOT NULL,
    grade_name character varying(100) NOT NULL,
    grade_name_en character varying(100),
    description text,
    grade_level integer NOT NULL,
    default_capacity integer DEFAULT 2 NOT NULL,
    max_capacity integer DEFAULT 4 NOT NULL,
    room_size_sqm numeric(6,2),
    standard_amenities jsonb DEFAULT '[]'::jsonb NOT NULL,
    premium_amenities jsonb DEFAULT '[]'::jsonb NOT NULL,
    included_services jsonb DEFAULT '[]'::jsonb NOT NULL,
    member_only boolean DEFAULT false NOT NULL,
    min_stay_nights integer DEFAULT 1 NOT NULL,
    advance_booking_days integer DEFAULT 0 NOT NULL,
    display_order integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_public boolean DEFAULT true NOT NULL,
    pricing_category character varying(50),
    origin_system character varying(50) DEFAULT 'hotel-common'::character varying NOT NULL,
    synced_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by_system character varying(50) DEFAULT 'hotel-common'::character varying NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public."RoomGrade" OWNER TO kaneko;

--
-- Name: RoomGradeMedia; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."RoomGradeMedia" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    room_grade_id text NOT NULL,
    media_type character varying(20) NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type character varying(100),
    display_order integer DEFAULT 1,
    title character varying(200),
    description text,
    is_primary boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public."RoomGradeMedia" OWNER TO kaneko;

--
-- Name: RoomMemo; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."RoomMemo" (
    id integer NOT NULL,
    "placeId" integer NOT NULL,
    category text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "staffName" text NOT NULL,
    "assignedTo" text,
    priority text DEFAULT 'normal'::text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."RoomMemo" OWNER TO kaneko;

--
-- Name: RoomMemoComment; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."RoomMemoComment" (
    id integer NOT NULL,
    "memoId" integer NOT NULL,
    content text NOT NULL,
    "staffName" text NOT NULL,
    "commentType" text DEFAULT 'comment'::text NOT NULL,
    "statusFrom" text,
    "statusTo" text,
    "parentCommentId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."RoomMemoComment" OWNER TO kaneko;

--
-- Name: RoomMemoComment_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."RoomMemoComment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RoomMemoComment_id_seq" OWNER TO kaneko;

--
-- Name: RoomMemoComment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."RoomMemoComment_id_seq" OWNED BY public."RoomMemoComment".id;


--
-- Name: RoomMemoStatusLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."RoomMemoStatusLog" (
    id integer NOT NULL,
    "memoId" integer NOT NULL,
    "fromStatus" text,
    "toStatus" text NOT NULL,
    comment text,
    "staffName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RoomMemoStatusLog" OWNER TO kaneko;

--
-- Name: RoomMemoStatusLog_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."RoomMemoStatusLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RoomMemoStatusLog_id_seq" OWNER TO kaneko;

--
-- Name: RoomMemoStatusLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."RoomMemoStatusLog_id_seq" OWNED BY public."RoomMemoStatusLog".id;


--
-- Name: RoomMemo_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."RoomMemo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RoomMemo_id_seq" OWNER TO kaneko;

--
-- Name: RoomMemo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."RoomMemo_id_seq" OWNED BY public."RoomMemo".id;


--
-- Name: RoomStatus; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."RoomStatus" (
    id integer NOT NULL,
    "placeId" integer NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    "checkinAt" timestamp(3) without time zone,
    "checkoutAt" timestamp(3) without time zone,
    "guestCount" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RoomStatus" OWNER TO kaneko;

--
-- Name: RoomStatus_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."RoomStatus_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."RoomStatus_id_seq" OWNER TO kaneko;

--
-- Name: RoomStatus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."RoomStatus_id_seq" OWNED BY public."RoomStatus".id;


--
-- Name: Staff; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Staff" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    staff_code text NOT NULL,
    staff_number text NOT NULL,
    last_name text NOT NULL,
    first_name text NOT NULL,
    last_name_kana text,
    first_name_kana text,
    display_name text NOT NULL,
    employee_id text,
    email text,
    email_verified_at timestamp(3) without time zone,
    pin_hash text,
    password_hash text,
    password_changed_at timestamp(3) without time zone,
    failed_login_count integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    last_login_at timestamp(3) without time zone,
    totp_secret text,
    totp_enabled boolean DEFAULT false NOT NULL,
    backup_codes jsonb,
    default_role_id text,
    base_level integer DEFAULT 1 NOT NULL,
    department_code text,
    position_title text,
    hire_date timestamp(3) without time zone,
    employment_type text DEFAULT 'full_time'::text NOT NULL,
    employment_status text DEFAULT 'active'::text NOT NULL,
    termination_date timestamp(3) without time zone,
    termination_reason text,
    phone_number text,
    emergency_contact jsonb,
    address jsonb,
    photo_url text,
    bio text,
    skills jsonb,
    shift_pattern text,
    hourly_rate numeric(10,2),
    salary numeric(10,2),
    supervisor_id text,
    access_restrictions jsonb DEFAULT '{}'::jsonb NOT NULL,
    notification_settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    ui_preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
    security_clearance text,
    access_card_id text,
    is_active boolean DEFAULT true NOT NULL,
    is_system_user boolean DEFAULT false NOT NULL,
    notes text,
    hotel_common_user_id text,
    legacy_user_data jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    created_by text,
    updated_by text,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public."Staff" OWNER TO kaneko;

--
-- Name: StaffNotification; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."StaffNotification" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    staff_id text NOT NULL,
    from_staff_id text,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    priority text DEFAULT 'MEDIUM'::text NOT NULL,
    related_handover_id text,
    related_attendance_id text,
    related_schedule_id text,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp(3) without time zone,
    is_delivered boolean DEFAULT false NOT NULL,
    delivered_at timestamp(3) without time zone,
    delivery_methods jsonb DEFAULT '["in_app"]'::jsonb NOT NULL,
    scheduled_for timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone
);


ALTER TABLE public."StaffNotification" OWNER TO kaneko;

--
-- Name: StockUpdateLog; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."StockUpdateLog" (
    id integer NOT NULL,
    "menuItemId" integer NOT NULL,
    "oldQuantity" integer,
    "newQuantity" integer,
    "updatedBy" text NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StockUpdateLog" OWNER TO kaneko;

--
-- Name: StockUpdateLog_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."StockUpdateLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."StockUpdateLog_id_seq" OWNER TO kaneko;

--
-- Name: StockUpdateLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."StockUpdateLog_id_seq" OWNED BY public."StockUpdateLog".id;


--
-- Name: SystemSetting; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."SystemSetting" (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SystemSetting" OWNER TO kaneko;

--
-- Name: SystemSetting_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."SystemSetting_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."SystemSetting_id_seq" OWNER TO kaneko;

--
-- Name: SystemSetting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."SystemSetting_id_seq" OWNED BY public."SystemSetting".id;


--
-- Name: Tag; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Tag" (
    id integer NOT NULL,
    "tenantId" text NOT NULL,
    path text NOT NULL,
    name_ja text NOT NULL,
    name_en text NOT NULL,
    aliases jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tag" OWNER TO kaneko;

--
-- Name: Tag_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public."Tag_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Tag_id_seq" OWNER TO kaneko;

--
-- Name: Tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public."Tag_id_seq" OWNED BY public."Tag".id;


--
-- Name: Tenant; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."Tenant" (
    id text NOT NULL,
    name text NOT NULL,
    domain text,
    "planType" text DEFAULT 'economy'::text NOT NULL,
    "planCategory" text DEFAULT 'omotenasuai'::text NOT NULL,
    "planSelectedAt" timestamp(3) without time zone,
    "planChangeable" boolean DEFAULT true NOT NULL,
    "planLockReason" text,
    "maxDevices" integer DEFAULT 30 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "contactName" text NOT NULL,
    "contactEmail" text NOT NULL,
    "contactPhone" text,
    "contractStartDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "monthlyPrice" integer DEFAULT 29800 NOT NULL,
    "agentId" text,
    "agentCommissionRate" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tenant" OWNER TO kaneko;

--
-- Name: WorkSchedule; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."WorkSchedule" (
    id text NOT NULL,
    tenant_id text NOT NULL,
    staff_id text NOT NULL,
    staff_number text NOT NULL,
    schedule_date timestamp(3) without time zone NOT NULL,
    scheduled_start_time timestamp(3) without time zone NOT NULL,
    scheduled_end_time timestamp(3) without time zone NOT NULL,
    shift_type text DEFAULT 'full_day'::text NOT NULL,
    is_working_day boolean DEFAULT true NOT NULL,
    is_holiday boolean DEFAULT false NOT NULL,
    is_paid_leave boolean DEFAULT false NOT NULL,
    notes text,
    created_by text,
    updated_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkSchedule" OWNER TO kaneko;

--
-- Name: _MenuItemToTag; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public."_MenuItemToTag" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_MenuItemToTag" OWNER TO kaneko;

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
-- Name: additional_devices; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.additional_devices (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "deviceType" text NOT NULL,
    "deviceName" text NOT NULL,
    location text,
    "monthlyCost" integer NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "ipAddress" text,
    "macAddress" text,
    "setupDate" timestamp(3) without time zone,
    "lastActiveAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.additional_devices OWNER TO kaneko;

--
-- Name: agents; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.agents (
    id text NOT NULL,
    "companyName" text NOT NULL,
    "contactName" text NOT NULL,
    email text NOT NULL,
    phone text,
    rank text DEFAULT 'bronze'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "firstYearMargin" double precision DEFAULT 0.35 NOT NULL,
    "continuingMargin" double precision DEFAULT 0.15 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.agents OWNER TO kaneko;

--
-- Name: content_layout_assets; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.content_layout_assets (
    id integer NOT NULL,
    "contentLayoutId" integer NOT NULL,
    filename text NOT NULL,
    "originalName" text NOT NULL,
    "mimeType" text NOT NULL,
    size integer NOT NULL,
    path text NOT NULL,
    type text NOT NULL,
    width integer,
    height integer,
    duration integer,
    alt text,
    caption text,
    "order" integer DEFAULT 0 NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.content_layout_assets OWNER TO kaneko;

--
-- Name: content_layout_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public.content_layout_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.content_layout_assets_id_seq OWNER TO kaneko;

--
-- Name: content_layout_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public.content_layout_assets_id_seq OWNED BY public.content_layout_assets.id;


--
-- Name: content_layout_revisions; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.content_layout_revisions (
    id integer NOT NULL,
    "layoutId" integer NOT NULL,
    version integer NOT NULL,
    title text NOT NULL,
    elements jsonb NOT NULL,
    styles jsonb,
    content text,
    "changeLog" text,
    "changeType" text DEFAULT 'update'::text NOT NULL,
    "createdBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.content_layout_revisions OWNER TO kaneko;

--
-- Name: content_layout_revisions_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public.content_layout_revisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.content_layout_revisions_id_seq OWNER TO kaneko;

--
-- Name: content_layout_revisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public.content_layout_revisions_id_seq OWNED BY public.content_layout_revisions.id;


--
-- Name: content_layout_translations; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.content_layout_translations (
    id integer NOT NULL,
    "contentLayoutId" integer NOT NULL,
    language text NOT NULL,
    title text NOT NULL,
    description text,
    content text,
    excerpt text,
    "translatedBy" text,
    "translatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isAutoTranslated" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.content_layout_translations OWNER TO kaneko;

--
-- Name: content_layout_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public.content_layout_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.content_layout_translations_id_seq OWNER TO kaneko;

--
-- Name: content_layout_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public.content_layout_translations_id_seq OWNED BY public.content_layout_translations.id;


--
-- Name: content_layouts; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.content_layouts (
    id integer NOT NULL,
    slug text NOT NULL,
    type text NOT NULL,
    category text,
    title text NOT NULL,
    description text,
    elements jsonb NOT NULL,
    styles jsonb NOT NULL,
    content text,
    excerpt text,
    "featuredImage" text,
    attachments jsonb,
    status text DEFAULT 'draft'::text NOT NULL,
    "publishAt" timestamp(3) without time zone,
    "expireAt" timestamp(3) without time zone,
    featured boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    language text DEFAULT 'ja'::text NOT NULL,
    seo jsonb,
    permissions jsonb,
    "isTemplate" boolean DEFAULT false NOT NULL,
    "templateId" integer,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "createdBy" text NOT NULL,
    "updatedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.content_layouts OWNER TO kaneko;

--
-- Name: content_layouts_id_seq; Type: SEQUENCE; Schema: public; Owner: kaneko
--

CREATE SEQUENCE public.content_layouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.content_layouts_id_seq OWNER TO kaneko;

--
-- Name: content_layouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kaneko
--

ALTER SEQUENCE public.content_layouts_id_seq OWNED BY public.content_layouts.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.customers (
    id text NOT NULL,
    tenant_id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    birth_date timestamp(3) without time zone,
    member_id text,
    rank_id text,
    total_points integer DEFAULT 0 NOT NULL,
    total_stays integer DEFAULT 0 NOT NULL,
    pms_updatable_fields text[] DEFAULT ARRAY['name'::text, 'phone'::text, 'address'::text],
    origin_system text DEFAULT 'hotel-member'::text NOT NULL,
    synced_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by_system text DEFAULT 'hotel-member'::text NOT NULL,
    preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.customers OWNER TO kaneko;

--
-- Name: monthly_billings; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.monthly_billings (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "billingMonth" text NOT NULL,
    "basePlanCost" integer NOT NULL,
    "additionalDevices" integer NOT NULL,
    "additionalDeviceCost" integer NOT NULL,
    "multilingualCost" integer DEFAULT 0 NOT NULL,
    "overageCost" integer DEFAULT 0 NOT NULL,
    subtotal integer NOT NULL,
    "taxRate" double precision DEFAULT 0.10 NOT NULL,
    "taxAmount" integer NOT NULL,
    "totalAmount" integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paidAt" timestamp(3) without time zone,
    "paymentMethod" text,
    "agentCommission" double precision,
    "agentCommissionAmount" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.monthly_billings OWNER TO kaneko;

--
-- Name: plan_change_logs; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.plan_change_logs (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    "previousPlanType" text NOT NULL,
    "previousPlanCategory" text NOT NULL,
    "previousMonthlyPrice" integer NOT NULL,
    "newPlanType" text NOT NULL,
    "newPlanCategory" text NOT NULL,
    "newMonthlyPrice" integer NOT NULL,
    "changeReason" text NOT NULL,
    "changeDescription" text,
    "effectiveDate" timestamp(3) without time zone NOT NULL,
    "changedBy" text NOT NULL,
    "changedByRole" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.plan_change_logs OWNER TO kaneko;

--
-- Name: plan_restrictions; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.plan_restrictions (
    id text NOT NULL,
    "planType" text NOT NULL,
    "planCategory" text NOT NULL,
    "maxDevices" integer DEFAULT 30 NOT NULL,
    "additionalDeviceCost" integer DEFAULT 1200 NOT NULL,
    "roomTerminalCost" integer DEFAULT 1200 NOT NULL,
    "frontDeskCost" integer DEFAULT 5000 NOT NULL,
    "kitchenCost" integer DEFAULT 2000 NOT NULL,
    "barCost" integer DEFAULT 2000 NOT NULL,
    "housekeepingCost" integer DEFAULT 2000 NOT NULL,
    "managerCost" integer DEFAULT 5000 NOT NULL,
    "commonAreaCost" integer DEFAULT 3500 NOT NULL,
    "enableAiConcierge" boolean DEFAULT false NOT NULL,
    "enableMultilingual" boolean DEFAULT false NOT NULL,
    "enableLayoutEditor" boolean DEFAULT false NOT NULL,
    "enableFacilityGuide" boolean DEFAULT false NOT NULL,
    "enableAiBusinessSupport" boolean DEFAULT false NOT NULL,
    "maxMonthlyOrders" integer DEFAULT 1000 NOT NULL,
    "maxMonthlyAiRequests" integer DEFAULT 0 NOT NULL,
    "maxStorageGB" double precision DEFAULT 5.0 NOT NULL,
    "multilingualUpgradePrice" integer DEFAULT 3000 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.plan_restrictions OWNER TO kaneko;

--
-- Name: referrals; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.referrals (
    id text NOT NULL,
    "referralCode" text NOT NULL,
    "agentId" text,
    "tenantId" text NOT NULL,
    "referralType" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "monthlyAmount" double precision NOT NULL,
    "commissionAmount" double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.referrals OWNER TO kaneko;

--
-- Name: usage_statistics; Type: TABLE; Schema: public; Owner: kaneko
--

CREATE TABLE public.usage_statistics (
    id text NOT NULL,
    "tenantId" text NOT NULL,
    month text NOT NULL,
    "totalOrders" integer DEFAULT 0 NOT NULL,
    "totalOrderValue" integer DEFAULT 0 NOT NULL,
    "aiConciergeRequests" integer DEFAULT 0 NOT NULL,
    "aiBusinessRequests" integer DEFAULT 0 NOT NULL,
    "activeDevices" integer DEFAULT 0 NOT NULL,
    "roomDevices" integer DEFAULT 0 NOT NULL,
    "additionalDevices" integer DEFAULT 0 NOT NULL,
    "storageUsedGB" double precision DEFAULT 0.0 NOT NULL,
    "isOrderLimitExceeded" boolean DEFAULT false NOT NULL,
    "isAiLimitExceeded" boolean DEFAULT false NOT NULL,
    "isDeviceLimitExceeded" boolean DEFAULT false NOT NULL,
    "isStorageLimitExceeded" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.usage_statistics OWNER TO kaneko;

--
-- Name: AdminAccessLog id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AdminAccessLog" ALTER COLUMN id SET DEFAULT nextval('public."AdminAccessLog_id_seq"'::regclass);


--
-- Name: AiConversation id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiConversation" ALTER COLUMN id SET DEFAULT nextval('public."AiConversation_id_seq"'::regclass);


--
-- Name: AiCreditPlan id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditPlan" ALTER COLUMN id SET DEFAULT nextval('public."AiCreditPlan_id_seq"'::regclass);


--
-- Name: AiCreditTopUp id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditTopUp" ALTER COLUMN id SET DEFAULT nextval('public."AiCreditTopUp_id_seq"'::regclass);


--
-- Name: AiCreditUsage id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditUsage" ALTER COLUMN id SET DEFAULT nextval('public."AiCreditUsage_id_seq"'::regclass);


--
-- Name: AiKnowledgeBase id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiKnowledgeBase" ALTER COLUMN id SET DEFAULT nextval('public."AiKnowledgeBase_id_seq"'::regclass);


--
-- Name: AiMessage id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiMessage" ALTER COLUMN id SET DEFAULT nextval('public."AiMessage_id_seq"'::regclass);


--
-- Name: AiModel id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiModel" ALTER COLUMN id SET DEFAULT nextval('public."AiModel_id_seq"'::regclass);


--
-- Name: AiUsageLimit id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiUsageLimit" ALTER COLUMN id SET DEFAULT nextval('public."AiUsageLimit_id_seq"'::regclass);


--
-- Name: BillingAdjustmentLog id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."BillingAdjustmentLog" ALTER COLUMN id SET DEFAULT nextval('public."BillingAdjustmentLog_id_seq"'::regclass);


--
-- Name: BillingSetting id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."BillingSetting" ALTER COLUMN id SET DEFAULT nextval('public."BillingSetting_id_seq"'::regclass);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: ComboMeta id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."ComboMeta" ALTER COLUMN id SET DEFAULT nextval('public."ComboMeta_id_seq"'::regclass);


--
-- Name: DeviceAccessLog id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."DeviceAccessLog" ALTER COLUMN id SET DEFAULT nextval('public."DeviceAccessLog_id_seq"'::regclass);


--
-- Name: DeviceRoom id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."DeviceRoom" ALTER COLUMN id SET DEFAULT nextval('public."DeviceRoom_id_seq"'::regclass);


--
-- Name: DeviceSecret id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."DeviceSecret" ALTER COLUMN id SET DEFAULT nextval('public."DeviceSecret_id_seq"'::regclass);


--
-- Name: Guest id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Guest" ALTER COLUMN id SET DEFAULT nextval('public."Guest_id_seq"'::regclass);


--
-- Name: InfoArticle id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoArticle" ALTER COLUMN id SET DEFAULT nextval('public."InfoArticle_id_seq"'::regclass);


--
-- Name: InfoMediaFile id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoMediaFile" ALTER COLUMN id SET DEFAULT nextval('public."InfoMediaFile_id_seq"'::regclass);


--
-- Name: InfoRevision id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoRevision" ALTER COLUMN id SET DEFAULT nextval('public."InfoRevision_id_seq"'::regclass);


--
-- Name: InfoSearchLog id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoSearchLog" ALTER COLUMN id SET DEFAULT nextval('public."InfoSearchLog_id_seq"'::regclass);


--
-- Name: InfoTranslation id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoTranslation" ALTER COLUMN id SET DEFAULT nextval('public."InfoTranslation_id_seq"'::regclass);


--
-- Name: Layout id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Layout" ALTER COLUMN id SET DEFAULT nextval('public."Layout_id_seq"'::regclass);


--
-- Name: LayoutAsset id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutAsset" ALTER COLUMN id SET DEFAULT nextval('public."LayoutAsset_id_seq"'::regclass);


--
-- Name: LayoutRevision id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutRevision" ALTER COLUMN id SET DEFAULT nextval('public."LayoutRevision_id_seq"'::regclass);


--
-- Name: LayoutSetting id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutSetting" ALTER COLUMN id SET DEFAULT nextval('public."LayoutSetting_id_seq"'::regclass);


--
-- Name: MenuAsset id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuAsset" ALTER COLUMN id SET DEFAULT nextval('public."MenuAsset_id_seq"'::regclass);


--
-- Name: MenuComboItem id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuComboItem" ALTER COLUMN id SET DEFAULT nextval('public."MenuComboItem_id_seq"'::regclass);


--
-- Name: MenuItem id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuItem" ALTER COLUMN id SET DEFAULT nextval('public."MenuItem_id_seq"'::regclass);


--
-- Name: OperationLog id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."OperationLog" ALTER COLUMN id SET DEFAULT nextval('public."OperationLog_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: Place id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Place" ALTER COLUMN id SET DEFAULT nextval('public."Place_id_seq"'::regclass);


--
-- Name: PlaceGroup id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."PlaceGroup" ALTER COLUMN id SET DEFAULT nextval('public."PlaceGroup_id_seq"'::regclass);


--
-- Name: PlaceGroupMember id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."PlaceGroupMember" ALTER COLUMN id SET DEFAULT nextval('public."PlaceGroupMember_id_seq"'::regclass);


--
-- Name: PlaceType id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."PlaceType" ALTER COLUMN id SET DEFAULT nextval('public."PlaceType_id_seq"'::regclass);


--
-- Name: RankingLog id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RankingLog" ALTER COLUMN id SET DEFAULT nextval('public."RankingLog_id_seq"'::regclass);


--
-- Name: RoomMemo id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemo" ALTER COLUMN id SET DEFAULT nextval('public."RoomMemo_id_seq"'::regclass);


--
-- Name: RoomMemoComment id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemoComment" ALTER COLUMN id SET DEFAULT nextval('public."RoomMemoComment_id_seq"'::regclass);


--
-- Name: RoomMemoStatusLog id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemoStatusLog" ALTER COLUMN id SET DEFAULT nextval('public."RoomMemoStatusLog_id_seq"'::regclass);


--
-- Name: RoomStatus id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomStatus" ALTER COLUMN id SET DEFAULT nextval('public."RoomStatus_id_seq"'::regclass);


--
-- Name: StockUpdateLog id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."StockUpdateLog" ALTER COLUMN id SET DEFAULT nextval('public."StockUpdateLog_id_seq"'::regclass);


--
-- Name: SystemSetting id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."SystemSetting" ALTER COLUMN id SET DEFAULT nextval('public."SystemSetting_id_seq"'::regclass);


--
-- Name: Tag id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Tag" ALTER COLUMN id SET DEFAULT nextval('public."Tag_id_seq"'::regclass);


--
-- Name: content_layout_assets id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_assets ALTER COLUMN id SET DEFAULT nextval('public.content_layout_assets_id_seq'::regclass);


--
-- Name: content_layout_revisions id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_revisions ALTER COLUMN id SET DEFAULT nextval('public.content_layout_revisions_id_seq'::regclass);


--
-- Name: content_layout_translations id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_translations ALTER COLUMN id SET DEFAULT nextval('public.content_layout_translations_id_seq'::regclass);


--
-- Name: content_layouts id; Type: DEFAULT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layouts ALTER COLUMN id SET DEFAULT nextval('public.content_layouts_id_seq'::regclass);


--
-- Data for Name: AdminAccessLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AdminAccessLog" (id, path, method, "userId", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: AiConversation; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AiConversation" (id, "sessionId", "roomId", "deviceId", "startedAt", "endedAt", language) FROM stdin;
\.


--
-- Data for Name: AiCreditPlan; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AiCreditPlan" (id, month, "baseCreditsUsd", "createdAt", "createdBy") FROM stdin;
\.


--
-- Data for Name: AiCreditTopUp; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AiCreditTopUp" (id, "planId", "amountUsd", "purchasedAt", note) FROM stdin;
\.


--
-- Data for Name: AiCreditUsage; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AiCreditUsage" (id, "conversationId", "modelId", "promptTokens", "completionTokens", "costUsd", category, "createdAt") FROM stdin;
\.


--
-- Data for Name: AiKnowledgeBase; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AiKnowledgeBase" (id, title, description, "fileType", "filePath", language, "isActive", vectorized, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AiMessage; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AiMessage" (id, "conversationId", role, content, "timestamp") FROM stdin;
\.


--
-- Data for Name: AiModel; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AiModel" (id, name, provider, "promptPriceUsd", "completionPriceUsd", "autoMargin", "creditOverride", description, "useCase", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: AiUsageLimit; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AiUsageLimit" (id, "deviceType", "maxQueriesPerHour", "maxQueriesPerDay", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Attendance; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Attendance" (id, tenant_id, staff_id, staff_number, work_date, clock_in_time, clock_out_time, break_start_time, break_end_time, work_duration_minutes, overtime_minutes, break_duration_minutes, attendance_status, notes, approved_by_staff_id, approved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."AuditLog" (id, tenant_id, staff_id, staff_number, staff_name, table_name, record_id, operation, old_values, new_values, changed_fields, session_id, ip_address, user_agent, request_id, created_at) FROM stdin;
\.


--
-- Data for Name: BillingAdjustmentLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."BillingAdjustmentLog" (id, "placeId", "orderId", "adjustmentType", "itemName", "originalValue", "adjustedValue", reason, "staffName", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: BillingSetting; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."BillingSetting" (id, "startDate", "baseFeeYen", "includedDevices", "extraDeviceFeeYen", "includedAiCredits", "extraAiCreditAmount", "extraAiCreditFeeYen", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Category" (id, "tenantId", name, name_ja, description, "parentId", "order", "isAvailable", image, "createdAt", "updatedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: ComboMeta; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."ComboMeta" (id, "structureType", "categoryTagId", "fixedItemId", "requiredOpts", "addonOpts") FROM stdin;
\.


--
-- Data for Name: ConciergeCharacter; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."ConciergeCharacter" (id, name, "imageUrl", friendly, humor, politeness, "toneTemplate", "endingPhrase", "rawDescription", "promptSummary", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DeviceAccessLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."DeviceAccessLog" (id, "deviceId", "accessTime", "ipAddress", "userAgent", status, "pagePath", "sessionId") FROM stdin;
\.


--
-- Data for Name: DeviceRoom; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."DeviceRoom" (id, "tenantId", "macAddress", "ipAddress", "deviceName", "roomId", "isActive", "createdAt", "updatedAt", "lastUsedAt", "deviceType", "isDeleted", "deletedAt", "placeId") FROM stdin;
\.


--
-- Data for Name: DeviceSecret; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."DeviceSecret" (id, "roomId", secret, "createdAt", "updatedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: GooglePlayApp; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."GooglePlayApp" (id, "packageName", "displayName", description, "iconUrl", category, "deepLinkUrl", "isApproved", priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Guest; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Guest" (id, "roomStatusId", "guestNumber", "ageGroup", gender, name, phone, email, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HandoverNote; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."HandoverNote" (id, tenant_id, from_staff_id, to_staff_id, to_department, shift_handover_id, title, content, priority, category, related_reservation_id, related_room_id, related_customer_id, photo_urls, video_urls, document_urls, media_metadata, status, acknowledged_at, acknowledged_by_staff_id, resolved_at, resolution_notes, requires_immediate_action, follow_up_required, follow_up_deadline, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: HotelApp; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."HotelApp" (id, "placeId", "appId", "customLabel", "isEnabled", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: InfoArticle; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."InfoArticle" (id, slug, title, content, "customCss", "customJs", "coverImg", category, tags, lang, "startAt", "endAt", featured, "order", "viewCount", "authorId", "authorRole", status, "approvedBy", "approvedAt", "isLocked", "lockedBy", version, "createdAt", "updatedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: InfoMediaFile; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."InfoMediaFile" (id, "articleId", "fileName", "filePath", "fileSize", "mimeType", "fileType", "order", alt, "createdAt") FROM stdin;
\.


--
-- Data for Name: InfoRevision; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."InfoRevision" (id, "articleId", version, title, content, "customCss", "customJs", "changeLog", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: InfoSearchLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."InfoSearchLog" (id, query, lang, "resultCount", "topScore", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: InfoTranslation; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."InfoTranslation" (id, "articleId", lang, title, content, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Layout; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Layout" (id, name, slug, description, type, category, status, data, settings, "previewUrl", "publishedUrl", version, "isTemplate", "templateId", "isPublicPage", "publicPageActivatedAt", "publicPageActivatedBy", "previousPublicPageId", "displayStartAt", "displayEndAt", "isScheduled", priority, "seasonTag", "isActive", "activatedAt", "deactivatedAt", "authorId", "createdAt", "updatedAt", "publishedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: LayoutAppBlock; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."LayoutAppBlock" (id, "layoutId", "blockId", "appConfig", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LayoutAsset; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."LayoutAsset" (id, "layoutId", "fileName", "filePath", "fileSize", "mimeType", "fileType", alt, title, "order", "isPublic", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: LayoutRevision; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."LayoutRevision" (id, "layoutId", version, name, data, settings, "changeLog", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: LayoutSetting; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."LayoutSetting" (id, "layoutId", key, value, "dataType") FROM stdin;
\.


--
-- Data for Name: MemberGradeAccess; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."MemberGradeAccess" (id, tenant_id, room_grade_id, member_rank_id, access_type, priority_booking_hours, max_bookings_per_month, min_stay_override, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: MenuAsset; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."MenuAsset" (id, "menuItemId", url, type, "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: MenuComboItem; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."MenuComboItem" (id, "parentId", "childId", quantity, "order") FROM stdin;
\.


--
-- Data for Name: MenuItem; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."MenuItem" (id, "tenantId", name, name_ja, description, description_ja, price, "taxRate", "categoryId", "imageUrl", "stockAvailable", "stockQty", "isSecret", "secretCode", "isSet", "isFeatured", "showFrom", "showTo", "isPreview", "showRankingDay", "showRankingWeek", "showRankingMonth", "order", "categoryOrder", "createdAt", "updatedAt", "isDeleted", "deletedAt", "costPrice") FROM stdin;
\.


--
-- Data for Name: OperationLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."OperationLog" (id, "placeId", type, description, details, "staffName", "createdAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Order" (id, "tenantId", "roomId", "placeId", status, items, total, "createdAt", "updatedAt", "paidAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."OrderItem" (id, "tenantId", "orderId", "menuItemId", name, price, quantity, status, notes, "deliveredAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Place; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Place" (id, "tenantId", code, name, "placeTypeId", description, attributes, floor, capacity, area, "isActive", "order", "createdAt", "updatedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: PlaceGroup; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."PlaceGroup" (id, name, description, color, "order", "isActive", "createdAt", "updatedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: PlaceGroupMember; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."PlaceGroupMember" (id, "placeId", "groupId", "order", "createdAt") FROM stdin;
\.


--
-- Data for Name: PlaceType; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."PlaceType" (id, "tenantId", name, description, color, icon, "order", "isActive", "createdAt", "updatedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: RankingLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."RankingLog" (id, day, "menuItemId", count) FROM stdin;
\.


--
-- Data for Name: Receipt; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Receipt" (id, "placeId", "receiptData", "totalAmount", "createdAt", "isDeleted") FROM stdin;
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Reservation" (id, tenant_id, customer_id, room_id, check_in_date, check_out_date, guest_name, guest_count, status, origin, total_amount, paid_amount, special_requests, internal_notes, checked_in_at, checked_out_at, cancelled_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Room; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Room" (id, tenant_id, room_number, room_grade_id, floor, capacity, status, accessibility_features, grade_override_amenities, pricing_room_code, special_features, view_type, is_active, maintenance_notes, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: RoomGrade; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."RoomGrade" (id, tenant_id, grade_code, grade_name, grade_name_en, description, grade_level, default_capacity, max_capacity, room_size_sqm, standard_amenities, premium_amenities, included_services, member_only, min_stay_nights, advance_booking_days, display_order, is_active, is_public, pricing_category, origin_system, synced_at, updated_by_system, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: RoomGradeMedia; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."RoomGradeMedia" (id, tenant_id, room_grade_id, media_type, file_name, file_path, file_size, mime_type, display_order, title, description, is_primary, is_active, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: RoomMemo; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."RoomMemo" (id, "placeId", category, content, status, "staffName", "assignedTo", priority, "dueDate", "createdAt", "updatedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: RoomMemoComment; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."RoomMemoComment" (id, "memoId", content, "staffName", "commentType", "statusFrom", "statusTo", "parentCommentId", "createdAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: RoomMemoStatusLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."RoomMemoStatusLog" (id, "memoId", "fromStatus", "toStatus", comment, "staffName", "createdAt") FROM stdin;
\.


--
-- Data for Name: RoomStatus; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."RoomStatus" (id, "placeId", status, "checkinAt", "checkoutAt", "guestCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Staff; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Staff" (id, tenant_id, staff_code, staff_number, last_name, first_name, last_name_kana, first_name_kana, display_name, employee_id, email, email_verified_at, pin_hash, password_hash, password_changed_at, failed_login_count, locked_until, last_login_at, totp_secret, totp_enabled, backup_codes, default_role_id, base_level, department_code, position_title, hire_date, employment_type, employment_status, termination_date, termination_reason, phone_number, emergency_contact, address, photo_url, bio, skills, shift_pattern, hourly_rate, salary, supervisor_id, access_restrictions, notification_settings, ui_preferences, security_clearance, access_card_id, is_active, is_system_user, notes, hotel_common_user_id, legacy_user_data, created_at, updated_at, created_by, updated_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: StaffNotification; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."StaffNotification" (id, tenant_id, staff_id, from_staff_id, type, title, message, priority, related_handover_id, related_attendance_id, related_schedule_id, is_read, read_at, is_delivered, delivered_at, delivery_methods, scheduled_for, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: StockUpdateLog; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."StockUpdateLog" (id, "menuItemId", "oldQuantity", "newQuantity", "updatedBy", reason, "createdAt") FROM stdin;
\.


--
-- Data for Name: SystemSetting; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."SystemSetting" (id, key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Tag" (id, "tenantId", path, name_ja, name_en, aliases, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Tenant; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."Tenant" (id, name, domain, "planType", "planCategory", "planSelectedAt", "planChangeable", "planLockReason", "maxDevices", status, "contactName", "contactEmail", "contactPhone", "contractStartDate", "monthlyPrice", "agentId", "agentCommissionRate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WorkSchedule; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."WorkSchedule" (id, tenant_id, staff_id, staff_number, schedule_date, scheduled_start_time, scheduled_end_time, shift_type, is_working_day, is_holiday, is_paid_leave, notes, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: _MenuItemToTag; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public."_MenuItemToTag" ("A", "B") FROM stdin;
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
-- Data for Name: additional_devices; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.additional_devices (id, "tenantId", "deviceType", "deviceName", location, "monthlyCost", status, "ipAddress", "macAddress", "setupDate", "lastActiveAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.agents (id, "companyName", "contactName", email, phone, rank, status, "firstYearMargin", "continuingMargin", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: content_layout_assets; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.content_layout_assets (id, "contentLayoutId", filename, "originalName", "mimeType", size, path, type, width, height, duration, alt, caption, "order", "isPublic", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: content_layout_revisions; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.content_layout_revisions (id, "layoutId", version, title, elements, styles, content, "changeLog", "changeType", "createdBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: content_layout_translations; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.content_layout_translations (id, "contentLayoutId", language, title, description, content, excerpt, "translatedBy", "translatedAt", "isAutoTranslated", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: content_layouts; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.content_layouts (id, slug, type, category, title, description, elements, styles, content, excerpt, "featuredImage", attachments, status, "publishAt", "expireAt", featured, priority, language, seo, permissions, "isTemplate", "templateId", "viewCount", "createdBy", "updatedBy", "createdAt", "updatedAt", "isDeleted", "deletedAt") FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.customers (id, tenant_id, name, email, phone, address, birth_date, member_id, rank_id, total_points, total_stays, pms_updatable_fields, origin_system, synced_at, updated_by_system, preferences, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: monthly_billings; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.monthly_billings (id, "tenantId", "billingMonth", "basePlanCost", "additionalDevices", "additionalDeviceCost", "multilingualCost", "overageCost", subtotal, "taxRate", "taxAmount", "totalAmount", status, "dueDate", "paidAt", "paymentMethod", "agentCommission", "agentCommissionAmount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: plan_change_logs; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.plan_change_logs (id, "tenantId", "previousPlanType", "previousPlanCategory", "previousMonthlyPrice", "newPlanType", "newPlanCategory", "newMonthlyPrice", "changeReason", "changeDescription", "effectiveDate", "changedBy", "changedByRole", "createdAt") FROM stdin;
\.


--
-- Data for Name: plan_restrictions; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.plan_restrictions (id, "planType", "planCategory", "maxDevices", "additionalDeviceCost", "roomTerminalCost", "frontDeskCost", "kitchenCost", "barCost", "housekeepingCost", "managerCost", "commonAreaCost", "enableAiConcierge", "enableMultilingual", "enableLayoutEditor", "enableFacilityGuide", "enableAiBusinessSupport", "maxMonthlyOrders", "maxMonthlyAiRequests", "maxStorageGB", "multilingualUpgradePrice", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.referrals (id, "referralCode", "agentId", "tenantId", "referralType", status, "monthlyAmount", "commissionAmount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: usage_statistics; Type: TABLE DATA; Schema: public; Owner: kaneko
--

COPY public.usage_statistics (id, "tenantId", month, "totalOrders", "totalOrderValue", "aiConciergeRequests", "aiBusinessRequests", "activeDevices", "roomDevices", "additionalDevices", "storageUsedGB", "isOrderLimitExceeded", "isAiLimitExceeded", "isDeviceLimitExceeded", "isStorageLimitExceeded", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: AdminAccessLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AdminAccessLog_id_seq"', 1, false);


--
-- Name: AiConversation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AiConversation_id_seq"', 1, false);


--
-- Name: AiCreditPlan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AiCreditPlan_id_seq"', 1, false);


--
-- Name: AiCreditTopUp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AiCreditTopUp_id_seq"', 1, false);


--
-- Name: AiCreditUsage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AiCreditUsage_id_seq"', 1, false);


--
-- Name: AiKnowledgeBase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AiKnowledgeBase_id_seq"', 1, false);


--
-- Name: AiMessage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AiMessage_id_seq"', 1, false);


--
-- Name: AiModel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AiModel_id_seq"', 1, false);


--
-- Name: AiUsageLimit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."AiUsageLimit_id_seq"', 1, false);


--
-- Name: BillingAdjustmentLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."BillingAdjustmentLog_id_seq"', 1, false);


--
-- Name: BillingSetting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."BillingSetting_id_seq"', 1, false);


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."Category_id_seq"', 1, false);


--
-- Name: ComboMeta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."ComboMeta_id_seq"', 1, false);


--
-- Name: DeviceAccessLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."DeviceAccessLog_id_seq"', 1, false);


--
-- Name: DeviceRoom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."DeviceRoom_id_seq"', 1, false);


--
-- Name: DeviceSecret_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."DeviceSecret_id_seq"', 1, false);


--
-- Name: Guest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."Guest_id_seq"', 1, false);


--
-- Name: InfoArticle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."InfoArticle_id_seq"', 1, false);


--
-- Name: InfoMediaFile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."InfoMediaFile_id_seq"', 1, false);


--
-- Name: InfoRevision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."InfoRevision_id_seq"', 1, false);


--
-- Name: InfoSearchLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."InfoSearchLog_id_seq"', 1, false);


--
-- Name: InfoTranslation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."InfoTranslation_id_seq"', 1, false);


--
-- Name: LayoutAsset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."LayoutAsset_id_seq"', 1, false);


--
-- Name: LayoutRevision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."LayoutRevision_id_seq"', 1, false);


--
-- Name: LayoutSetting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."LayoutSetting_id_seq"', 1, false);


--
-- Name: Layout_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."Layout_id_seq"', 1, false);


--
-- Name: MenuAsset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."MenuAsset_id_seq"', 1, false);


--
-- Name: MenuComboItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."MenuComboItem_id_seq"', 1, false);


--
-- Name: MenuItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."MenuItem_id_seq"', 1, false);


--
-- Name: OperationLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."OperationLog_id_seq"', 1, false);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 1, false);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."Order_id_seq"', 1, false);


--
-- Name: PlaceGroupMember_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."PlaceGroupMember_id_seq"', 1, false);


--
-- Name: PlaceGroup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."PlaceGroup_id_seq"', 1, false);


--
-- Name: PlaceType_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."PlaceType_id_seq"', 1, false);


--
-- Name: Place_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."Place_id_seq"', 1, false);


--
-- Name: RankingLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."RankingLog_id_seq"', 1, false);


--
-- Name: RoomMemoComment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."RoomMemoComment_id_seq"', 1, false);


--
-- Name: RoomMemoStatusLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."RoomMemoStatusLog_id_seq"', 1, false);


--
-- Name: RoomMemo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."RoomMemo_id_seq"', 1, false);


--
-- Name: RoomStatus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."RoomStatus_id_seq"', 1, false);


--
-- Name: StockUpdateLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."StockUpdateLog_id_seq"', 1, false);


--
-- Name: SystemSetting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."SystemSetting_id_seq"', 1, false);


--
-- Name: Tag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public."Tag_id_seq"', 1, false);


--
-- Name: content_layout_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public.content_layout_assets_id_seq', 1, false);


--
-- Name: content_layout_revisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public.content_layout_revisions_id_seq', 1, false);


--
-- Name: content_layout_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public.content_layout_translations_id_seq', 1, false);


--
-- Name: content_layouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kaneko
--

SELECT pg_catalog.setval('public.content_layouts_id_seq', 1, false);


--
-- Name: AdminAccessLog AdminAccessLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AdminAccessLog"
    ADD CONSTRAINT "AdminAccessLog_pkey" PRIMARY KEY (id);


--
-- Name: AiConversation AiConversation_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiConversation"
    ADD CONSTRAINT "AiConversation_pkey" PRIMARY KEY (id);


--
-- Name: AiCreditPlan AiCreditPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditPlan"
    ADD CONSTRAINT "AiCreditPlan_pkey" PRIMARY KEY (id);


--
-- Name: AiCreditTopUp AiCreditTopUp_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditTopUp"
    ADD CONSTRAINT "AiCreditTopUp_pkey" PRIMARY KEY (id);


--
-- Name: AiCreditUsage AiCreditUsage_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditUsage"
    ADD CONSTRAINT "AiCreditUsage_pkey" PRIMARY KEY (id);


--
-- Name: AiKnowledgeBase AiKnowledgeBase_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiKnowledgeBase"
    ADD CONSTRAINT "AiKnowledgeBase_pkey" PRIMARY KEY (id);


--
-- Name: AiMessage AiMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiMessage"
    ADD CONSTRAINT "AiMessage_pkey" PRIMARY KEY (id);


--
-- Name: AiModel AiModel_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiModel"
    ADD CONSTRAINT "AiModel_pkey" PRIMARY KEY (id);


--
-- Name: AiUsageLimit AiUsageLimit_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiUsageLimit"
    ADD CONSTRAINT "AiUsageLimit_pkey" PRIMARY KEY (id);


--
-- Name: Attendance Attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: BillingAdjustmentLog BillingAdjustmentLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."BillingAdjustmentLog"
    ADD CONSTRAINT "BillingAdjustmentLog_pkey" PRIMARY KEY (id);


--
-- Name: BillingSetting BillingSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."BillingSetting"
    ADD CONSTRAINT "BillingSetting_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: ComboMeta ComboMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."ComboMeta"
    ADD CONSTRAINT "ComboMeta_pkey" PRIMARY KEY (id);


--
-- Name: ConciergeCharacter ConciergeCharacter_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."ConciergeCharacter"
    ADD CONSTRAINT "ConciergeCharacter_pkey" PRIMARY KEY (id);


--
-- Name: DeviceAccessLog DeviceAccessLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."DeviceAccessLog"
    ADD CONSTRAINT "DeviceAccessLog_pkey" PRIMARY KEY (id);


--
-- Name: DeviceRoom DeviceRoom_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."DeviceRoom"
    ADD CONSTRAINT "DeviceRoom_pkey" PRIMARY KEY (id);


--
-- Name: DeviceSecret DeviceSecret_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."DeviceSecret"
    ADD CONSTRAINT "DeviceSecret_pkey" PRIMARY KEY (id);


--
-- Name: GooglePlayApp GooglePlayApp_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."GooglePlayApp"
    ADD CONSTRAINT "GooglePlayApp_pkey" PRIMARY KEY (id);


--
-- Name: Guest Guest_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Guest"
    ADD CONSTRAINT "Guest_pkey" PRIMARY KEY (id);


--
-- Name: HandoverNote HandoverNote_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."HandoverNote"
    ADD CONSTRAINT "HandoverNote_pkey" PRIMARY KEY (id);


--
-- Name: HotelApp HotelApp_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."HotelApp"
    ADD CONSTRAINT "HotelApp_pkey" PRIMARY KEY (id);


--
-- Name: InfoArticle InfoArticle_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoArticle"
    ADD CONSTRAINT "InfoArticle_pkey" PRIMARY KEY (id);


--
-- Name: InfoMediaFile InfoMediaFile_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoMediaFile"
    ADD CONSTRAINT "InfoMediaFile_pkey" PRIMARY KEY (id);


--
-- Name: InfoRevision InfoRevision_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoRevision"
    ADD CONSTRAINT "InfoRevision_pkey" PRIMARY KEY (id);


--
-- Name: InfoSearchLog InfoSearchLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoSearchLog"
    ADD CONSTRAINT "InfoSearchLog_pkey" PRIMARY KEY (id);


--
-- Name: InfoTranslation InfoTranslation_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoTranslation"
    ADD CONSTRAINT "InfoTranslation_pkey" PRIMARY KEY (id);


--
-- Name: LayoutAppBlock LayoutAppBlock_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutAppBlock"
    ADD CONSTRAINT "LayoutAppBlock_pkey" PRIMARY KEY (id);


--
-- Name: LayoutAsset LayoutAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutAsset"
    ADD CONSTRAINT "LayoutAsset_pkey" PRIMARY KEY (id);


--
-- Name: LayoutRevision LayoutRevision_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutRevision"
    ADD CONSTRAINT "LayoutRevision_pkey" PRIMARY KEY (id);


--
-- Name: LayoutSetting LayoutSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutSetting"
    ADD CONSTRAINT "LayoutSetting_pkey" PRIMARY KEY (id);


--
-- Name: Layout Layout_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Layout"
    ADD CONSTRAINT "Layout_pkey" PRIMARY KEY (id);


--
-- Name: MemberGradeAccess MemberGradeAccess_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MemberGradeAccess"
    ADD CONSTRAINT "MemberGradeAccess_pkey" PRIMARY KEY (id);


--
-- Name: MenuAsset MenuAsset_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuAsset"
    ADD CONSTRAINT "MenuAsset_pkey" PRIMARY KEY (id);


--
-- Name: MenuComboItem MenuComboItem_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuComboItem"
    ADD CONSTRAINT "MenuComboItem_pkey" PRIMARY KEY (id);


--
-- Name: MenuItem MenuItem_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_pkey" PRIMARY KEY (id);


--
-- Name: OperationLog OperationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."OperationLog"
    ADD CONSTRAINT "OperationLog_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PlaceGroupMember PlaceGroupMember_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."PlaceGroupMember"
    ADD CONSTRAINT "PlaceGroupMember_pkey" PRIMARY KEY (id);


--
-- Name: PlaceGroup PlaceGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."PlaceGroup"
    ADD CONSTRAINT "PlaceGroup_pkey" PRIMARY KEY (id);


--
-- Name: PlaceType PlaceType_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."PlaceType"
    ADD CONSTRAINT "PlaceType_pkey" PRIMARY KEY (id);


--
-- Name: Place Place_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Place"
    ADD CONSTRAINT "Place_pkey" PRIMARY KEY (id);


--
-- Name: RankingLog RankingLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RankingLog"
    ADD CONSTRAINT "RankingLog_pkey" PRIMARY KEY (id);


--
-- Name: Receipt Receipt_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Receipt"
    ADD CONSTRAINT "Receipt_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: RoomGradeMedia RoomGradeMedia_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomGradeMedia"
    ADD CONSTRAINT "RoomGradeMedia_pkey" PRIMARY KEY (id);


--
-- Name: RoomGrade RoomGrade_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomGrade"
    ADD CONSTRAINT "RoomGrade_pkey" PRIMARY KEY (id);


--
-- Name: RoomMemoComment RoomMemoComment_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemoComment"
    ADD CONSTRAINT "RoomMemoComment_pkey" PRIMARY KEY (id);


--
-- Name: RoomMemoStatusLog RoomMemoStatusLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemoStatusLog"
    ADD CONSTRAINT "RoomMemoStatusLog_pkey" PRIMARY KEY (id);


--
-- Name: RoomMemo RoomMemo_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemo"
    ADD CONSTRAINT "RoomMemo_pkey" PRIMARY KEY (id);


--
-- Name: RoomStatus RoomStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomStatus"
    ADD CONSTRAINT "RoomStatus_pkey" PRIMARY KEY (id);


--
-- Name: Room Room_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_pkey" PRIMARY KEY (id);


--
-- Name: StaffNotification StaffNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."StaffNotification"
    ADD CONSTRAINT "StaffNotification_pkey" PRIMARY KEY (id);


--
-- Name: Staff Staff_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY (id);


--
-- Name: StockUpdateLog StockUpdateLog_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."StockUpdateLog"
    ADD CONSTRAINT "StockUpdateLog_pkey" PRIMARY KEY (id);


--
-- Name: SystemSetting SystemSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."SystemSetting"
    ADD CONSTRAINT "SystemSetting_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: Tenant Tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_pkey" PRIMARY KEY (id);


--
-- Name: WorkSchedule WorkSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."WorkSchedule"
    ADD CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY (id);


--
-- Name: _MenuItemToTag _MenuItemToTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."_MenuItemToTag"
    ADD CONSTRAINT "_MenuItemToTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: additional_devices additional_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.additional_devices
    ADD CONSTRAINT additional_devices_pkey PRIMARY KEY (id);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: content_layout_assets content_layout_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_assets
    ADD CONSTRAINT content_layout_assets_pkey PRIMARY KEY (id);


--
-- Name: content_layout_revisions content_layout_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_revisions
    ADD CONSTRAINT content_layout_revisions_pkey PRIMARY KEY (id);


--
-- Name: content_layout_translations content_layout_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_translations
    ADD CONSTRAINT content_layout_translations_pkey PRIMARY KEY (id);


--
-- Name: content_layouts content_layouts_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layouts
    ADD CONSTRAINT content_layouts_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: monthly_billings monthly_billings_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.monthly_billings
    ADD CONSTRAINT monthly_billings_pkey PRIMARY KEY (id);


--
-- Name: plan_change_logs plan_change_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.plan_change_logs
    ADD CONSTRAINT plan_change_logs_pkey PRIMARY KEY (id);


--
-- Name: plan_restrictions plan_restrictions_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.plan_restrictions
    ADD CONSTRAINT plan_restrictions_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: usage_statistics usage_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.usage_statistics
    ADD CONSTRAINT usage_statistics_pkey PRIMARY KEY (id);


--
-- Name: AdminAccessLog_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AdminAccessLog_createdAt_idx" ON public."AdminAccessLog" USING btree ("createdAt");


--
-- Name: AiConversation_deviceId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiConversation_deviceId_idx" ON public."AiConversation" USING btree ("deviceId");


--
-- Name: AiConversation_language_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiConversation_language_idx" ON public."AiConversation" USING btree (language);


--
-- Name: AiConversation_roomId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiConversation_roomId_idx" ON public."AiConversation" USING btree ("roomId");


--
-- Name: AiConversation_sessionId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "AiConversation_sessionId_key" ON public."AiConversation" USING btree ("sessionId");


--
-- Name: AiCreditPlan_month_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiCreditPlan_month_idx" ON public."AiCreditPlan" USING btree (month);


--
-- Name: AiCreditPlan_month_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "AiCreditPlan_month_key" ON public."AiCreditPlan" USING btree (month);


--
-- Name: AiCreditTopUp_planId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiCreditTopUp_planId_idx" ON public."AiCreditTopUp" USING btree ("planId");


--
-- Name: AiCreditTopUp_purchasedAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiCreditTopUp_purchasedAt_idx" ON public."AiCreditTopUp" USING btree ("purchasedAt");


--
-- Name: AiCreditUsage_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiCreditUsage_createdAt_idx" ON public."AiCreditUsage" USING btree ("createdAt");


--
-- Name: AiCreditUsage_modelId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiCreditUsage_modelId_idx" ON public."AiCreditUsage" USING btree ("modelId");


--
-- Name: AiKnowledgeBase_isActive_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiKnowledgeBase_isActive_idx" ON public."AiKnowledgeBase" USING btree ("isActive");


--
-- Name: AiKnowledgeBase_language_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiKnowledgeBase_language_idx" ON public."AiKnowledgeBase" USING btree (language);


--
-- Name: AiMessage_conversationId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiMessage_conversationId_idx" ON public."AiMessage" USING btree ("conversationId");


--
-- Name: AiMessage_timestamp_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiMessage_timestamp_idx" ON public."AiMessage" USING btree ("timestamp");


--
-- Name: AiModel_isActive_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiModel_isActive_idx" ON public."AiModel" USING btree ("isActive");


--
-- Name: AiModel_name_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "AiModel_name_key" ON public."AiModel" USING btree (name);


--
-- Name: AiUsageLimit_deviceType_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiUsageLimit_deviceType_idx" ON public."AiUsageLimit" USING btree ("deviceType");


--
-- Name: AiUsageLimit_isActive_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AiUsageLimit_isActive_idx" ON public."AiUsageLimit" USING btree ("isActive");


--
-- Name: Attendance_attendance_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Attendance_attendance_status_idx" ON public."Attendance" USING btree (attendance_status);


--
-- Name: Attendance_staff_id_work_date_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Attendance_staff_id_work_date_key" ON public."Attendance" USING btree (staff_id, work_date);


--
-- Name: Attendance_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Attendance_tenant_id_idx" ON public."Attendance" USING btree (tenant_id);


--
-- Name: Attendance_work_date_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Attendance_work_date_idx" ON public."Attendance" USING btree (work_date);


--
-- Name: AuditLog_created_at_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AuditLog_created_at_idx" ON public."AuditLog" USING btree (created_at);


--
-- Name: AuditLog_operation_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AuditLog_operation_idx" ON public."AuditLog" USING btree (operation);


--
-- Name: AuditLog_staff_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AuditLog_staff_id_idx" ON public."AuditLog" USING btree (staff_id);


--
-- Name: AuditLog_table_name_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AuditLog_table_name_idx" ON public."AuditLog" USING btree (table_name);


--
-- Name: AuditLog_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "AuditLog_tenant_id_idx" ON public."AuditLog" USING btree (tenant_id);


--
-- Name: BillingAdjustmentLog_adjustmentType_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "BillingAdjustmentLog_adjustmentType_idx" ON public."BillingAdjustmentLog" USING btree ("adjustmentType");


--
-- Name: BillingAdjustmentLog_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "BillingAdjustmentLog_createdAt_idx" ON public."BillingAdjustmentLog" USING btree ("createdAt");


--
-- Name: BillingAdjustmentLog_orderId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "BillingAdjustmentLog_orderId_idx" ON public."BillingAdjustmentLog" USING btree ("orderId");


--
-- Name: BillingAdjustmentLog_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "BillingAdjustmentLog_placeId_idx" ON public."BillingAdjustmentLog" USING btree ("placeId");


--
-- Name: Category_isAvailable_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Category_isAvailable_idx" ON public."Category" USING btree ("isAvailable");


--
-- Name: Category_parentId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Category_parentId_idx" ON public."Category" USING btree ("parentId");


--
-- Name: ComboMeta_categoryTagId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "ComboMeta_categoryTagId_idx" ON public."ComboMeta" USING btree ("categoryTagId");


--
-- Name: ComboMeta_fixedItemId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "ComboMeta_fixedItemId_idx" ON public."ComboMeta" USING btree ("fixedItemId");


--
-- Name: DeviceAccessLog_accessTime_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "DeviceAccessLog_accessTime_idx" ON public."DeviceAccessLog" USING btree ("accessTime");


--
-- Name: DeviceAccessLog_deviceId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "DeviceAccessLog_deviceId_idx" ON public."DeviceAccessLog" USING btree ("deviceId");


--
-- Name: DeviceAccessLog_pagePath_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "DeviceAccessLog_pagePath_idx" ON public."DeviceAccessLog" USING btree ("pagePath");


--
-- Name: DeviceAccessLog_sessionId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "DeviceAccessLog_sessionId_idx" ON public."DeviceAccessLog" USING btree ("sessionId");


--
-- Name: DeviceRoom_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "DeviceRoom_placeId_idx" ON public."DeviceRoom" USING btree ("placeId");


--
-- Name: DeviceRoom_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "DeviceRoom_tenantId_idx" ON public."DeviceRoom" USING btree ("tenantId");


--
-- Name: DeviceRoom_tenantId_isActive_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "DeviceRoom_tenantId_isActive_idx" ON public."DeviceRoom" USING btree ("tenantId", "isActive");


--
-- Name: DeviceSecret_roomId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "DeviceSecret_roomId_key" ON public."DeviceSecret" USING btree ("roomId");


--
-- Name: GooglePlayApp_category_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "GooglePlayApp_category_idx" ON public."GooglePlayApp" USING btree (category);


--
-- Name: GooglePlayApp_isApproved_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "GooglePlayApp_isApproved_idx" ON public."GooglePlayApp" USING btree ("isApproved");


--
-- Name: GooglePlayApp_packageName_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "GooglePlayApp_packageName_key" ON public."GooglePlayApp" USING btree ("packageName");


--
-- Name: Guest_ageGroup_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Guest_ageGroup_idx" ON public."Guest" USING btree ("ageGroup");


--
-- Name: Guest_gender_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Guest_gender_idx" ON public."Guest" USING btree (gender);


--
-- Name: Guest_roomStatusId_guestNumber_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Guest_roomStatusId_guestNumber_key" ON public."Guest" USING btree ("roomStatusId", "guestNumber");


--
-- Name: Guest_roomStatusId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Guest_roomStatusId_idx" ON public."Guest" USING btree ("roomStatusId");


--
-- Name: HandoverNote_category_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HandoverNote_category_idx" ON public."HandoverNote" USING btree (category);


--
-- Name: HandoverNote_created_at_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HandoverNote_created_at_idx" ON public."HandoverNote" USING btree (created_at);


--
-- Name: HandoverNote_from_staff_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HandoverNote_from_staff_id_idx" ON public."HandoverNote" USING btree (from_staff_id);


--
-- Name: HandoverNote_priority_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HandoverNote_priority_idx" ON public."HandoverNote" USING btree (priority);


--
-- Name: HandoverNote_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HandoverNote_status_idx" ON public."HandoverNote" USING btree (status);


--
-- Name: HandoverNote_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HandoverNote_tenant_id_idx" ON public."HandoverNote" USING btree (tenant_id);


--
-- Name: HandoverNote_to_staff_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HandoverNote_to_staff_id_idx" ON public."HandoverNote" USING btree (to_staff_id);


--
-- Name: HotelApp_isEnabled_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HotelApp_isEnabled_idx" ON public."HotelApp" USING btree ("isEnabled");


--
-- Name: HotelApp_placeId_appId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "HotelApp_placeId_appId_key" ON public."HotelApp" USING btree ("placeId", "appId");


--
-- Name: HotelApp_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "HotelApp_placeId_idx" ON public."HotelApp" USING btree ("placeId");


--
-- Name: InfoArticle_authorRole_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoArticle_authorRole_idx" ON public."InfoArticle" USING btree ("authorRole");


--
-- Name: InfoArticle_category_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoArticle_category_idx" ON public."InfoArticle" USING btree (category);


--
-- Name: InfoArticle_featured_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoArticle_featured_idx" ON public."InfoArticle" USING btree (featured);


--
-- Name: InfoArticle_lang_startAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoArticle_lang_startAt_idx" ON public."InfoArticle" USING btree (lang, "startAt");


--
-- Name: InfoArticle_slug_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "InfoArticle_slug_key" ON public."InfoArticle" USING btree (slug);


--
-- Name: InfoArticle_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoArticle_status_idx" ON public."InfoArticle" USING btree (status);


--
-- Name: InfoMediaFile_articleId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoMediaFile_articleId_idx" ON public."InfoMediaFile" USING btree ("articleId");


--
-- Name: InfoMediaFile_fileType_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoMediaFile_fileType_idx" ON public."InfoMediaFile" USING btree ("fileType");


--
-- Name: InfoRevision_articleId_version_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoRevision_articleId_version_idx" ON public."InfoRevision" USING btree ("articleId", version);


--
-- Name: InfoSearchLog_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoSearchLog_createdAt_idx" ON public."InfoSearchLog" USING btree ("createdAt");


--
-- Name: InfoSearchLog_query_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoSearchLog_query_idx" ON public."InfoSearchLog" USING btree (query);


--
-- Name: InfoTranslation_articleId_lang_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "InfoTranslation_articleId_lang_key" ON public."InfoTranslation" USING btree ("articleId", lang);


--
-- Name: InfoTranslation_lang_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "InfoTranslation_lang_idx" ON public."InfoTranslation" USING btree (lang);


--
-- Name: LayoutAppBlock_layoutId_blockId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "LayoutAppBlock_layoutId_blockId_key" ON public."LayoutAppBlock" USING btree ("layoutId", "blockId");


--
-- Name: LayoutAppBlock_layoutId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "LayoutAppBlock_layoutId_idx" ON public."LayoutAppBlock" USING btree ("layoutId");


--
-- Name: LayoutAsset_fileType_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "LayoutAsset_fileType_idx" ON public."LayoutAsset" USING btree ("fileType");


--
-- Name: LayoutAsset_isPublic_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "LayoutAsset_isPublic_idx" ON public."LayoutAsset" USING btree ("isPublic");


--
-- Name: LayoutAsset_layoutId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "LayoutAsset_layoutId_idx" ON public."LayoutAsset" USING btree ("layoutId");


--
-- Name: LayoutRevision_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "LayoutRevision_createdAt_idx" ON public."LayoutRevision" USING btree ("createdAt");


--
-- Name: LayoutRevision_layoutId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "LayoutRevision_layoutId_idx" ON public."LayoutRevision" USING btree ("layoutId");


--
-- Name: LayoutRevision_layoutId_version_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "LayoutRevision_layoutId_version_key" ON public."LayoutRevision" USING btree ("layoutId", version);


--
-- Name: LayoutSetting_layoutId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "LayoutSetting_layoutId_idx" ON public."LayoutSetting" USING btree ("layoutId");


--
-- Name: LayoutSetting_layoutId_key_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "LayoutSetting_layoutId_key_key" ON public."LayoutSetting" USING btree ("layoutId", key);


--
-- Name: Layout_authorId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_authorId_idx" ON public."Layout" USING btree ("authorId");


--
-- Name: Layout_category_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_category_idx" ON public."Layout" USING btree (category);


--
-- Name: Layout_category_isPublicPage_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_category_isPublicPage_idx" ON public."Layout" USING btree (category, "isPublicPage");


--
-- Name: Layout_isActive_priority_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_isActive_priority_idx" ON public."Layout" USING btree ("isActive", priority);


--
-- Name: Layout_isPublicPage_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_isPublicPage_idx" ON public."Layout" USING btree ("isPublicPage");


--
-- Name: Layout_isScheduled_displayStartAt_displayEndAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_isScheduled_displayStartAt_displayEndAt_idx" ON public."Layout" USING btree ("isScheduled", "displayStartAt", "displayEndAt");


--
-- Name: Layout_isTemplate_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_isTemplate_idx" ON public."Layout" USING btree ("isTemplate");


--
-- Name: Layout_seasonTag_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_seasonTag_idx" ON public."Layout" USING btree ("seasonTag");


--
-- Name: Layout_slug_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_slug_idx" ON public."Layout" USING btree (slug);


--
-- Name: Layout_slug_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Layout_slug_key" ON public."Layout" USING btree (slug);


--
-- Name: Layout_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_status_idx" ON public."Layout" USING btree (status);


--
-- Name: Layout_type_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Layout_type_idx" ON public."Layout" USING btree (type);


--
-- Name: MemberGradeAccess_tenant_id_room_grade_id_member_rank_id_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "MemberGradeAccess_tenant_id_room_grade_id_member_rank_id_key" ON public."MemberGradeAccess" USING btree (tenant_id, room_grade_id, member_rank_id);


--
-- Name: MenuAsset_menuItemId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "MenuAsset_menuItemId_idx" ON public."MenuAsset" USING btree ("menuItemId");


--
-- Name: MenuComboItem_childId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "MenuComboItem_childId_idx" ON public."MenuComboItem" USING btree ("childId");


--
-- Name: MenuComboItem_parentId_childId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "MenuComboItem_parentId_childId_key" ON public."MenuComboItem" USING btree ("parentId", "childId");


--
-- Name: MenuComboItem_parentId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "MenuComboItem_parentId_idx" ON public."MenuComboItem" USING btree ("parentId");


--
-- Name: MenuItem_categoryId_categoryOrder_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "MenuItem_categoryId_categoryOrder_idx" ON public."MenuItem" USING btree ("categoryId", "categoryOrder");


--
-- Name: OperationLog_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "OperationLog_createdAt_idx" ON public."OperationLog" USING btree ("createdAt");


--
-- Name: OperationLog_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "OperationLog_placeId_idx" ON public."OperationLog" USING btree ("placeId");


--
-- Name: OperationLog_type_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "OperationLog_type_idx" ON public."OperationLog" USING btree (type);


--
-- Name: OrderItem_menuItemId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "OrderItem_menuItemId_idx" ON public."OrderItem" USING btree ("menuItemId");


--
-- Name: OrderItem_orderId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "OrderItem_orderId_idx" ON public."OrderItem" USING btree ("orderId");


--
-- Name: OrderItem_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "OrderItem_tenantId_idx" ON public."OrderItem" USING btree ("tenantId");


--
-- Name: OrderItem_tenantId_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "OrderItem_tenantId_status_idx" ON public."OrderItem" USING btree ("tenantId", status);


--
-- Name: Order_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Order_placeId_idx" ON public."Order" USING btree ("placeId");


--
-- Name: Order_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Order_tenantId_idx" ON public."Order" USING btree ("tenantId");


--
-- Name: Order_tenantId_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Order_tenantId_status_idx" ON public."Order" USING btree ("tenantId", status);


--
-- Name: PlaceGroupMember_groupId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "PlaceGroupMember_groupId_idx" ON public."PlaceGroupMember" USING btree ("groupId");


--
-- Name: PlaceGroupMember_placeId_groupId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "PlaceGroupMember_placeId_groupId_key" ON public."PlaceGroupMember" USING btree ("placeId", "groupId");


--
-- Name: PlaceGroupMember_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "PlaceGroupMember_placeId_idx" ON public."PlaceGroupMember" USING btree ("placeId");


--
-- Name: PlaceGroup_isActive_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "PlaceGroup_isActive_idx" ON public."PlaceGroup" USING btree ("isActive");


--
-- Name: PlaceGroup_order_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "PlaceGroup_order_idx" ON public."PlaceGroup" USING btree ("order");


--
-- Name: PlaceType_isActive_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "PlaceType_isActive_idx" ON public."PlaceType" USING btree ("isActive");


--
-- Name: PlaceType_name_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "PlaceType_name_key" ON public."PlaceType" USING btree (name);


--
-- Name: PlaceType_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "PlaceType_tenantId_idx" ON public."PlaceType" USING btree ("tenantId");


--
-- Name: PlaceType_tenantId_order_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "PlaceType_tenantId_order_idx" ON public."PlaceType" USING btree ("tenantId", "order");


--
-- Name: Place_code_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Place_code_key" ON public."Place" USING btree (code);


--
-- Name: Place_isActive_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Place_isActive_idx" ON public."Place" USING btree ("isActive");


--
-- Name: Place_placeTypeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Place_placeTypeId_idx" ON public."Place" USING btree ("placeTypeId");


--
-- Name: Place_tenantId_code_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Place_tenantId_code_idx" ON public."Place" USING btree ("tenantId", code);


--
-- Name: Place_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Place_tenantId_idx" ON public."Place" USING btree ("tenantId");


--
-- Name: RankingLog_day_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RankingLog_day_idx" ON public."RankingLog" USING btree (day);


--
-- Name: RankingLog_day_menuItemId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "RankingLog_day_menuItemId_key" ON public."RankingLog" USING btree (day, "menuItemId");


--
-- Name: RankingLog_menuItemId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RankingLog_menuItemId_idx" ON public."RankingLog" USING btree ("menuItemId");


--
-- Name: Receipt_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Receipt_createdAt_idx" ON public."Receipt" USING btree ("createdAt");


--
-- Name: Receipt_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Receipt_placeId_idx" ON public."Receipt" USING btree ("placeId");


--
-- Name: Reservation_customer_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Reservation_customer_id_idx" ON public."Reservation" USING btree (customer_id);


--
-- Name: Reservation_tenant_id_check_in_date_check_out_date_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Reservation_tenant_id_check_in_date_check_out_date_idx" ON public."Reservation" USING btree (tenant_id, check_in_date, check_out_date);


--
-- Name: Reservation_tenant_id_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Reservation_tenant_id_status_idx" ON public."Reservation" USING btree (tenant_id, status);


--
-- Name: RoomGrade_tenant_id_grade_code_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "RoomGrade_tenant_id_grade_code_key" ON public."RoomGrade" USING btree (tenant_id, grade_code);


--
-- Name: RoomGrade_tenant_id_grade_level_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomGrade_tenant_id_grade_level_idx" ON public."RoomGrade" USING btree (tenant_id, grade_level);


--
-- Name: RoomGrade_tenant_id_is_active_is_public_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomGrade_tenant_id_is_active_is_public_idx" ON public."RoomGrade" USING btree (tenant_id, is_active, is_public);


--
-- Name: RoomGrade_tenant_id_pricing_category_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomGrade_tenant_id_pricing_category_idx" ON public."RoomGrade" USING btree (tenant_id, pricing_category);


--
-- Name: RoomMemoComment_commentType_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemoComment_commentType_idx" ON public."RoomMemoComment" USING btree ("commentType");


--
-- Name: RoomMemoComment_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemoComment_createdAt_idx" ON public."RoomMemoComment" USING btree ("createdAt");


--
-- Name: RoomMemoComment_memoId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemoComment_memoId_idx" ON public."RoomMemoComment" USING btree ("memoId");


--
-- Name: RoomMemoComment_parentCommentId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemoComment_parentCommentId_idx" ON public."RoomMemoComment" USING btree ("parentCommentId");


--
-- Name: RoomMemoStatusLog_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemoStatusLog_createdAt_idx" ON public."RoomMemoStatusLog" USING btree ("createdAt");


--
-- Name: RoomMemoStatusLog_memoId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemoStatusLog_memoId_idx" ON public."RoomMemoStatusLog" USING btree ("memoId");


--
-- Name: RoomMemo_category_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemo_category_idx" ON public."RoomMemo" USING btree (category);


--
-- Name: RoomMemo_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemo_createdAt_idx" ON public."RoomMemo" USING btree ("createdAt");


--
-- Name: RoomMemo_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemo_placeId_idx" ON public."RoomMemo" USING btree ("placeId");


--
-- Name: RoomMemo_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomMemo_status_idx" ON public."RoomMemo" USING btree (status);


--
-- Name: RoomStatus_placeId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomStatus_placeId_idx" ON public."RoomStatus" USING btree ("placeId");


--
-- Name: RoomStatus_placeId_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "RoomStatus_placeId_key" ON public."RoomStatus" USING btree ("placeId");


--
-- Name: RoomStatus_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "RoomStatus_status_idx" ON public."RoomStatus" USING btree (status);


--
-- Name: Room_tenant_id_pricing_room_code_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Room_tenant_id_pricing_room_code_idx" ON public."Room" USING btree (tenant_id, pricing_room_code);


--
-- Name: Room_tenant_id_room_grade_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Room_tenant_id_room_grade_id_idx" ON public."Room" USING btree (tenant_id, room_grade_id);


--
-- Name: Room_tenant_id_room_grade_id_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Room_tenant_id_room_grade_id_status_idx" ON public."Room" USING btree (tenant_id, room_grade_id, status);


--
-- Name: Room_tenant_id_room_number_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Room_tenant_id_room_number_key" ON public."Room" USING btree (tenant_id, room_number);


--
-- Name: StaffNotification_created_at_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "StaffNotification_created_at_idx" ON public."StaffNotification" USING btree (created_at);


--
-- Name: StaffNotification_is_read_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "StaffNotification_is_read_idx" ON public."StaffNotification" USING btree (is_read);


--
-- Name: StaffNotification_staff_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "StaffNotification_staff_id_idx" ON public."StaffNotification" USING btree (staff_id);


--
-- Name: StaffNotification_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "StaffNotification_tenant_id_idx" ON public."StaffNotification" USING btree (tenant_id);


--
-- Name: StaffNotification_type_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "StaffNotification_type_idx" ON public."StaffNotification" USING btree (type);


--
-- Name: Staff_department_code_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Staff_department_code_idx" ON public."Staff" USING btree (department_code);


--
-- Name: Staff_email_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Staff_email_idx" ON public."Staff" USING btree (email);


--
-- Name: Staff_email_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Staff_email_key" ON public."Staff" USING btree (email);


--
-- Name: Staff_employee_id_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Staff_employee_id_key" ON public."Staff" USING btree (employee_id);


--
-- Name: Staff_employment_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Staff_employment_status_idx" ON public."Staff" USING btree (employment_status);


--
-- Name: Staff_is_active_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Staff_is_active_idx" ON public."Staff" USING btree (is_active);


--
-- Name: Staff_tenant_id_employee_id_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Staff_tenant_id_employee_id_key" ON public."Staff" USING btree (tenant_id, employee_id);


--
-- Name: Staff_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Staff_tenant_id_idx" ON public."Staff" USING btree (tenant_id);


--
-- Name: Staff_tenant_id_staff_code_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Staff_tenant_id_staff_code_key" ON public."Staff" USING btree (tenant_id, staff_code);


--
-- Name: Staff_tenant_id_staff_number_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Staff_tenant_id_staff_number_key" ON public."Staff" USING btree (tenant_id, staff_number);


--
-- Name: StockUpdateLog_createdAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "StockUpdateLog_createdAt_idx" ON public."StockUpdateLog" USING btree ("createdAt");


--
-- Name: StockUpdateLog_menuItemId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "StockUpdateLog_menuItemId_idx" ON public."StockUpdateLog" USING btree ("menuItemId");


--
-- Name: SystemSetting_key_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "SystemSetting_key_key" ON public."SystemSetting" USING btree (key);


--
-- Name: Tag_path_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Tag_path_key" ON public."Tag" USING btree (path);


--
-- Name: Tag_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "Tag_tenantId_idx" ON public."Tag" USING btree ("tenantId");


--
-- Name: Tenant_domain_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "Tenant_domain_key" ON public."Tenant" USING btree (domain);


--
-- Name: WorkSchedule_schedule_date_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "WorkSchedule_schedule_date_idx" ON public."WorkSchedule" USING btree (schedule_date);


--
-- Name: WorkSchedule_shift_type_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "WorkSchedule_shift_type_idx" ON public."WorkSchedule" USING btree (shift_type);


--
-- Name: WorkSchedule_staff_id_schedule_date_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "WorkSchedule_staff_id_schedule_date_key" ON public."WorkSchedule" USING btree (staff_id, schedule_date);


--
-- Name: WorkSchedule_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "WorkSchedule_tenant_id_idx" ON public."WorkSchedule" USING btree (tenant_id);


--
-- Name: _MenuItemToTag_B_index; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "_MenuItemToTag_B_index" ON public."_MenuItemToTag" USING btree ("B");


--
-- Name: additional_devices_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX additional_devices_status_idx ON public.additional_devices USING btree (status);


--
-- Name: additional_devices_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "additional_devices_tenantId_idx" ON public.additional_devices USING btree ("tenantId");


--
-- Name: agents_email_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX agents_email_key ON public.agents USING btree (email);


--
-- Name: content_layout_revisions_layoutId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "content_layout_revisions_layoutId_idx" ON public.content_layout_revisions USING btree ("layoutId");


--
-- Name: content_layout_revisions_layoutId_version_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "content_layout_revisions_layoutId_version_key" ON public.content_layout_revisions USING btree ("layoutId", version);


--
-- Name: content_layout_translations_contentLayoutId_language_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "content_layout_translations_contentLayoutId_language_key" ON public.content_layout_translations USING btree ("contentLayoutId", language);


--
-- Name: content_layouts_isDeleted_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "content_layouts_isDeleted_idx" ON public.content_layouts USING btree ("isDeleted");


--
-- Name: content_layouts_language_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX content_layouts_language_idx ON public.content_layouts USING btree (language);


--
-- Name: content_layouts_slug_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX content_layouts_slug_key ON public.content_layouts USING btree (slug);


--
-- Name: content_layouts_status_publishAt_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "content_layouts_status_publishAt_idx" ON public.content_layouts USING btree (status, "publishAt");


--
-- Name: content_layouts_type_category_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX content_layouts_type_category_idx ON public.content_layouts USING btree (type, category);


--
-- Name: customers_member_id_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX customers_member_id_key ON public.customers USING btree (member_id);


--
-- Name: customers_origin_system_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX customers_origin_system_idx ON public.customers USING btree (origin_system);


--
-- Name: customers_rank_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX customers_rank_id_idx ON public.customers USING btree (rank_id);


--
-- Name: customers_tenant_id_email_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX customers_tenant_id_email_key ON public.customers USING btree (tenant_id, email);


--
-- Name: customers_tenant_id_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX customers_tenant_id_idx ON public.customers USING btree (tenant_id);


--
-- Name: customers_tenant_id_phone_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX customers_tenant_id_phone_key ON public.customers USING btree (tenant_id, phone);


--
-- Name: idx_room_grade_media_order; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX idx_room_grade_media_order ON public."RoomGradeMedia" USING btree (room_grade_id, display_order);


--
-- Name: idx_room_grade_media_tenant_grade; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX idx_room_grade_media_tenant_grade ON public."RoomGradeMedia" USING btree (tenant_id, room_grade_id);


--
-- Name: idx_room_grade_media_type; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX idx_room_grade_media_type ON public."RoomGradeMedia" USING btree (media_type, is_active);


--
-- Name: monthly_billings_billingMonth_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "monthly_billings_billingMonth_idx" ON public.monthly_billings USING btree ("billingMonth");


--
-- Name: monthly_billings_status_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX monthly_billings_status_idx ON public.monthly_billings USING btree (status);


--
-- Name: monthly_billings_tenantId_billingMonth_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "monthly_billings_tenantId_billingMonth_key" ON public.monthly_billings USING btree ("tenantId", "billingMonth");


--
-- Name: plan_change_logs_effectiveDate_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "plan_change_logs_effectiveDate_idx" ON public.plan_change_logs USING btree ("effectiveDate");


--
-- Name: plan_change_logs_tenantId_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX "plan_change_logs_tenantId_idx" ON public.plan_change_logs USING btree ("tenantId");


--
-- Name: plan_restrictions_planType_planCategory_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "plan_restrictions_planType_planCategory_key" ON public.plan_restrictions USING btree ("planType", "planCategory");


--
-- Name: referrals_referralCode_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "referrals_referralCode_key" ON public.referrals USING btree ("referralCode");


--
-- Name: usage_statistics_month_idx; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE INDEX usage_statistics_month_idx ON public.usage_statistics USING btree (month);


--
-- Name: usage_statistics_tenantId_month_key; Type: INDEX; Schema: public; Owner: kaneko
--

CREATE UNIQUE INDEX "usage_statistics_tenantId_month_key" ON public.usage_statistics USING btree ("tenantId", month);


--
-- Name: AiConversation AiConversation_deviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiConversation"
    ADD CONSTRAINT "AiConversation_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES public."DeviceRoom"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiCreditTopUp AiCreditTopUp_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditTopUp"
    ADD CONSTRAINT "AiCreditTopUp_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."AiCreditPlan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AiCreditUsage AiCreditUsage_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditUsage"
    ADD CONSTRAINT "AiCreditUsage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."AiConversation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AiCreditUsage AiCreditUsage_modelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiCreditUsage"
    ADD CONSTRAINT "AiCreditUsage_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES public."AiModel"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AiMessage AiMessage_conversationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AiMessage"
    ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES public."AiConversation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Attendance Attendance_approved_by_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_approved_by_staff_id_fkey" FOREIGN KEY (approved_by_staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Attendance Attendance_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Attendance"
    ADD CONSTRAINT "Attendance_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ComboMeta ComboMeta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."ComboMeta"
    ADD CONSTRAINT "ComboMeta_id_fkey" FOREIGN KEY (id) REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DeviceAccessLog DeviceAccessLog_deviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."DeviceAccessLog"
    ADD CONSTRAINT "DeviceAccessLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES public."DeviceRoom"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DeviceRoom DeviceRoom_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."DeviceRoom"
    ADD CONSTRAINT "DeviceRoom_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public."Place"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Guest Guest_roomStatusId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Guest"
    ADD CONSTRAINT "Guest_roomStatusId_fkey" FOREIGN KEY ("roomStatusId") REFERENCES public."RoomStatus"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HandoverNote HandoverNote_acknowledged_by_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."HandoverNote"
    ADD CONSTRAINT "HandoverNote_acknowledged_by_staff_id_fkey" FOREIGN KEY (acknowledged_by_staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HandoverNote HandoverNote_from_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."HandoverNote"
    ADD CONSTRAINT "HandoverNote_from_staff_id_fkey" FOREIGN KEY (from_staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HandoverNote HandoverNote_to_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."HandoverNote"
    ADD CONSTRAINT "HandoverNote_to_staff_id_fkey" FOREIGN KEY (to_staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: HotelApp HotelApp_appId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."HotelApp"
    ADD CONSTRAINT "HotelApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES public."GooglePlayApp"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: HotelApp HotelApp_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."HotelApp"
    ADD CONSTRAINT "HotelApp_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public."Place"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InfoMediaFile InfoMediaFile_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoMediaFile"
    ADD CONSTRAINT "InfoMediaFile_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."InfoArticle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InfoRevision InfoRevision_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoRevision"
    ADD CONSTRAINT "InfoRevision_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."InfoArticle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InfoTranslation InfoTranslation_articleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."InfoTranslation"
    ADD CONSTRAINT "InfoTranslation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES public."InfoArticle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LayoutAppBlock LayoutAppBlock_layoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutAppBlock"
    ADD CONSTRAINT "LayoutAppBlock_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES public."Layout"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LayoutAsset LayoutAsset_layoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutAsset"
    ADD CONSTRAINT "LayoutAsset_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES public."Layout"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: LayoutRevision LayoutRevision_layoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutRevision"
    ADD CONSTRAINT "LayoutRevision_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES public."Layout"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LayoutSetting LayoutSetting_layoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."LayoutSetting"
    ADD CONSTRAINT "LayoutSetting_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES public."Layout"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Layout Layout_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Layout"
    ADD CONSTRAINT "Layout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."Layout"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MemberGradeAccess MemberGradeAccess_room_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MemberGradeAccess"
    ADD CONSTRAINT "MemberGradeAccess_room_grade_id_fkey" FOREIGN KEY (room_grade_id) REFERENCES public."RoomGrade"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MemberGradeAccess MemberGradeAccess_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MemberGradeAccess"
    ADD CONSTRAINT "MemberGradeAccess_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuAsset MenuAsset_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuAsset"
    ADD CONSTRAINT "MenuAsset_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuComboItem MenuComboItem_childId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuComboItem"
    ADD CONSTRAINT "MenuComboItem_childId_fkey" FOREIGN KEY ("childId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuComboItem MenuComboItem_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuComboItem"
    ADD CONSTRAINT "MenuComboItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MenuItem MenuItem_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."MenuItem"
    ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OperationLog OperationLog_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."OperationLog"
    ADD CONSTRAINT "OperationLog_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public."Place"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_menuItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public."Place"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PlaceGroupMember PlaceGroupMember_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."PlaceGroupMember"
    ADD CONSTRAINT "PlaceGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."PlaceGroup"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PlaceGroupMember PlaceGroupMember_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."PlaceGroupMember"
    ADD CONSTRAINT "PlaceGroupMember_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public."Place"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Place Place_placeTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Place"
    ADD CONSTRAINT "Place_placeTypeId_fkey" FOREIGN KEY ("placeTypeId") REFERENCES public."PlaceType"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Receipt Receipt_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Receipt"
    ADD CONSTRAINT "Receipt_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public."Place"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_room_id_fkey" FOREIGN KEY (room_id) REFERENCES public."Room"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoomGradeMedia RoomGradeMedia_room_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomGradeMedia"
    ADD CONSTRAINT "RoomGradeMedia_room_grade_id_fkey" FOREIGN KEY (room_grade_id) REFERENCES public."RoomGrade"(id) ON DELETE CASCADE;


--
-- Name: RoomGrade RoomGrade_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomGrade"
    ADD CONSTRAINT "RoomGrade_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoomMemoComment RoomMemoComment_memoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemoComment"
    ADD CONSTRAINT "RoomMemoComment_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES public."RoomMemo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoomMemoComment RoomMemoComment_parentCommentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemoComment"
    ADD CONSTRAINT "RoomMemoComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES public."RoomMemoComment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: RoomMemoStatusLog RoomMemoStatusLog_memoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemoStatusLog"
    ADD CONSTRAINT "RoomMemoStatusLog_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES public."RoomMemo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoomMemo RoomMemo_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomMemo"
    ADD CONSTRAINT "RoomMemo_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public."Place"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoomStatus RoomStatus_placeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."RoomStatus"
    ADD CONSTRAINT "RoomStatus_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES public."Place"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Room Room_room_grade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_room_grade_id_fkey" FOREIGN KEY (room_grade_id) REFERENCES public."RoomGrade"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Room Room_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Room"
    ADD CONSTRAINT "Room_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StaffNotification StaffNotification_from_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."StaffNotification"
    ADD CONSTRAINT "StaffNotification_from_staff_id_fkey" FOREIGN KEY (from_staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StaffNotification StaffNotification_related_attendance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."StaffNotification"
    ADD CONSTRAINT "StaffNotification_related_attendance_id_fkey" FOREIGN KEY (related_attendance_id) REFERENCES public."Attendance"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StaffNotification StaffNotification_related_handover_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."StaffNotification"
    ADD CONSTRAINT "StaffNotification_related_handover_id_fkey" FOREIGN KEY (related_handover_id) REFERENCES public."HandoverNote"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StaffNotification StaffNotification_related_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."StaffNotification"
    ADD CONSTRAINT "StaffNotification_related_schedule_id_fkey" FOREIGN KEY (related_schedule_id) REFERENCES public."WorkSchedule"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StaffNotification StaffNotification_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."StaffNotification"
    ADD CONSTRAINT "StaffNotification_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Staff Staff_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Staff Staff_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_supervisor_id_fkey" FOREIGN KEY (supervisor_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Staff Staff_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Staff Staff_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Staff"
    ADD CONSTRAINT "Staff_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Tenant Tenant_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."Tenant"
    ADD CONSTRAINT "Tenant_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkSchedule WorkSchedule_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."WorkSchedule"
    ADD CONSTRAINT "WorkSchedule_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WorkSchedule WorkSchedule_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."WorkSchedule"
    ADD CONSTRAINT "WorkSchedule_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WorkSchedule WorkSchedule_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."WorkSchedule"
    ADD CONSTRAINT "WorkSchedule_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."Staff"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: _MenuItemToTag _MenuItemToTag_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."_MenuItemToTag"
    ADD CONSTRAINT "_MenuItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES public."MenuItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MenuItemToTag _MenuItemToTag_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public."_MenuItemToTag"
    ADD CONSTRAINT "_MenuItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: additional_devices additional_devices_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.additional_devices
    ADD CONSTRAINT "additional_devices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: content_layout_assets content_layout_assets_contentLayoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_assets
    ADD CONSTRAINT "content_layout_assets_contentLayoutId_fkey" FOREIGN KEY ("contentLayoutId") REFERENCES public.content_layouts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: content_layout_revisions content_layout_revisions_layoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_revisions
    ADD CONSTRAINT "content_layout_revisions_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES public.content_layouts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: content_layout_translations content_layout_translations_contentLayoutId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layout_translations
    ADD CONSTRAINT "content_layout_translations_contentLayoutId_fkey" FOREIGN KEY ("contentLayoutId") REFERENCES public.content_layouts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: content_layouts content_layouts_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.content_layouts
    ADD CONSTRAINT "content_layouts_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.content_layouts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customers customers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: monthly_billings monthly_billings_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.monthly_billings
    ADD CONSTRAINT "monthly_billings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: plan_change_logs plan_change_logs_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.plan_change_logs
    ADD CONSTRAINT "plan_change_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: referrals referrals_agentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT "referrals_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: referrals referrals_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT "referrals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usage_statistics usage_statistics_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: kaneko
--

ALTER TABLE ONLY public.usage_statistics
    ADD CONSTRAINT "usage_statistics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

