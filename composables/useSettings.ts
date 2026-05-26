import { ref, computed } from 'vue'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'Admin' | 'Viewer' | string
  province?: string
}

export interface LimiterConfig {
  enabled: boolean
  deviceType: string
  minV: number
  maxV: number
  maxA: number
  maxW: number
  maxVAR: number
}

// 🔥 หัวใจสำคัญ: ประกาศ State ไว้นอกฟังก์ชันเพื่อให้ทุก Component ใช้ฐานข้อมูลก้อนเดียวกันตัวเดียวกันจริง ๆ
const activeTab = ref('user')
const searchUser = ref('')
const showAddUser = ref(false)

const defaultNewUser = (): User => ({ id: 0, role: 'Viewer', province: '', firstName: '', lastName: '', email: '', phone: '' })
const newUser = ref<User>(defaultNewUser())

const users = ref<User[]>([
  { id: 1, firstName: 'Admin', lastName: 'Precise', email: 'admin.pe@precise.co.th', phone: '-', role: 'Admin' },
  { id: 2, firstName: 'Admin_TTU', lastName: 'Wellfire', email: 'admin_ttu@wellfire.co.th', phone: '-', role: 'Admin' },
  { id: 3, firstName: 'External', lastName: 'Rule Chain', email: 'external_rule@gmail.com', phone: '-', role: 'Viewer' },
  { id: 4, firstName: 'John', lastName: 'Doe', email: 'john.doe@gmail.com', phone: '0891234567', role: 'Viewer' },
])

const limiter = ref<LimiterConfig>({
  enabled: true,
  deviceType: 'Transformer',
  minV: 200,
  maxV: 240,
  maxA: 50,
  maxW: 15000,
  maxVAR: 5000
})

export function useSettings() {
  
  const filteredUsers = computed(() => {
    if (!searchUser.value) return users.value
    const q = searchUser.value.toLowerCase()
    return users.value.filter(u => 
      u.email.toLowerCase().includes(q) || 
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)
    )
  })

  function openAddUser() {
    newUser.value = defaultNewUser()
    showAddUser.value = true
  }

  function editUser(user: User) {
    newUser.value = { ...user }
    showAddUser.value = true
  }

  function saveUser() {
    if (!newUser.value.email) {
      alert('กรุณากรอก Email')
      return
    }

    if (newUser.value.id === 0) {
      const newId = users.value.length > 0 ? Math.max(...users.value.map(u => u.id)) + 1 : 1
      users.value.push({ ...newUser.value, id: newId })
    } else {
      const index = users.value.findIndex(u => u.id === newUser.value.id)
      if (index !== -1) {
        users.value[index] = { ...newUser.value }
      }
    }
    showAddUser.value = false
    newUser.value = defaultNewUser()
  }

  function deleteUser(id: number) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?')) {
      users.value = users.value.filter(u => u.id !== id)
    }
  }

  function saveLimiterConfig() {
    alert('บันทึกการตั้งค่า Limiter เรียบร้อยแล้ว!')
  }

  return {
    activeTab,
    searchUser, showAddUser, users, newUser, filteredUsers, 
    openAddUser, editUser, saveUser, deleteUser,
    limiter, saveLimiterConfig
  }
}