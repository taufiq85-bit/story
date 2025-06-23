// src/scripts/utils/push-notification.js

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
const NOTIFICATION_API_ENDPOINT = 'https://story-api.dicoding.dev/v1/notifications';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotification = {
  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return false;
    }
    await this.registerServiceWorker();
    return true;
  },

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  },
  
  async subscribeUser() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        await this.createSubscription();
        return true;
      }
      console.warn('Notification permission denied.');
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  },

  async createSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push.', error);
      return null;
    }
  },

  async unsubscribeUser() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await this.sendUnsubscribeToServer(subscription);
        await subscription.unsubscribe();
        console.log('User is unsubscribed.');
        return true;
      }
    } catch (error) {
      console.error('Failed to unsubscribe.', error);
    }
    return false;
  },

  // === FUNGSI YANG DIPERBAIKI ===
  async sendSubscriptionToServer(subscription) {
    console.log('Sending subscription to server...');
    
    // 1. Ubah subscription menjadi objek JSON biasa
    const subscriptionJson = subscription.toJSON();
    
    // 2. Hapus kunci 'expirationTime' yang tidak diizinkan oleh server
    delete subscriptionJson.expirationTime;

    try {
      const response = await fetch(`${NOTIFICATION_API_ENDPOINT}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        // 3. Kirim objek JSON yang sudah bersih
        body: JSON.stringify(subscriptionJson),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to send subscription to server');
      }
      alert('Berhasil subscribe notifikasi!');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      alert(`Gagal subscribe ke server: ${error.message}`);
    }
  },
  
  async sendUnsubscribeToServer(subscription) {
    console.log('Sending unsubscribe request to server...');
    try {
      const response = await fetch(`${NOTIFICATION_API_ENDPOINT}/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to unsubscribe from server');
      }
      alert('Berhasil unsubscribe notifikasi!');
    } catch (error) {
      console.error('Error sending unsubscribe to server:', error);
      alert(`Gagal unsubscribe dari server: ${error.message}`);
    }
  },

  async getSubscriptionState() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const permission = Notification.permission;

    return {
      isSubscribed: !!subscription,
      permission,
    };
  }
};

export default PushNotification;
