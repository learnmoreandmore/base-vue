import type { BackendRoute, UserRole } from '@/types/auth'
import { LOAN_PERMISSION, loanButtonsAuditor, loanButtonsFull, loanButtonsOps } from '@/constants/loanPermissions'

const L = LOAN_PERMISSION

/** 信贷后管一级模块（企业级菜单分组） */
const loanCenterModule: BackendRoute = {
  path: '/loan',
  name: 'Loan',
  component: 'layout',
  redirect: '/loan/workbench',
  meta: { title: '信贷中心', icon: 'Money' },
  children: [
    {
      path: '/loan/workbench',
      name: 'LoanWorkbench',
      component: 'loan/LoanWorkbenchView',
      meta: { title: '信贷工作台', permissionCode: L.workbench.view },
    },
    {
      path: '/loan/product',
      name: 'LoanProduct',
      component: 'loan/LoanProductView',
      meta: { title: '产品工厂', permissionCode: L.product.view },
    },
    {
      path: '/loan/application',
      name: 'LoanApplication',
      component: 'loan/LoanApplicationView',
      meta: { title: '进件管理', permissionCode: L.application.view },
    },
    {
      path: '/loan/approval',
      name: 'LoanApproval',
      component: 'loan/LoanApprovalView',
      meta: { title: '授信审批', permissionCode: L.approval.view },
    },
    {
      path: '/loan/contract',
      name: 'LoanContract',
      component: 'loan/LoanContractView',
      meta: { title: '合同管理', permissionCode: L.contract.view },
    },
    {
      path: '/loan/disburse',
      name: 'LoanDisburse',
      component: 'loan/LoanDisburseView',
      meta: { title: '放款执行', permissionCode: L.disburse.view },
    },
    {
      path: '/loan/repay',
      name: 'LoanRepay',
      component: 'loan/LoanRepayView',
      meta: { title: '还款管理', permissionCode: L.repay.view },
    },
    {
      path: '/loan/overdue',
      name: 'LoanOverdue',
      component: 'loan/LoanOverdueView',
      meta: { title: '逾期催收', permissionCode: L.overdue.view },
    },
    {
      path: '/loan/risk',
      name: 'LoanRisk',
      component: 'loan/LoanRiskView',
      meta: { title: '风控洞察', permissionCode: L.risk.view },
    },
    {
      path: '/loan/media',
      name: 'LoanMedia',
      component: 'loan/LoanMediaCenterView',
      meta: { title: '媒体与附件', permissionCode: L.media.view },
    },
  ],
}

/** 审计角色：仅开放贷后风控相关菜单（路由 name 独立，避免与主信贷模块冲突） */
const loanAuditorModule: BackendRoute = {
  path: '/loan',
  name: 'LoanAudit',
  component: 'layout',
  redirect: '/loan/risk',
  meta: { title: '信贷风控', icon: 'Money' },
  children: [
    {
      path: '/loan/risk',
      name: 'LoanAuditRisk',
      component: 'loan/LoanRiskView',
      meta: { title: '风控洞察', permissionCode: L.risk.view },
    },
    {
      path: '/loan/overdue',
      name: 'LoanAuditOverdue',
      component: 'loan/LoanOverdueView',
      meta: { title: '逾期催收', permissionCode: L.overdue.view },
    },
  ],
}

const homeModule: BackendRoute = {
  path: '/home',
  name: 'Home',
  component: 'layout',
  meta: { title: '首页', icon: 'HomeFilled' },
  children: [
    {
      /** 空 path：实际 URL 为 `/home`，避免静态托管将 `/home/index` 误解析为目录并 301 到 `/home/` */
      path: '',
      name: 'HomeIndex',
      component: 'home/HomeView',
      meta: { title: '信贷可视化大屏', affix: true, hideInMenu: true },
    },
  ],
}

/** 侧栏一级「AI 助手」，子页隐藏与首页同款扁平展示 */
const aiAssistantModule: BackendRoute = {
  path: '/ai',
  name: 'AiAssistant',
  component: 'layout',
  redirect: '/ai/chat',
  meta: { title: 'AI 助手', icon: 'ChatDotRound' },
  children: [
    {
      path: '/ai/chat',
      name: 'AiAssistantChat',
      component: 'ai/AiAssistantView',
      meta: { title: '智能对话', hideInMenu: true },
    },
  ],
}

const commonRoutes: BackendRoute[] = [
  homeModule,
  aiAssistantModule,
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: 'layout',
    redirect: '/dashboard/overview',
    meta: { title: '工作台', icon: 'Monitor' },
    children: [
      {
        path: '/dashboard/overview',
        name: 'DashboardOverview',
        component: 'dashboard/OverviewView',
        meta: { title: '运营概览', icon: 'DataLine' },
      },
      {
        path: '/dashboard/screen',
        name: 'DashboardScreen',
        component: 'dashboard/DataScreenView',
        meta: { title: '数据大屏', icon: 'TrendCharts' },
      },
    ],
  },
]

const roleRoutes: Record<UserRole, BackendRoute[]> = {
  'super-admin': [
    ...commonRoutes,
    loanCenterModule,
    {
      path: '/system',
      name: 'System',
      component: 'layout',
      redirect: '/system/permission',
      meta: { title: '系统管理', icon: 'Setting' },
      children: [
        {
          path: '/system/permission',
          name: 'SystemPermission',
          component: 'system/UserPermissionView',
          meta: { title: '权限管理', permissionCode: 'system:permission:view' },
        },
      ],
    },
    {
      path: '/approval',
      name: 'Approval',
      component: 'layout',
      children: [
        {
          path: '/approval/flow',
          name: 'ApprovalFlow',
          component: 'approval/ApprovalFlowView',
          meta: { title: '业务审批', permissionCode: 'approval:flow:view' },
        },
      ],
      meta: { title: '流程中心', icon: 'List' },
    },
    {
      path: '/material',
      name: 'Material',
      component: 'layout',
      children: [
        {
          path: '/material/list',
          name: 'MaterialList',
          component: 'material/MaterialListView',
          meta: { title: '物料管理', permissionCode: 'material:list:view' },
        },
      ],
      meta: { title: '物料中心', icon: 'Goods' },
    },
    {
      path: '/log',
      name: 'Log',
      component: 'layout',
      children: [
        {
          path: '/log/monitor',
          name: 'LogMonitor',
          component: 'log/LogMonitorView',
          meta: { title: '日志监控', permissionCode: 'log:monitor:view' },
        },
      ],
      meta: { title: '审计追踪', icon: 'Document' },
    },
  ],
  ops: [
    ...commonRoutes,
    loanCenterModule,
    {
      path: '/approval',
      name: 'Approval',
      component: 'layout',
      children: [
        {
          path: '/approval/flow',
          name: 'ApprovalFlow',
          component: 'approval/ApprovalFlowView',
          meta: { title: '业务审批', permissionCode: 'approval:flow:view' },
        },
      ],
      meta: { title: '流程中心', icon: 'List' },
    },
    {
      path: '/material',
      name: 'Material',
      component: 'layout',
      children: [
        {
          path: '/material/list',
          name: 'MaterialList',
          component: 'material/MaterialListView',
          meta: { title: '物料管理', permissionCode: 'material:list:view' },
        },
      ],
      meta: { title: '物料中心', icon: 'Goods' },
    },
  ],
  auditor: [
    ...commonRoutes,
    loanAuditorModule,
    {
      path: '/log',
      name: 'Log',
      component: 'layout',
      children: [
        {
          path: '/log/monitor',
          name: 'LogMonitor',
          component: 'log/LogMonitorView',
          meta: { title: '日志监控', permissionCode: 'log:monitor:view' },
        },
      ],
      meta: { title: '审计追踪', icon: 'Document' },
    },
  ],
  warehouse: [
    ...commonRoutes,
    {
      path: '/material',
      name: 'Material',
      component: 'layout',
      children: [
        {
          path: '/material/list',
          name: 'MaterialList',
          component: 'material/MaterialListView',
          meta: { title: '物料管理', permissionCode: 'material:list:view' },
        },
      ],
      meta: { title: '物料中心', icon: 'Goods' },
    },
  ],
}

const roleButtonPermissions: Record<UserRole, string[]> = {
  'super-admin': [
    'system:permission:view',
    'system:permission:edit',
    'approval:flow:view',
    'approval:flow:approve',
    'material:list:view',
    'material:list:edit',
    'material:list:export',
    'log:monitor:view',
    ...loanButtonsFull,
  ],
  ops: [
    'approval:flow:view',
    'approval:flow:approve',
    'material:list:view',
    'material:list:export',
    ...loanButtonsOps,
  ],
  auditor: ['log:monitor:view', 'approval:flow:view', ...loanButtonsAuditor],
  warehouse: ['material:list:view', 'material:list:edit'],
}

export function getRoleRoutes(role: UserRole): BackendRoute[] {
  return roleRoutes[role]
}

export function getButtonPermissions(role: UserRole): string[] {
  return roleButtonPermissions[role]
}
