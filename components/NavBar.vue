<template>
  <nav class="sticky top-0 z-50 flex-none">
    <div
      class="w-full flex flex-row flex-wrap items-center justify-between bg-white px-6 border-b border-gray-300 h-20"
    >
      <div class="flex">
        <!-- Logo -->
        <div
          v-if="showLogo"
          class="hidden flex-none md:flex flex-row items-center w-full h-20 border-b px-6"
        >
          <jabref-logo class="w-10 flex-none" />
          <span class="ml-3 flex-1 text-gray-900 text-2xl font-semibold"
            >JabRef</span
          >
        </div>

        <!-- Hamburger icon for small screens -->
        <div class="flex md:hidden mr-5 items-center">
          <button
            id="sidebarToggle"
            class="text-right text-gray-900 h-6 w-6"
          >
            <FontAwesomeIcon icon="list-ul" />
          </button>
        </div>

        <!-- Search bar -->
        <div
          v-if="showSearchBar"
          class="relative text-gray-600"
        >
          <t-input
            v-model="searchQuery"
            type="search"
            placeholder="Search..."
            class="w-full xl:w-96 px-5 border-none shadow-none pl-10 font-semibold text-lg"
          />
          <button
            type="submit"
            class="absolute left-0 top-0 bottom-0 ml-2"
          >
            <FontAwesomeIcon
              icon="search"
              class="text-gray-400"
            />
          </button>
        </div>
      </div>

      <!-- Main menu -->
      <slot>
        <div class="space-x-14">
          <span class="text-primary-600 text-lg font-semibold">Library</span>
          <span class="text-gray-400 text-lg font-semibold">Browse</span>
          <div class="inline">
            <span class="text-gray-400 text-lg font-semibold">
              Subscriptions
            </span>
            <div class="inline-block align-top pl-0.5 -mt-1">
              <FontAwesomeIcon
                icon="circle"
                class="text-primary-600"
                size="xs"
              />
            </div>
          </div>
        </div>
      </slot>

      <!-- User profile -->
      <div class="flex items-center pr-10 space-x-7">
        <FontAwesomeIcon
          icon="bell"
          class="text-gray-400 hover:text-highlight-500"
          size="lg"
        />
        <div>
          <!-- User profile dropdown -->
          <t-dropdown variant="left">
            <template
              #trigger="{
                mousedownHandler,
                focusHandler,
                blurHandler,
                keydownHandler,
              }"
            >
              <button
                id="user-menu"
                class="w-12 h-12"
                aria-label="User menu"
                aria-haspopup="true"
                @mousedown="mousedownHandler"
                @focus="focusHandler"
                @blur="blurHandler"
                @keydown="keydownHandler"
              >
                <img
                  class="rounded-full"
                  src="https://a7sas.net/wp-content/uploads/2019/07/4060.jpeg"
                  alt=""
                />
              </button>
            </template>

            <template #default="{ blurHandler }">
              <div class="w-36">
                <button
                  class="block w-full px-4 py-2 text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  role="menuitem"
                  @blur="blurHandler"
                >
                  Your Profile
                </button>
                <button
                  class="block w-full px-4 py-2 text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  role="menuitem"
                  @blur="blurHandler"
                >
                  Settings
                </button>
                <button
                  class="block w-full px-4 py-2 text-sm leading-5 text-gray-700 transition duration-150 ease-in-out border-t hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  @click="logout()"
                >
                  Logout
                </button>
              </div>
            </template>
          </t-dropdown>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useApolloClient, useMutation } from '@vue/apollo-composable'
import { gql } from '~/apollo'
import { cacheCurrentUser } from '~/apollo/cache'
import { useUiStore } from '~/store'

defineProps({
  showLogo: {
    type: Boolean,
    default: false,
  },
  showSearchBar: {
    type: Boolean,
    default: true,
  },
})

const { resolveClient } = useApolloClient()

const { mutate: logout, onDone } = useMutation(
  gql(/* GraphQL */ `
    mutation Logout {
      logout {
        result
      }
    }
  `),
  {
    update(cache, _data) {
      cacheCurrentUser(cache, null)
    },
  }
)

onDone(() => {
  // Reset graphql cache
  void resolveClient().clearStore()

  void navigateTo({ name: 'index' })
})

const uiStore = useUiStore()
// TODO:Don't update store immediately to avoid unnecessary queries to the server.
// For some reason `toRef(uiStore.activeSearchQuery) + useDebounce` or `debouncedWatch` doesn't work here
const searchQuery = ref(uiStore.activeSearchQuery ?? '')

watch(searchQuery, (newQuery) => {
  uiStore.activeSearchQuery = newQuery
})
</script>
