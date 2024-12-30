import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Platform } from 'react-native';

const API_KEY = 'appl_DRsqKbYVlPtUzsQfFwKhWsInGvm';

export async function initializePurchases() {
  if (Platform.OS === 'ios') {
    try {
      // Configure RevenueCat
      await Purchases.configure({ 
        apiKey: API_KEY,
        useStoreKit2IfAvailable: true
      });
      
      // Set up purchase listener
      Purchases.addCustomerInfoUpdateListener((info) => {
        console.log('Customer info updated:', info);
      });
      
      console.log('RevenueCat initialized');
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  }
}

export async function getPurchaserInfo() {
  try {
    const purchaserInfo = await Purchases.getCustomerInfo();
    return purchaserInfo;
  } catch (e) {
    console.error('Error getting purchaser info', e);
    return null;
  }
}

export async function checkPremiumStatus() {
  try {
    const purchaserInfo = await Purchases.getCustomerInfo();
    return purchaserInfo?.entitlements?.active?.premium ?? false;
  } catch (e) {
    console.error('Error checking premium status', e);
    return false;
  }
}

export async function presentPaywallIfNeeded() {
  try {
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: "premium"
    });

    if (paywallResult === PAYWALL_RESULT.PURCHASED || paywallResult === PAYWALL_RESULT.RESTORED) {
      // Force refresh customer info after purchase
      await Purchases.syncPurchases();
      const purchaserInfo = await Purchases.getCustomerInfo();
      return purchaserInfo?.entitlements?.active?.premium ?? false;
    }

    return false;
  } catch (e) {
    console.error('Error presenting paywall:', e);
    return false;
  }
} 