import { ref, computed } from 'vue'

export interface DeviceStatus {
  id: string
  name: string
  type: 'Transformer' | 'EV' | 'PV'
  status: 'Online' | 'Offline'
  power: number 
  voltage: number
  current: number
}

const devices = ref<DeviceStatus[]>([
  { id: 'TR-01', name: 'หม้อแปลง เขต 1', type: 'Transformer', status: 'Offline', power: 0, voltage: 0, current: 0 },
  { id: 'EV-01', name: 'จุดชาร์จ EV-A', type: 'EV', status: 'Offline', power: 0, voltage: 0, current: 0 },
  { id: 'PV-01', name: 'โซลาร์เซลล์ อาคาร A', type: 'PV', status: 'Offline', power: 0, voltage: 0, current: 0 },
])

const isLoading = ref(false)
let pollingTimer: any = null

export function useDashboard() {
  const totalPower = computed(() => devices.value.reduce((sum, d) => sum + d.power, 0))
  const onlineCount = computed(() => devices.value.filter(d => d.status === 'Online').length)

  async function refreshData() {
    isLoading.value = true
    try {
      const response = await fetch('http://192.168.1.100:1880/api/energy')
      if (!response.ok) throw new Error('API Error')
      
      const data = await response.json()
      
      // อัปเดตข้อมูลให้หม้อแปลง TR-01
      const tr = devices.value.find(d => d.id === 'TR-01')
      if (tr) {
        tr.status = 'Online'
        tr.voltage = parseFloat(data.V_A) || 0
        tr.current = parseFloat(data.I_A) || 0
        tr.power = (parseFloat(data.P_Total) || 0) * 1000 // แปลง kW เป็น W
      }
    } catch (error) {
      console.error("เชื่อมต่อ Node-RED ไม่ได้:", error)
      devices.value.forEach(d => d.status = 'Offline')
    } finally {
      isLoading.value = false
    }
  }

  function startPolling() {
    refreshData()
    if (!pollingTimer) {
      pollingTimer = setInterval(refreshData, 3000)
    }
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
  }

  return { 
    devices, 
    isLoading, 
    totalPower, 
    onlineCount, 
    refreshData, 
    startPolling, 
    stopPolling 
  }
} // 🟢 <--- ปีกกาตัวนี้แหละครับที่หายไป!