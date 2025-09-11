
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('@prisma/client/runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.DatabaseChangeLogScalarFieldEnum = {
  id: 'id',
  changeType: 'changeType',
  description: 'description',
  details: 'details',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  roomId: 'roomId',
  placeId: 'placeId',
  status: 'status',
  items: 'items',
  total: 'total',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  paidAt: 'paidAt',
  isDeleted: 'isDeleted',
  deletedAt: 'deletedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  orderId: 'orderId',
  menuItemId: 'menuItemId',
  name: 'name',
  price: 'price',
  quantity: 'quantity',
  status: 'status',
  notes: 'notes',
  deliveredAt: 'deliveredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemPlanRestrictionsScalarFieldEnum = {
  id: 'id',
  systemType: 'systemType',
  businessType: 'businessType',
  planType: 'planType',
  planCategory: 'planCategory',
  monthlyPrice: 'monthlyPrice',
  maxDevices: 'maxDevices',
  additionalDeviceCost: 'additionalDeviceCost',
  roomTerminalCost: 'roomTerminalCost',
  frontDeskCost: 'frontDeskCost',
  kitchenCost: 'kitchenCost',
  barCost: 'barCost',
  housekeepingCost: 'housekeepingCost',
  managerCost: 'managerCost',
  commonAreaCost: 'commonAreaCost',
  enableAiConcierge: 'enableAiConcierge',
  enableMultilingual: 'enableMultilingual',
  enableLayoutEditor: 'enableLayoutEditor',
  enableFacilityGuide: 'enableFacilityGuide',
  enableAiBusinessSupport: 'enableAiBusinessSupport',
  maxMonthlyOrders: 'maxMonthlyOrders',
  maxMonthlyAiRequests: 'maxMonthlyAiRequests',
  maxStorageGB: 'maxStorageGB',
  multilingualUpgradePrice: 'multilingualUpgradePrice',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  domain: 'domain',
  status: 'status',
  contactEmail: 'contactEmail',
  createdAt: 'createdAt',
  features: 'features',
  planType: 'planType',
  settings: 'settings'
};

exports.Prisma.TenantSystemPlanScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  systemType: 'systemType',
  planId: 'planId',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  monthlyPrice: 'monthlyPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  email: 'email',
  username: 'username',
  display_name: 'display_name',
  password_hash: 'password_hash',
  admin_level: 'admin_level',
  accessible_group_ids: 'accessible_group_ids',
  accessible_chain_ids: 'accessible_chain_ids',
  accessible_tenant_ids: 'accessible_tenant_ids',
  last_login_at: 'last_login_at',
  login_attempts: 'login_attempts',
  locked_until: 'locked_until',
  totp_secret: 'totp_secret',
  totp_enabled: 'totp_enabled',
  created_at: 'created_at',
  updated_at: 'updated_at',
  created_by: 'created_by',
  is_active: 'is_active'
};

exports.Prisma.Admin_logScalarFieldEnum = {
  id: 'id',
  admin_id: 'admin_id',
  action: 'action',
  target_type: 'target_type',
  target_id: 'target_id',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  success: 'success',
  error_message: 'error_message',
  created_at: 'created_at'
};

exports.Prisma.Campaign_categoriesScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  code: 'code',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Campaign_category_relationsScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  categoryId: 'categoryId',
  createdAt: 'createdAt'
};

exports.Prisma.Campaign_itemsScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  itemId: 'itemId',
  itemType: 'itemType',
  priority: 'priority',
  createdAt: 'createdAt'
};

exports.Prisma.Campaign_translationsScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  locale: 'locale',
  title: 'title',
  description: 'description',
  imageUrl: 'imageUrl',
  languageCode: 'languageCode',
  name: 'name'
};

exports.Prisma.Campaign_usage_logsScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  userId: 'userId',
  deviceId: 'deviceId',
  action: 'action',
  createdAt: 'createdAt'
};

exports.Prisma.CampaignsScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  code: 'code',
  status: 'status',
  displayType: 'displayType',
  startDate: 'startDate',
  endDate: 'endDate',
  priority: 'priority',
  ctaType: 'ctaType',
  ctaAction: 'ctaAction',
  ctaLabel: 'ctaLabel',
  discountType: 'discountType',
  discountValue: 'discountValue',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  dayRestrictions: 'dayRestrictions',
  description: 'description',
  displayPriority: 'displayPriority',
  maxUsageCount: 'maxUsageCount',
  name: 'name',
  timeRestrictions: 'timeRestrictions',
  welcomeSettings: 'welcomeSettings'
};

exports.Prisma.Device_roomsScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  roomId: 'roomId',
  roomName: 'roomName',
  deviceId: 'deviceId',
  deviceType: 'deviceType',
  placeId: 'placeId',
  status: 'status',
  ipAddress: 'ipAddress',
  macAddress: 'macAddress',
  lastUsedAt: 'lastUsedAt',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.Device_video_cachesScalarFieldEnum = {
  id: 'id',
  deviceId: 'deviceId',
  videoIds: 'videoIds',
  lastShownAt: 'lastShownAt',
  updatedAt: 'updatedAt',
  lastViewedAt: 'lastViewedAt',
  userId: 'userId',
  viewed: 'viewed'
};

exports.Prisma.Notification_templatesScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  type: 'type',
  code: 'code',
  subject: 'subject',
  content: 'content',
  variables: 'variables',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at',
  body: 'body',
  html: 'html',
  locale: 'locale'
};

exports.Prisma.Page_historiesScalarFieldEnum = {
  Id: 'Id',
  PageId: 'PageId',
  Html: 'Html',
  Css: 'Css',
  Content: 'Content',
  Template: 'Template',
  Version: 'Version',
  CreatedAt: 'CreatedAt',
  CreatedBy: 'CreatedBy'
};

exports.Prisma.PagesScalarFieldEnum = {
  Id: 'Id',
  TenantId: 'TenantId',
  Slug: 'Slug',
  Title: 'Title',
  Html: 'Html',
  Css: 'Css',
  Content: 'Content',
  Template: 'Template',
  IsPublished: 'IsPublished',
  PublishedAt: 'PublishedAt',
  Version: 'Version',
  CreatedAt: 'CreatedAt',
  UpdatedAt: 'UpdatedAt'
};

exports.Prisma.Response_node_translationsScalarFieldEnum = {
  id: 'id',
  nodeId: 'nodeId',
  locale: 'locale',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  answer: 'answer',
  language: 'language',
  title: 'title'
};

exports.Prisma.Response_nodesScalarFieldEnum = {
  id: 'id',
  treeId: 'treeId',
  nodeType: 'nodeType',
  content: 'content',
  metadata: 'metadata',
  isRoot: 'isRoot',
  parentId: 'parentId',
  position: 'position',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  answer: 'answer',
  description: 'description',
  icon: 'icon',
  order: 'order',
  title: 'title',
  type: 'type'
};

exports.Prisma.Response_tree_historyScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  nodeId: 'nodeId',
  response: 'response',
  metadata: 'metadata',
  createdAt: 'createdAt',
  action: 'action',
  timestamp: 'timestamp'
};

exports.Prisma.Response_tree_mobile_linksScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  code: 'code',
  qrCodeData: 'qrCodeData',
  isActive: 'isActive',
  connectionId: 'connectionId',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  connectedAt: 'connectedAt',
  deviceId: 'deviceId'
};

exports.Prisma.Response_tree_sessionsScalarFieldEnum = {
  id: 'id',
  treeId: 'treeId',
  userId: 'userId',
  deviceId: 'deviceId',
  currentNodeId: 'currentNodeId',
  metadata: 'metadata',
  isComplete: 'isComplete',
  startedAt: 'startedAt',
  updatedAt: 'updatedAt',
  completedAt: 'completedAt',
  endedAt: 'endedAt',
  interfaceType: 'interfaceType',
  language: 'language',
  lastActivityAt: 'lastActivityAt',
  roomId: 'roomId',
  sessionId: 'sessionId'
};

exports.Prisma.Response_tree_versionsScalarFieldEnum = {
  id: 'id',
  treeId: 'treeId',
  version: 'version',
  snapshot: 'snapshot',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  data: 'data'
};

exports.Prisma.Response_treesScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  name: 'name',
  description: 'description',
  isPublished: 'isPublished',
  publishedAt: 'publishedAt',
  version: 'version',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isActive: 'isActive'
};

exports.Prisma.Room_gradesScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  code: 'code',
  name: 'name',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Schema_versionScalarFieldEnum = {
  version: 'version',
  description: 'description',
  rollback_sql: 'rollback_sql',
  applied_at: 'applied_at',
  applied_by: 'applied_by'
};

exports.Prisma.Service_plan_restrictionsScalarFieldEnum = {
  id: 'id',
  service_type: 'service_type',
  plan_type: 'plan_type',
  plan_category: 'plan_category',
  max_users: 'max_users',
  max_devices: 'max_devices',
  max_monthly_orders: 'max_monthly_orders',
  enable_ai_concierge: 'enable_ai_concierge',
  enable_multilingual: 'enable_multilingual',
  max_rooms: 'max_rooms',
  enable_revenue_management: 'enable_revenue_management',
  max_monthly_ai_requests: 'max_monthly_ai_requests',
  enable_ai_crm: 'enable_ai_crm',
  monthly_price: 'monthly_price',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.Service_usage_statisticsScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  service_type: 'service_type',
  month: 'month',
  active_users_count: 'active_users_count',
  active_devices_count: 'active_devices_count',
  usage_data: 'usage_data',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.StaffScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  email: 'email',
  name: 'name',
  role: 'role',
  department: 'department',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at',
  failed_login_count: 'failed_login_count',
  last_login_at: 'last_login_at',
  locked_until: 'locked_until',
  password_hash: 'password_hash'
};

exports.Prisma.System_eventScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  user_id: 'user_id',
  event_type: 'event_type',
  source_system: 'source_system',
  target_system: 'target_system',
  entity_type: 'entity_type',
  entity_id: 'entity_id',
  action: 'action',
  event_data: 'event_data',
  created_at: 'created_at',
  processed_at: 'processed_at',
  status: 'status'
};

exports.Prisma.Tenant_access_logsScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  user_id: 'user_id',
  action: 'action',
  resource: 'resource',
  ip_address: 'ip_address',
  user_agent: 'user_agent',
  created_at: 'created_at',
  source_system: 'source_system'
};

exports.Prisma.Tenant_servicesScalarFieldEnum = {
  id: 'id',
  tenant_id: 'tenant_id',
  service_type: 'service_type',
  plan_type: 'plan_type',
  is_active: 'is_active',
  activated_at: 'activated_at',
  expires_at: 'expires_at',
  service_config: 'service_config',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.AdminLevel = exports.$Enums.AdminLevel = {
  chainadmin: 'chainadmin',
  groupadmin: 'groupadmin',
  superadmin: 'superadmin'
};

exports.CampaignStatus = exports.$Enums.CampaignStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED',
  SCHEDULED: 'SCHEDULED'
};

exports.CampaignDisplayType = exports.$Enums.CampaignDisplayType = {
  BANNER: 'BANNER',
  POPUP: 'POPUP',
  NOTIFICATION: 'NOTIFICATION',
  FEATURED: 'FEATURED'
};

exports.CampaignCtaType = exports.$Enums.CampaignCtaType = {
  NONE: 'NONE',
  LINK: 'LINK',
  BUTTON: 'BUTTON',
  COUPON: 'COUPON'
};

exports.Prisma.ModelName = {
  DatabaseChangeLog: 'DatabaseChangeLog',
  Order: 'Order',
  OrderItem: 'OrderItem',
  SystemPlanRestrictions: 'SystemPlanRestrictions',
  Tenant: 'Tenant',
  TenantSystemPlan: 'TenantSystemPlan',
  admin: 'admin',
  admin_log: 'admin_log',
  campaign_categories: 'campaign_categories',
  campaign_category_relations: 'campaign_category_relations',
  campaign_items: 'campaign_items',
  campaign_translations: 'campaign_translations',
  campaign_usage_logs: 'campaign_usage_logs',
  campaigns: 'campaigns',
  device_rooms: 'device_rooms',
  device_video_caches: 'device_video_caches',
  notification_templates: 'notification_templates',
  page_histories: 'page_histories',
  pages: 'pages',
  response_node_translations: 'response_node_translations',
  response_nodes: 'response_nodes',
  response_tree_history: 'response_tree_history',
  response_tree_mobile_links: 'response_tree_mobile_links',
  response_tree_sessions: 'response_tree_sessions',
  response_tree_versions: 'response_tree_versions',
  response_trees: 'response_trees',
  room_grades: 'room_grades',
  schema_version: 'schema_version',
  service_plan_restrictions: 'service_plan_restrictions',
  service_usage_statistics: 'service_usage_statistics',
  staff: 'staff',
  system_event: 'system_event',
  tenant_access_logs: 'tenant_access_logs',
  tenant_services: 'tenant_services'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
