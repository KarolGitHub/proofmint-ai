<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Reputation & KYC Profile</div>

    <!-- Wallet Connection -->
    <div v-if="!account" class="q-mb-md">
      <q-btn color="primary" label="Connect Wallet" @click="connectWallet" />
    </div>

    <div v-else>
      <div class="q-mb-md">Connected: {{ account }}</div>

      <!-- Profile Overview -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Profile Overview</div>
          <q-spinner v-if="loading" color="primary" size="2em" class="q-mb-md" />

          <div v-if="profile" class="row q-gutter-md">
            <!-- Reputation Score -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-primary">{{ profile.reputationScore }}</div>
                  <div class="text-caption">Reputation Score</div>
                </q-card-section>
              </q-card>
            </div>

            <!-- KYC Status -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <q-icon
                    :name="profile.kycVerified ? 'verified' : 'cancel'"
                    :color="profile.kycVerified ? 'green' : 'red'"
                    size="2em"
                  />
                  <div class="text-subtitle1 q-mt-sm">
                    {{ profile.kycVerified ? 'KYC Verified' : 'KYC Not Verified' }}
                  </div>
                  <div v-if="profile.kycVerifiedAt" class="text-caption">
                    Verified: {{ formatTimestamp(profile.kycVerifiedAt) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Badge Count -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <div class="text-h4 text-accent">{{ profile.activeBadges }}</div>
                  <div class="text-caption">Active Badges</div>
                  <div class="text-caption">({{ profile.totalBadges }} total)</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Badge Display -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Your Badges</div>

          <div v-if="profile?.badgeDetails?.length" class="row q-gutter-md">
            <div
              v-for="badge in profile.badgeDetails"
              :key="badge.badgeType"
              class="col-12 col-md-6 col-lg-4"
            >
              <q-card flat bordered>
                <q-card-section class="text-center">
                  <q-icon
                    :name="getBadgeIcon(parseInt(badge.badgeType))"
                    :color="getBadgeColor(parseInt(badge.badgeType))"
                    size="3em"
                  />
                  <div class="text-subtitle1 q-mt-sm">
                    {{ getBadgeTypeName(parseInt(badge.badgeType)) }}
                  </div>
                  <div class="text-caption">
                    {{ getBadgeLevelName(parseInt(badge.level)) }} Level
                  </div>
                  <div class="text-caption">
                    Issued: {{ formatTimestamp(parseInt(badge.issuedAt)) }}
                  </div>
                  <div v-if="badge.expiresAt !== '0'" class="text-caption">
                    Expires: {{ formatTimestamp(parseInt(badge.expiresAt)) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div v-else class="text-center q-pa-md">
            <q-icon name="emoji_events" size="4em" color="grey-4" />
            <div class="text-h6 q-mt-md text-grey-6">No badges yet</div>
            <div class="text-caption text-grey-6">
              Complete actions to earn reputation badges
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Badge Requirements -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Available Badges</div>

          <div class="row q-gutter-md">
            <div
              v-for="(hasBadge, badgeType) in profile?.badges"
              :key="badgeType"
              class="col-12 col-md-6 col-lg-4"
            >
              <q-card flat bordered :class="{ 'bg-grey-1': hasBadge }">
                <q-card-section>
                  <div class="row items-center">
                    <q-icon
                      :name="getBadgeIcon(getBadgeTypeNumber(badgeType))"
                      :color="getBadgeColor(getBadgeTypeNumber(badgeType))"
                      size="2em"
                      class="q-mr-md"
                    />
                    <div class="col">
                      <div class="text-subtitle1">
                        {{ getBadgeTypeName(getBadgeTypeNumber(badgeType)) }}
                      </div>
                      <div class="text-caption">
                        {{ hasBadge ? 'Earned' : 'Not earned yet' }}
                      </div>
                    </div>
                    <q-icon
                      v-if="hasBadge"
                      name="check_circle"
                      color="green"
                      size="1.5em"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- KYC Verification Section -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">KYC Verification</div>

          <div v-if="!profile?.kycVerified" class="q-mt-md">
            <q-banner class="bg-orange-1 text-orange-8">
              <template #avatar>
                <q-icon name="warning" color="orange" />
              </template>
              <div class="text-subtitle2">KYC Verification Required</div>
              <div class="text-caption">
                Complete KYC verification to unlock additional features and earn the KYC Verified badge.
              </div>
            </q-banner>

            <div class="q-mt-md">
              <q-btn
                color="primary"
                label="Start KYC Verification"
                @click="startKYCVerification"
                :loading="kycLoading"
              />
            </div>
          </div>

          <div v-else class="q-mt-md">
            <q-banner class="bg-green-1 text-green-8">
              <template #avatar>
                <q-icon name="verified" color="green" />
              </template>
              <div class="text-subtitle2">KYC Verified</div>
              <div class="text-caption">
                Your identity has been verified. You have access to all platform features.
              </div>
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- Reputation Calculator -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6">Reputation Calculator</div>

          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="userActivity.notarizations"
                label="Document Notarizations"
                type="number"
                outlined
                class="q-mb-md"
              />
              <q-input
                v-model.number="userActivity.successfulTransactions"
                label="Successful Transactions"
                type="number"
                outlined
                class="q-mb-md"
              />
              <q-input
                v-model.number="userActivity.daysOnPlatform"
                label="Days on Platform"
                type="number"
                outlined
                class="q-mb-md"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="userActivity.communityContributions"
                label="Community Contributions"
                type="number"
                outlined
                class="q-mb-md"
              />
              <q-input
                v-model.number="userActivity.failedTransactions"
                label="Failed Transactions"
                type="number"
                outlined
                class="q-mb-md"
              />
              <q-input
                v-model.number="userActivity.disputes"
                label="Disputes"
                type="number"
                outlined
                class="q-mb-md"
              />
            </div>
          </div>

          <div class="q-mt-md">
            <q-btn
              color="secondary"
              label="Calculate Reputation Score"
              @click="calculateScore"
              :loading="calcLoading"
            />
          </div>

          <div v-if="calculatedScore !== null" class="q-mt-md">
            <q-banner class="bg-blue-1 text-blue-8">
              <div class="text-h6">Calculated Score: {{ calculatedScore }}</div>
              <div class="text-caption">
                This is an estimate based on your input. Actual scores are calculated automatically.
              </div>
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- Error Display -->
      <q-banner v-if="error" class="bg-red-2 text-negative q-mb-md">
        {{ error }}
      </q-banner>

      <!-- Refresh Button -->
      <div class="q-mt-md">
        <q-btn
          color="primary"
          label="Refresh Profile"
          @click="loadProfile"
          :loading="loading"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useWallet } from '@/composables/useWallet';
import { useReputation, type UserProfile, type UserActivity } from '@/composables/useReputation';
import { useQuasar } from 'quasar';

const { account, connectWallet } = useWallet();
const {
  loading,
  error,
  getUserProfile,
  verifyKYC,
  calculateReputationScore,
  getBadgeTypeName,
  getBadgeLevelName,
  getBadgeColor,
  getBadgeIcon
} = useReputation();

const profile = ref<UserProfile | null>(null);
const kycLoading = ref(false);
const calcLoading = ref(false);
const calculatedScore = ref<number | null>(null);

const userActivity = ref<UserActivity>({
  notarizations: 0,
  successfulTransactions: 0,
  daysOnPlatform: 0,
  communityContributions: 0,
  failedTransactions: 0,
  disputes: 0
});

const $q = useQuasar();

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

function getBadgeTypeNumber(badgeType: string): number {
  const badgeTypeMap: { [key: string]: number } = {
    'KYC_VERIFIED': 0,
    'TRUSTED_USER': 1,
    'PREMIUM_USER': 2,
    'VERIFIER': 3,
    'MODERATOR': 4,
    'DEVELOPER': 5
  };
  return badgeTypeMap[badgeType] || 0;
}

async function loadProfile() {
  if (!account.value) return;

  const userProfile = await getUserProfile(account.value);
  if (userProfile) {
    profile.value = userProfile;
  }
}

async function startKYCVerification() {
  if (!account.value) return;

  kycLoading.value = true;
  try {
    const success = await verifyKYC(account.value);
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'KYC verification initiated successfully!',
        position: 'top'
      });
      await loadProfile(); // Refresh profile
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to initiate KYC verification',
        position: 'top'
      });
    }
  } catch (err) {
    console.error('KYC verification error:', err);
  } finally {
    kycLoading.value = false;
  }
}

async function calculateScore() {
  calcLoading.value = true;
  try {
    const score = await calculateReputationScore(userActivity.value);
    if (score !== null) {
      calculatedScore.value = score;
      $q.notify({
        type: 'positive',
        message: 'Reputation score calculated!',
        position: 'top'
      });
    }
  } catch (err) {
    console.error('Calculate score error:', err);
  } finally {
    calcLoading.value = false;
  }
}

onMounted(() => {
  if (account.value) {
    loadProfile();
  }
});
</script>

<style scoped>
.q-card {
  transition: all 0.3s ease;
}

.q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
