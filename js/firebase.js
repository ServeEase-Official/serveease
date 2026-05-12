// ── FIREBASE SETUP (CDN based - no npm needed) ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOVcmxiEF6cWg6SjOBX16m6M_RPj1oYWg",
  authDomain: "serveease-76657.firebaseapp.com",
  projectId: "serveease-76657",
  storageBucket: "serveease-76657.firebasestorage.app",
  messagingSenderId: "332825832836",
  appId: "1:332825832836:web:56805bd09da15b955641d1"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── AUTH STATE LISTENER ──
onAuthStateChanged(auth, (user) => {
  if (user) {
    const name = user.displayName || user.email.split('@')[0];
    sessionStorage.setItem('seUser', name);
    sessionStorage.setItem('seUID', user.uid);
    renderNavProfile(name);
    // if on mybookings page, load bookings now that UID is available
    if (document.getElementById('bookingsList')) renderBookingsPage();
  } else {
    sessionStorage.removeItem('seUser');
    sessionStorage.removeItem('seUID');
    const actionsEl = document.querySelector('.nav-actions');
    if (actionsEl) {
      actionsEl.innerHTML = `
        <button class="btn btn-outline" onclick="location.href='booking.html'">Book Now</button>
        <button class="btn btn-primary" onclick="openLogin()">Login</button>
      `;
    }
    // if on mybookings page and not logged in, show empty state
    if (document.getElementById('bookingsList')) {
      document.getElementById('bookingsList').innerHTML = '';
      const empty = document.getElementById('emptyState');
      if (empty) {
        empty.style.display = 'block';
        empty.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🔒</div>
            <h3>Please Login First</h3>
            <p>You need to be logged in to view your bookings.</p>
            <button class="btn btn-primary btn-lg" onclick="openLogin()">Login Now</button>
          </div>`;
      }
    }
  }
});

// ── SIGNUP ──
window.doSignup = async function () {
  const name  = document.getElementById('signupName')?.value.trim();
  const phone = document.getElementById('signupPhone')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const pass  = document.getElementById('signupPass')?.value.trim();

  if (!name || !phone || !email || !pass) { alert('⚠️ Please fill in all fields.'); return; }
  if (name.length < 3) { alert('⚠️ Name must be at least 3 characters.'); return; }
  if (!/^[6-9]\d{9}$/.test(phone.replace(/\s|\+91/g, ''))) { alert('⚠️ Enter a valid 10-digit Indian mobile number.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('⚠️ Enter a valid email address.'); return; }
  if (pass.length < 6) { alert('⚠️ Password must be at least 6 characters.'); return; }

  try {
    const btn = document.querySelector('#signupForm .btn-primary');
    btn.textContent = 'Creating...'; btn.disabled = true;

    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });

    // save extra info to Firestore
    await addDoc(collection(db, 'users'), {
      uid: cred.user.uid, name, phone, email,
      createdAt: serverTimestamp()
    });

    closeAuth();
    showToast('🎉 Account created! Welcome to ServeEase, ' + name + '!');
  } catch (e) {
    const msg = e.code === 'auth/email-already-in-use' ? 'This email is already registered. Please login.' : e.message;
    alert('❌ ' + msg);
    const btn = document.querySelector('#signupForm .btn-primary');
    if (btn) { btn.textContent = 'Create Account'; btn.disabled = false; }
  }
};

// ── LOGIN ──
window.doLogin = async function () {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pass  = document.getElementById('loginPass')?.value.trim();

  if (!email || !pass) { alert('⚠️ Please fill in all fields.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('⚠️ Enter a valid email address.'); return; }
  if (pass.length < 6) { alert('⚠️ Password must be at least 6 characters.'); return; }

  try {
    const btn = document.querySelector('#loginForm .btn-primary');
    btn.textContent = 'Logging in...'; btn.disabled = true;

    await signInWithEmailAndPassword(auth, email, pass);
    closeAuth();
    showToast('✅ Logged in successfully! Welcome back.');
  } catch (e) {
    const msg = e.code === 'auth/invalid-credential' ? 'Invalid email or password. Please try again.' : e.message;
    alert('❌ ' + msg);
    const btn = document.querySelector('#loginForm .btn-primary');
    if (btn) { btn.textContent = 'Login'; btn.disabled = false; }
  }
};

// ── LOGOUT ──
window.doLogout = async function () {
  await signOut(auth);
  showToast('👋 Logged out successfully.');
};

// ── SAVE BOOKING TO FIRESTORE ──
window.saveBookingToFirestore = async function (booking) {
  const uid = sessionStorage.getItem('seUID');
  console.log('saveBookingToFirestore called, UID:', uid);
  if (!uid) {
    console.warn('No UID found - user not logged in');
    return;
  }
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...booking,
      uid,
      createdAt: serverTimestamp()
    });
    console.log('Booking saved to Firestore with ID:', docRef.id);
  } catch (e) {
    console.error('Booking save error:', e.code, e.message);
  }
};

// ── FETCH BOOKINGS FROM FIRESTORE ──
window.fetchBookings = async function () {
  const uid = sessionStorage.getItem('seUID');
  if (!uid) return [];
  try {
    const q = query(collection(db, 'bookings'), where('uid', '==', uid));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
    // sort by bookedOn descending on client side
    results.sort((a, b) => (b.id > a.id ? 1 : -1));
    return results;
  } catch (e) {
    console.error('Fetch error:', e);
    return [];
  }
};

// ── CANCEL BOOKING IN FIRESTORE ──
window.cancelBookingInFirestore = async function (firestoreId) {
  try {
    await updateDoc(doc(db, 'bookings', firestoreId), { status: 'Cancelled' });
  } catch (e) {
    console.error('Cancel error:', e);
  }
};
