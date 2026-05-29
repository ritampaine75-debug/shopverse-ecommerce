const Auth = {
  onAuthChange(user) {
    this.currentUser = user;
  },

  async register(email, password, username) {
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: username });
      await db.ref(`users/${cred.user.uid}`).set({
        username, email, photoURL: '',
        createdAt: Date.now(),
        addresses: {},
        isBlocked: false
      });
      App.showToast('Account created successfully!', 'success');
      return cred.user;
    } catch (err) {
      App.showToast(this.getErrorMessage(err.code), 'error');
      throw err;
    }
  },

  async login(email, password) {
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const userSnap = await db.ref(`users/${cred.user.uid}`).once('value');
      if (userSnap.val()?.isBlocked) {
        await auth.signOut();
        App.showToast('Your account has been blocked', 'error');
        return;
      }
      App.showToast('Welcome back!', 'success');
      return cred.user;
    } catch (err) {
      App.showToast(this.getErrorMessage(err.code), 'error');
      throw err;
    }
  },

  async loginWithGoogle() {
    try {
      const enabled = await App.getSetting('googleLogin');
      if (enabled === false) {
        App.showToast('Google Login is disabled by admin', 'error');
        return;
      }
      const provider = new firebase.auth.GoogleAuthProvider();
      const cred = await auth.signInWithPopup(provider);
      const userSnap = await db.ref(`users/${cred.user.uid}`).once('value');
      if (userSnap.val()?.isBlocked) {
        await auth.signOut();
        App.showToast('Your account has been blocked', 'error');
        return;
      }
      if (!userSnap.exists()) {
        await db.ref(`users/${cred.user.uid}`).set({
          username: cred.user.displayName, email: cred.user.email,
          photoURL: cred.user.photoURL || '',
          createdAt: Date.now(), addresses: {}, isBlocked: false
        });
      }
      App.showToast('Logged in with Google!', 'success');
      return cred.user;
    } catch (err) {
      App.showToast(this.getErrorMessage(err.code), 'error');
      throw err;
    }
  },

  async logout() {
    sessionStorage.removeItem('adminAuth');
    await auth.signOut();
    App.showToast('Logged out successfully', 'info');
    window.location.href = 'login.html';
  },

  async forgotPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      App.showToast('Password reset email sent!', 'success');
    } catch (err) {
      App.showToast(this.getErrorMessage(err.code), 'error');
    }
  },

  async changePassword(oldPassword, newPassword) {
    try {
      const user = auth.currentUser;
      const cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
      await user.reauthenticateWithCredential(cred);
      await user.updatePassword(newPassword);
      App.showToast('Password changed successfully!', 'success');
    } catch (err) {
      App.showToast(this.getErrorMessage(err.code), 'error');
    }
  },

  async updateProfile(data) {
    try {
      const user = auth.currentUser;
      if (data.username) await user.updateProfile({ displayName: data.username });
      await db.ref(`users/${user.uid}`).update(data);
      App.showToast('Profile updated!', 'success');
    } catch (err) {
      App.showToast(this.getErrorMessage(err.code), 'error');
    }
  },

  async uploadAvatar(file) {
    try {
      const user = auth.currentUser;
      const ref = storage.ref(`avatars/${user.uid}/${file.name}`);
      const snap = await ref.put(file);
      const url = await snap.ref.getDownloadURL();
      await user.updateProfile({ photoURL: url });
      await db.ref(`users/${user.uid}/photoURL`).set(url);
      App.showToast('Avatar uploaded!', 'success');
      return url;
    } catch (err) {
      App.showToast('Failed to upload avatar', 'error');
    }
  },

  getErrorMessage(code) {
    console.error('Firebase auth error:', code);
    const messages = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'Email already registered',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/invalid-email': 'Invalid email address',
      'auth/too-many-requests': 'Too many attempts. Try again later',
      'auth/popup-closed-by-user': 'Login was cancelled',
      'auth/requires-recent-login': 'Please login again to continue',
      'auth/operation-not-allowed': 'Email/Password sign-in not enabled. Enable it in Firebase Console > Authentication > Sign-in method',
      'auth/network-request-failed': 'Network error. Check your internet connection',
      'auth/configuration-not-found': 'Firebase project not configured properly'
    };
    return messages[code] || `Error: ${code || 'Unknown error'}. Check console for details`;
  },

  isAdmin() {
    return sessionStorage.getItem('adminAuth') === 'true';
  }
};
