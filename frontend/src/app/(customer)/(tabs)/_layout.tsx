import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Palette } from '@/constants/design';
import { AppIcons } from '@/constants/icons';

/**
 * Customer bottom tabs: Order, Rewards, Reviews, Profile.
 *
 * Four tabs sits under the five-tab ceiling Android's Material bottom
 * navigation allows, so nothing has to be tucked behind a "More" — which is
 * why the web reference's four tabs map across one-to-one.
 */
export default function CustomerTabsLayout() {
  return (
    <NativeTabs
      tintColor={Palette.brand}
      iconColor={{ default: Palette.muted, selected: Palette.brand }}
      labelStyle={{
        default: { color: Palette.muted },
        selected: { color: Palette.brand }
      }}
      backgroundColor={Palette.surface}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: AppIcons.order.sf, selected: AppIcons.order.sfSelected ?? AppIcons.order.sf }}
          md={AppIcons.order.material}
        />
        <NativeTabs.Trigger.Label>Order</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rewards">
        <NativeTabs.Trigger.Icon
          sf={{
            default: AppIcons.rewards.sf,
            selected: AppIcons.rewards.sfSelected ?? AppIcons.rewards.sf
          }}
          md={AppIcons.rewards.material}
        />
        <NativeTabs.Trigger.Label>Rewards</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reviews">
        <NativeTabs.Trigger.Icon
          sf={{
            default: AppIcons.reviews.sf,
            selected: AppIcons.reviews.sfSelected ?? AppIcons.reviews.sf
          }}
          md={AppIcons.reviews.material}
        />
        <NativeTabs.Trigger.Label>Reviews</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{
            default: AppIcons.profile.sf,
            selected: AppIcons.profile.sfSelected ?? AppIcons.profile.sf
          }}
          md={AppIcons.profile.material}
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
