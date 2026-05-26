<script setup lang="ts">
import { useSettings } from '~/composables/useSettings'
const { searchUser, filteredUsers, openAddUser, editUser, deleteUser } = useSettings()
</script>

<template>
  <div class="card tab-content">
    <div class="toolbar">
      <div class="search-box">
        <i class="ti ti-search" />
        <input type="text" v-model="searchUser" placeholder="Search by email..." />
      </div>
      <button class="sg-btn sg-btn-primary" @click="openAddUser">
        <i class="ti ti-plus" /> Add User
      </button>
    </div>

    <div class="table-responsive">
      <table class="sg-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone No.</th>
            <th>Role</th>
            <th style="text-align: center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td>{{ u.firstName }}</td>
            <td>{{ u.lastName }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.phone }}</td>
            <td>
              <span class="role-badge" :class="u.role.toLowerCase()">{{ u.role }}</span>
            </td>
            <td style="text-align: center;">
              <button class="action-btn edit" title="Edit" @click="editUser(u)"><i class="ti ti-pencil" /></button>
              <button class="action-btn delete" title="Delete" @click="deleteUser(u.id)"><i class="ti ti-trash" /></button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="6" style="text-align: center; padding: 20px; color: var(--color-text-3);">
              No users found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

