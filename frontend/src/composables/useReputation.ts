import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface UserProfile {
  user: string;
  reputationScore: number;
  kycVerified: boolean;
  kycVerifiedAt: number | null;
  activeBadges: number;
  totalBadges: number;
  badgeDetails: BadgeDetail[];
  badges: {
    KYC_VERIFIED: boolean;
    TRUSTED_USER: boolean;
    PREMIUM_USER: boolean;
    VERIFIER: boolean;
    MODERATOR: boolean;
    DEVELOPER: boolean;
  };
}

export interface BadgeDetail {
  badgeType: string;
  level: string;
  issuedAt: string;
  expiresAt: string;
  isActive: boolean;
  metadata: string;
}

export interface UserActivity {
  notarizations?: number;
  successfulTransactions?: number;
  daysOnPlatform?: number;
  communityContributions?: number;
  failedTransactions?: number;
  disputes?: number;
}

export function useReputation() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Get user reputation profile
   */
  async function getUserProfile(user: string): Promise<UserProfile | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/reputation/profile/${user}`);
      return res.data;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get user reputation score
   */
  async function getReputationScore(user: string): Promise<number | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/reputation/score/${user}`);
      return res.data.score;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update user reputation score
   */
  async function updateReputation(user: string, newScore: number): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post('/reputation/update', { user, newScore });
      return res.data.success;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Verify KYC for a user
   */
  async function verifyKYC(user: string): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post('/reputation/kyc/verify', { user });
      return res.data.success;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get KYC verification status
   */
  async function getKYCStatus(
    user: string,
  ): Promise<{ verified: boolean; verifiedAt: number | null } | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/reputation/kyc/status/${user}`);
      return res.data;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get user badges
   */
  async function getUserBadges(
    user: string,
    activeOnly: boolean = false,
  ): Promise<string[] | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/reputation/badges/${user}?active=${activeOnly}`);
      return res.data.badges;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Check if user has a specific badge type
   */
  async function hasBadge(user: string, badgeType: number): Promise<boolean | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/reputation/badges/check/${user}/${badgeType}`);
      return res.data.hasBadge;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get badge details
   */
  async function getBadge(tokenId: number): Promise<BadgeDetail | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/reputation/badges/${tokenId}`);
      return res.data;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get badge requirements
   */
  async function getBadgeRequirements(badgeType: number): Promise<number | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get(`/reputation/requirements/${badgeType}`);
      return res.data.requirements;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Calculate reputation score based on user activity
   */
  async function calculateReputationScore(userActivity: UserActivity): Promise<number | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.post('/reputation/calculate', userActivity);
      return res.data.score;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        // @ts-expect-error: err may have a response property from axios error
        error.value = err.response?.data?.error || (err as Error).message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = String(err);
      }
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get badge type name
   */
  function getBadgeTypeName(badgeType: number): string {
    const badgeTypes = {
      0: 'KYC Verified',
      1: 'Trusted User',
      2: 'Premium User',
      3: 'Verifier',
      4: 'Moderator',
      5: 'Developer',
    };
    return badgeTypes[badgeType as keyof typeof badgeTypes] || 'Unknown';
  }

  /**
   * Get badge level name
   */
  function getBadgeLevelName(level: number): string {
    const levels = {
      0: 'Bronze',
      1: 'Silver',
      2: 'Gold',
      3: 'Platinum',
    };
    return levels[level as keyof typeof levels] || 'Unknown';
  }

  /**
   * Get badge color based on type
   */
  function getBadgeColor(badgeType: number): string {
    const colors = {
      0: 'green', // KYC Verified
      1: 'blue', // Trusted User
      2: 'purple', // Premium User
      3: 'orange', // Verifier
      4: 'red', // Moderator
      5: 'grey', // Developer
    };
    return colors[badgeType as keyof typeof colors] || 'grey';
  }

  /**
   * Get badge icon based on type
   */
  function getBadgeIcon(badgeType: number): string {
    const icons = {
      0: 'verified', // KYC Verified
      1: 'favorite', // Trusted User
      2: 'star', // Premium User
      3: 'check_circle', // Verifier
      4: 'security', // Moderator
      5: 'code', // Developer
    };
    return icons[badgeType as keyof typeof icons] || 'badge';
  }

  return {
    loading,
    error,
    getUserProfile,
    getReputationScore,
    updateReputation,
    verifyKYC,
    getKYCStatus,
    getUserBadges,
    hasBadge,
    getBadge,
    getBadgeRequirements,
    calculateReputationScore,
    getBadgeTypeName,
    getBadgeLevelName,
    getBadgeColor,
    getBadgeIcon,
  };
}
