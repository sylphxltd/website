import { computed } from 'vue'
import { useUserStore } from '~/stores/user'

// 定義導航連結嘅類型
interface NavLink {
  name: string
  path: string
  external?: boolean
  adminOnly?: boolean // 新增：標識只對管理員顯示
  authRequired?: boolean // 新增：標識需要登入先顯示 (非管理員)
}

export function useNavigation() {
  const userStore = useUserStore()

  // 定義所有可能嘅連結
  const allLinks: NavLink[] = [
    // --- 公開連結 ---
    { name: 'About', path: '/' }, // 保持現狀或改名做 Home?
    { name: 'Products', path: '/products' }, // 公開展示應用/產品
    { name: 'Technologies', path: '/technologies' },
    // { name: 'Privacy Policy', path: '/privacy' }, // 移到 Footer
    { name: 'Contact', path: 'mailto:support@sylphx.com', external: true },

    // --- 需要登入 (非管理員) ---
    // 可以考慮加個 Dashboard 或 Profile
    // { name: 'Dashboard', path: '/dashboard', authRequired: true },

    // --- 管理員專用 ---
    { name: 'Admin Dashboard', path: '/admin', adminOnly: true }, // 單一入口點
    // Individual admin links removed from main navigation
  ]

  // 計算最終顯示嘅連結
  const navLinks = computed(() => {
    // Ensure userStore is initialized and auth state is potentially available
    // This might still render initial state if auth hasn't resolved,
    // but reactivity will update it once the store changes.
    return allLinks.filter(link => {
      if (link.adminOnly) {
        // 只顯示俾管理員
        return userStore.isAuthenticated && userStore.isAdmin
      }
      if (link.authRequired) {
        // 只顯示俾已登入用戶 (包括管理員)
        return userStore.isAuthenticated
      }
      // 公開連結，所有人可見
      return true
    })
  })

  // 頁腳連結 (例如 Privacy Policy)
  const footerLinks = computed(() => {
      return [
          { name: 'Privacy Policy', path: '/privacy' },
          // 可以加其他頁腳連結
      ]
  })


  return {
    navLinks,
    footerLinks
  }
}