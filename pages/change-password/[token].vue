<template>
  <NuxtLayout name="bare">
    <template #header>
      <jabref-logo class="mx-auto h-20 w-auto" />
      <h2 class="mt-8 text-center text-5xl font-extrabold text-gray-900">
        Change Password
      </h2>
    </template>
    <div>
      <form @submit.prevent="changePassword()">
        <div class="space-y-5">
          <t-input-group
            label="New Password"
            variant="important"
          >
            <PasswordInput v-model="password" />
          </t-input-group>
          <t-input-group
            label="Confirm Password"
            variant="important"
          >
            <PasswordInput v-model="repeatPassword" />
          </t-input-group>
        </div>
        <div class="py-2">
          <t-button
            class="w-full"
            type="submit"
            >Change Password</t-button
          >
        </div>
      </form>
    </div>
  </NuxtLayout>
</template>

<script lang="ts">
import { useMutation } from '@vue/apollo-composable'
import { gql } from '~/apollo'
definePageMeta({ layout: false })
export default defineComponent({
  name: 'ChangePassword',
  setup() {
    const password = ref('')
    const repeatPassword = ref('')
    const route = useRoute()
    const token = route.query.token as string
    const id = route.query.id as string

    const {
      mutate: changePassword,
      onDone,
      error,
    } = useMutation(
      gql(/* GraphQL */ `
        mutation ChangePassword(
          $token: String!
          $id: ID!
          $newPassword: String!
        ) {
          changePassword(token: $token, id: $id, newPassword: $newPassword) {
            ... on UserReturned {
              user {
                id
              }
            }
            ... on InputValidationProblem {
              problems {
                path
                message
              }
            }
            ... on TokenProblem {
              message
            }
          }
        }
      `),
      () => ({
        variables: {
          token,
          id,
          newPassword: password.value,
        },
      })
    )
    onDone(() => {
      void navigateTo({ name: 'user-login' })
    })
    return { password, error, changePassword, repeatPassword }
  },
})
</script>
