package com.yh.gamingzone

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

  override fun onNewToken(token: String) {
    super.onNewToken(token)
    Log.d(TAG, "Refreshed token: $token")
    // TODO: Send the registration token to your app server.
    // sendRegistrationToServer(token)
  }

  override fun onMessageReceived(remoteMessage: RemoteMessage) {
    super.onMessageReceived(remoteMessage)
    Log.d(TAG, "From: ${remoteMessage.from}")

    if (remoteMessage.data.isNotEmpty()) {
      Log.d(TAG, "Message data payload: ${remoteMessage.data}")
      // Handle data payload here if needed.
    }

    remoteMessage.notification?.let { notification ->
      Log.d(TAG, "Message Notification Body: ${notification.body}")
      // If you plan to show your own notifications, trigger them here.
    }
  }

  companion object {
    private const val TAG = "FCMService"
  }
}



