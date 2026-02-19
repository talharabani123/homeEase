/**
 * Service Request Service
 * Handles all service request operations with Firebase Realtime Database
 */

import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

/**
 * Create a new service request
 * @param {object} requestData - Request details
 * @returns {Promise<object>} - { success, requestId, error }
 */
export const createServiceRequest = async (requestData) => {
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Generate new request ID
    const requestRef = database().ref('requests').push();
    const requestId = requestRef.key;

    // Upload images if provided
    let imageUrls = [];
    if (requestData.images && requestData.images.length > 0) {
      imageUrls = await uploadRequestImages(requestId, requestData.images);
    }

    // Prepare request object
    const request = {
      requestId,
      customerId: currentUser.uid,
      customerName: requestData.customerName || '',
      customerPhone: requestData.customerPhone || '',
      serviceId: requestData.serviceId,
      serviceName: requestData.serviceName,
      address: requestData.address,
      description: requestData.description,
      date: requestData.date,
      time: requestData.time,
      images: imageUrls,
      status: 'pending',
      providerId: null,
      providerName: null,
      createdAt: database.ServerValue.TIMESTAMP,
      updatedAt: database.ServerValue.TIMESTAMP,
    };

    // Save to database
    await requestRef.set(request);

    console.log('Service request created:', requestId);

    return {
      success: true,
      requestId,
      message: 'Service request created successfully'
    };
  } catch (error) {
    console.error('Create request error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create service request'
    };
  }
};

/**
 * Upload request images to Firebase Storage
 * @param {string} requestId - Request ID
 * @param {array} images - Array of image URIs
 * @returns {Promise<array>} - Array of download URLs
 */
const uploadRequestImages = async (requestId, images) => {
  try {
    const uploadPromises = images.map(async (imageUri, index) => {
      const filename = `request_${requestId}_${index}_${Date.now()}.jpg`;
      const reference = storage().ref(`requests/${requestId}/${filename}`);
      
      await reference.putFile(imageUri);
      const downloadUrl = await reference.getDownloadURL();
      
      return downloadUrl;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Image upload error:', error);
    return [];
  }
};

/**
 * Get all requests for current customer
 * @returns {Promise<object>} - { success, requests, error }
 */
export const getCustomerRequests = async () => {
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    const snapshot = await database()
      .ref('requests')
      .orderByChild('customerId')
      .equalTo(currentUser.uid)
      .once('value');

    const requests = [];
    snapshot.forEach((childSnapshot) => {
      requests.push({
        ...childSnapshot.val(),
        key: childSnapshot.key
      });
    });

    // Sort by createdAt descending
    requests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return {
      success: true,
      requests
    };
  } catch (error) {
    console.error('Get customer requests error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch requests',
      requests: []
    };
  }
};

/**
 * Listen to customer requests in real-time
 * @param {function} callback - Callback function (requests) => {}
 * @returns {function} - Unsubscribe function
 */
export const listenToCustomerRequests = (callback) => {
  const currentUser = auth().currentUser;
  
  if (!currentUser) {
    callback([]);
    return () => {};
  }

  const requestsRef = database()
    .ref('requests')
    .orderByChild('customerId')
    .equalTo(currentUser.uid);

  const onValueChange = requestsRef.on('value', (snapshot) => {
    const requests = [];
    snapshot.forEach((childSnapshot) => {
      requests.push({
        ...childSnapshot.val(),
        key: childSnapshot.key
      });
    });

    // Sort by createdAt descending
    requests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    callback(requests);
  });

  // Return unsubscribe function
  return () => requestsRef.off('value', onValueChange);
};

/**
 * Get single request by ID
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} - { success, request, error }
 */
export const getRequestById = async (requestId) => {
  try {
    const snapshot = await database()
      .ref(`requests/${requestId}`)
      .once('value');

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Request not found'
      };
    }

    return {
      success: true,
      request: {
        ...snapshot.val(),
        key: snapshot.key
      }
    };
  } catch (error) {
    console.error('Get request error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch request'
    };
  }
};

/**
 * Listen to single request in real-time
 * @param {string} requestId - Request ID
 * @param {function} callback - Callback function (request) => {}
 * @returns {function} - Unsubscribe function
 */
export const listenToRequest = (requestId, callback) => {
  const requestRef = database().ref(`requests/${requestId}`);

  const onValueChange = requestRef.on('value', (snapshot) => {
    if (snapshot.exists()) {
      callback({
        ...snapshot.val(),
        key: snapshot.key
      });
    } else {
      callback(null);
    }
  });

  // Return unsubscribe function
  return () => requestRef.off('value', onValueChange);
};

/**
 * Cancel a service request
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} - { success, error }
 */
export const cancelServiceRequest = async (requestId) => {
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Verify ownership
    const snapshot = await database().ref(`requests/${requestId}`).once('value');
    const request = snapshot.val();

    if (!request) {
      return {
        success: false,
        error: 'Request not found'
      };
    }

    if (request.customerId !== currentUser.uid) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    // Only allow cancellation if status is pending or accepted
    if (!['pending', 'accepted'].includes(request.status)) {
      return {
        success: false,
        error: 'Cannot cancel request in current status'
      };
    }

    // Update status
    await database().ref(`requests/${requestId}`).update({
      status: 'cancelled',
      updatedAt: database.ServerValue.TIMESTAMP
    });

    return {
      success: true,
      message: 'Request cancelled successfully'
    };
  } catch (error) {
    console.error('Cancel request error:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel request'
    };
  }
};

/**
 * Get pending requests for providers (by service type)
 * @param {string} serviceId - Service ID
 * @returns {Promise<object>} - { success, requests, error }
 */
export const getPendingRequestsByService = async (serviceId) => {
  try {
    const snapshot = await database()
      .ref('requests')
      .orderByChild('status')
      .equalTo('pending')
      .once('value');

    const requests = [];
    snapshot.forEach((childSnapshot) => {
      const request = childSnapshot.val();
      if (request.serviceId === serviceId) {
        requests.push({
          ...request,
          key: childSnapshot.key
        });
      }
    });

    // Sort by createdAt descending
    requests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return {
      success: true,
      requests
    };
  } catch (error) {
    console.error('Get pending requests error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch requests',
      requests: []
    };
  }
};

/**
 * Accept a service request (Provider)
 * Only one provider can accept at a time
 * @param {string} requestId - Request ID
 * @param {object} providerData - Provider info
 * @returns {Promise<object>} - { success, error }
 */
export const acceptServiceRequest = async (requestId, providerData) => {
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Use transaction to ensure only one provider can accept
    const requestRef = database().ref(`requests/${requestId}`);
    
    const transactionResult = await requestRef.transaction((request) => {
      if (!request) {
        return; // Abort - request doesn't exist
      }
      
      if (request.status !== 'pending') {
        return; // Abort - request already accepted/rejected
      }
      
      // Accept the request
      request.status = 'accepted';
      request.providerId = currentUser.uid;
      request.providerName = providerData.name || '';
      request.providerPhone = providerData.phone || '';
      request.acceptedAt = database.ServerValue.TIMESTAMP;
      request.updatedAt = database.ServerValue.TIMESTAMP;
      
      return request;
    });

    if (!transactionResult.committed) {
      return {
        success: false,
        error: 'Request is no longer available. Another provider may have accepted it.'
      };
    }

    return {
      success: true,
      message: 'Request accepted successfully'
    };
  } catch (error) {
    console.error('Accept request error:', error);
    return {
      success: false,
      error: error.message || 'Failed to accept request'
    };
  }
};

/**
 * Reject a service request (Provider)
 * @param {string} requestId - Request ID
 * @returns {Promise<object>} - { success, error }
 */
export const rejectServiceRequest = async (requestId) => {
  try {
    const currentUser = auth().currentUser;
    
    if (!currentUser) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Update request
    await database().ref(`requests/${requestId}`).update({
      status: 'rejected',
      rejectedBy: currentUser.uid,
      rejectedAt: database.ServerValue.TIMESTAMP,
      updatedAt: database.ServerValue.TIMESTAMP
    });

    return {
      success: true,
      message: 'Request rejected'
    };
  } catch (error) {
    console.error('Reject request error:', error);
    return {
      success: false,
      error: error.message || 'Failed to reject request'
    };
  }
};

/**
 * Update request status
 * @param {string} requestId - Request ID
 * @param {string} status - New status
 * @returns {Promise<object>} - { success, error }
 */
export const updateRequestStatus = async (requestId, status) => {
  try {
    await database().ref(`requests/${requestId}`).update({
      status,
      updatedAt: database.ServerValue.TIMESTAMP
    });

    return {
      success: true,
      message: 'Status updated successfully'
    };
  } catch (error) {
    console.error('Update status error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update status'
    };
  }
};

export default {
  createServiceRequest,
  getCustomerRequests,
  listenToCustomerRequests,
  getRequestById,
  listenToRequest,
  cancelServiceRequest,
  getPendingRequestsByService,
  acceptServiceRequest,
  rejectServiceRequest,
  updateRequestStatus,
};
