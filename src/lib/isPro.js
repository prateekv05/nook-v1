export function isPro(profile) {
  return profile.is_pro ||
    (profile.pro_trial_ends_at && new Date(profile.pro_trial_ends_at) > new Date())
}
