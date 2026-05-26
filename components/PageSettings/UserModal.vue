<script setup lang="ts">
import { useSettings } from '~/composables/useSettings'
const { showAddUser, newUser, saveUser } = useSettings()
</script>

<template>
  <Teleport to="body">
    <div v-if="showAddUser" class="modal-overlay" @click.self="showAddUser = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3 style="margin:0; font-size: 16px; color: #185FA5;">
            {{ newUser.id === 0 ? 'Add User' : 'Edit User' }}
          </h3>
          <button class="modal-close" @click="showAddUser = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="sg-field" style="margin-bottom: 12px;">
            <label>Role <span style="color:red">*</span></label>
            <select v-model="newUser.role">
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div class="sg-field" style="margin-bottom: 12px;" v-if="newUser.role !== 'Admin'">
            <label>Province <span style="color:red">*</span></label>
            <select v-model="newUser.province">
              <option value="">Select Province</option>
              <option value="Bangkok">Bangkok</option>
            </select>
          </div>
          <div class="sg-field" style="margin-bottom: 12px;">
            <label>First Name</label>
            <input type="text" v-model="newUser.firstName" />
          </div>
          <div class="sg-field" style="margin-bottom: 12px;">
            <label>Last Name</label>
            <input type="text" v-model="newUser.lastName" />
          </div>
          <div class="sg-field" style="margin-bottom: 12px;">
            <label>Email <span style="color:red">*</span></label>
            <input type="email" v-model="newUser.email" />
          </div>
          <div class="sg-field" style="margin-bottom: 20px;">
            <label>Phone No.</label>
            <input type="text" v-model="newUser.phone" />
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button class="sg-btn sg-btn-outline" @click="showAddUser = false">Cancel</button>
            <button class="sg-btn sg-btn-primary" @click="saveUser">Save User</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

