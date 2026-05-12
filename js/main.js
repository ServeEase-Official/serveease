// ── FILTER BUTTONS (services.html) ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.service-list-card').forEach(card => {
      card.style.display = (filter === 'all' || card.dataset.cat === filter) ? 'block' : 'none';
    });
  });
});

// ── BOOKING STEPS ──
let currentStep = 1;

function nextStep(step) {
  // ── STEP 1 VALIDATION: service select ──
  if (step === 1) {
    const cat = document.getElementById('serviceCategory').value;
    const svc = document.getElementById('specificService').value;
    if (!cat) { showError('Please select a service category.'); return; }
    if (!svc) { showError('Please select a specific service.'); return; }
  }

  // ── STEP 2 VALIDATION: date + time slot ──
  if (step === 2) {
    const date = document.getElementById('bookingDate').value;
    const slot = document.querySelector('.time-slot.selected');
    if (!date) { showError('Please select a date.'); return; }
    if (!slot)  { showError('Please select a time slot.'); return; }
  }

  // ── STEP 3 VALIDATION: name, phone, address, pincode ──
  if (step === 3) {
    const name    = document.getElementById('detailName').value.trim();
    const phone   = document.getElementById('detailPhone').value.trim();
    const address = document.getElementById('detailAddress').value.trim();
    const pincode = document.getElementById('detailPincode').value.trim();
    if (name.length < 3)          { showError('Please enter your full name (min 3 characters).'); return; }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s|\+91/g, ''))) { showError('Please enter a valid 10-digit mobile number.'); return; }
    if (address.length < 10)      { showError('Please enter a complete address (min 10 characters).'); return; }
    if (!/^\d{6}$/.test(pincode)) { showError('Please enter a valid 6-digit pincode.'); return; }
  }

  document.getElementById('step' + step).classList.remove('active');
  document.getElementById('ps' + step).classList.remove('active');
  document.getElementById('ps' + step).classList.add('done');
  currentStep = step + 1;
  document.getElementById('step' + currentStep).classList.add('active');
  document.getElementById('ps' + currentStep).classList.add('active');
}

function showError(msg) {
  const existing = document.getElementById('bookingError');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'bookingError';
  el.textContent = '⚠️ ' + msg;
  el.style.cssText = 'background:#fff3cd;border:1px solid #ffc107;color:#856404;padding:11px 16px;border-radius:8px;font-size:0.88rem;font-weight:600;margin-bottom:16px;';
  const activeStep = document.querySelector('.form-step.active');
  activeStep.insertBefore(el, activeStep.querySelector('.form-nav'));
  setTimeout(() => el.remove(), 3500);
}

function prevStep(step) {
  document.getElementById('step' + step).classList.remove('active');
  document.getElementById('ps' + step).classList.remove('active');
  currentStep = step - 1;
  document.getElementById('step' + currentStep).classList.add('active');
  document.getElementById('ps' + currentStep).classList.remove('done');
  document.getElementById('ps' + currentStep).classList.add('active');
}

// ── TIME SLOT SELECTION ──
function selectSlot(el) {
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  updateSummary();
}

// ── SERVICE DATA ──
const serviceData = {
  'Cleaning': [
    { name: 'Home Deep Cleaning', price: 999, icon: '🧹' },
    { name: 'Sofa & Carpet Cleaning', price: 599, icon: '🛋️' },
    { name: 'Window Cleaning', price: 399, icon: '🪟' },
    { name: 'Bathroom Cleaning', price: 299, icon: '🚿' },
  ],
  'Plumbing': [
    { name: 'Pipe Leak Repair', price: 299, icon: '🔧' },
    { name: 'Tap Replacement', price: 199, icon: '🚰' },
    { name: 'Drain Cleaning', price: 349, icon: '🪣' },
  ],
  'Electrician': [
    { name: 'Switch Board Repair', price: 249, icon: '⚡' },
    { name: 'Fan Installation', price: 199, icon: '💨' },
    { name: 'Wiring Work', price: 499, icon: '🔌' },
  ],
  'AC Service': [
    { name: 'AC Servicing', price: 499, icon: '❄️' },
    { name: 'AC Gas Refill', price: 799, icon: '🌡️' },
    { name: 'AC Installation', price: 999, icon: '🏠' },
  ],
  'Salon': [
    { name: "Women's Salon", price: 699, icon: '💇' },
    { name: "Men's Grooming", price: 399, icon: '✂️' },
    { name: 'Full Body Massage', price: 899, icon: '💆' },
  ],
  'Painting': [
    { name: 'Interior Painting', price: 1499, icon: '🎨' },
    { name: 'Exterior Painting', price: 1999, icon: '🏠' },
  ],
  'Pest Control': [
    { name: 'Cockroach Control', price: 799, icon: '🐛' },
    { name: 'Rodent Control', price: 999, icon: '🐀' },
    { name: 'Termite Treatment', price: 1499, icon: '🪲' },
  ],
  'Carpentry': [
    { name: 'Furniture Repair', price: 349, icon: '🪑' },
    { name: 'Door Fixing', price: 249, icon: '🚪' },
  ],
};

function updateService() {
  const cat = document.getElementById('serviceCategory')?.value;
  const sel = document.getElementById('specificService');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Choose Service --</option>';
  if (cat && serviceData[cat]) {
    serviceData[cat].forEach((s, i) => {
      sel.innerHTML += `<option value="${i}">${s.name} — ₹${s.price}</option>`;
    });
  }
  updateSummary();
}

function updateSummary() {
  const cat = document.getElementById('serviceCategory')?.value;
  const idx = document.getElementById('specificService')?.value;
  const dateEl = document.getElementById('bookingDate');
  const slotEl = document.querySelector('.time-slot.selected');

  if (cat && idx !== '' && serviceData[cat] && serviceData[cat][idx]) {
    const svc = serviceData[cat][idx];
    document.getElementById('summaryIcon').textContent = svc.icon;
    document.getElementById('summaryService').textContent = svc.name;
    document.getElementById('summaryBase').textContent = '₹' + svc.price;
    document.getElementById('summaryTotal').textContent = '₹' + (svc.price + 49);
  }

  if (dateEl?.value && slotEl) {
    const d = new Date(dateEl.value);
    const opts = { weekday: 'short', day: 'numeric', month: 'short' };
    document.getElementById('summaryDate').textContent = d.toLocaleDateString('en-IN', opts) + ' · ' + slotEl.textContent;
  }
}

// ── PROMO CODE ──
function applyPromo() {
  const code = document.getElementById('promoInput')?.value.trim().toUpperCase();
  if (code === 'SAVE100') {
    alert('✅ Promo applied! ₹100 discount added.');
  } else {
    alert('❌ Invalid promo code. Try SAVE100');
  }
}

// ── CONFIRM BOOKING ──
async function confirmBooking() {
  const cat    = document.getElementById('serviceCategory')?.value || '';
  const idx    = document.getElementById('specificService')?.value || '';
  const svc    = (cat && idx !== '' && serviceData[cat]) ? serviceData[cat][idx] : null;
  const date   = document.getElementById('bookingDate')?.value || '';
  const slot   = document.querySelector('.time-slot.selected')?.textContent || '';
  const name   = document.getElementById('detailName')?.value.trim() || '';
  const phone  = document.getElementById('detailPhone')?.value.trim() || '';
  const addr   = document.getElementById('detailAddress')?.value.trim() || '';
  const city   = document.querySelector('#step3 select')?.value || '';
  const pin    = document.getElementById('detailPincode')?.value.trim() || '';
  const payEl  = document.querySelector('.pay-option.active strong');
  const pay    = payEl ? payEl.textContent : 'Card';

  const booking = {
    id:       'BK' + Date.now(),
    icon:     svc ? svc.icon : '🔧',
    service:  svc ? svc.name : 'Service',
    category: cat,
    price:    svc ? svc.price + 49 : 49,
    date, slot, name, phone,
    address:  addr + ', ' + city + ' - ' + pin,
    payment:  pay,
    status:   'Confirmed',
    bookedOn: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
  };

  console.log('Booking object:', booking);
  console.log('UID in session:', sessionStorage.getItem('seUID'));

  // save to Firestore
  if (typeof window.saveBookingToFirestore === 'function') {
    await window.saveBookingToFirestore(booking);
  } else {
    console.warn('saveBookingToFirestore not available yet');
  }

  // also save to localStorage as fallback
  const all = JSON.parse(localStorage.getItem('seBookings') || '[]');
  all.unshift(booking);
  localStorage.setItem('seBookings', JSON.stringify(all));

  document.getElementById('successModal').classList.add('show');
}

// ── SET MIN DATE TO TODAY ──
const dateInput = document.getElementById('bookingDate');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;
}

// ── PRE-FILL SERVICE FROM URL PARAM ──
const params = new URLSearchParams(window.location.search);
const preService = params.get('service');
if (preService) {
  const summaryEl = document.getElementById('summaryService');
  if (summaryEl) summaryEl.textContent = preService.replace(/\+/g, ' ');
}

// ── SMOOTH SCROLL FOR ANCHOR LINKS ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── PAYMENT METHOD TOGGLE ──
function selectPayment(el, type) {
  document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('cardFields').style.display = type === 'card' ? 'block' : 'none';
  document.getElementById('upiFields').style.display  = type === 'upi'  ? 'block' : 'none';
  document.getElementById('codFields').style.display  = type === 'cod'  ? 'block' : 'none';
}

function selectUpi(el) {
  document.querySelectorAll('.upi-app').forEach(a => a.classList.remove('selected'));
  el.classList.add('selected');
}

// ── AUTH MODAL ──
function openLogin() {
  document.getElementById('authModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeAuth() {
  document.getElementById('authModal').classList.remove('show');
  document.body.style.overflow = '';
}
// close on backdrop click
document.getElementById('authModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeAuth();
});

function switchTab(tab) {
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('tabLogin').classList.toggle('active',  tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
}

// ── PROFILE STATE (used by firebase.js) ──
function setLoggedIn(name) {
  sessionStorage.setItem('seUser', name);
  renderNavProfile(name);
}

function renderNavProfile(name) {
  const actionsEl = document.querySelector('.nav-actions');
  if (!actionsEl) return;
  const initial = name.charAt(0).toUpperCase();
  actionsEl.innerHTML = `
    <button class="btn btn-outline" onclick="location.href='booking.html'">Book Now</button>
    <div class="profile-wrap">
      <div class="profile-avatar" onclick="toggleProfileMenu()">${initial}</div>
      <div class="profile-dropdown" id="profileDropdown">
        <div class="profile-dropdown-header">
          <div class="profile-avatar-lg">${initial}</div>
          <div>
            <strong>${name}</strong>
            <span>ServeEase Member</span>
          </div>
        </div>
        <a href="#" class="dropdown-item">👤 My Profile</a>
        <a href="mybookings.html" class="dropdown-item">📋 My Bookings</a>
        <a href="#" class="dropdown-item">⭐ My Reviews</a>
        <a href="#" class="dropdown-item">🎁 Refer & Earn</a>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item logout" onclick="doLogout()">🚪 Logout</a>
      </div>
    </div>
  `;
}

function toggleProfileMenu() {
  document.getElementById('profileDropdown')?.classList.toggle('show');
}

function doLogout() {
  if (typeof window.doLogout === 'function' && window.doLogout !== doLogout) {
    window.doLogout();
    return;
  }
  sessionStorage.removeItem('seUser');
  sessionStorage.removeItem('seUID');
  const actionsEl = document.querySelector('.nav-actions');
  if (actionsEl) {
    actionsEl.innerHTML = `
      <button class="btn btn-outline" onclick="location.href='booking.html'">Book Now</button>
      <button class="btn btn-primary" onclick="openLogin()">Login</button>
    `;
  }
  showToast('👋 Logged out successfully.');
}

// close dropdown on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('.profile-wrap')) {
    document.getElementById('profileDropdown')?.classList.remove('show');
  }
});

// restore session on page load
const savedUser = sessionStorage.getItem('seUser');
if (savedUser) renderNavProfile(savedUser);

function togglePass(id, icon) {
  const input = document.getElementById(id);
  if (input.type === 'password') { input.type = 'text'; icon.textContent = '🙈'; }
  else { input.type = 'password'; icon.textContent = '👁️'; }
}

// ── TOAST NOTIFICATION ──
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:13px 26px;border-radius:30px;font-size:0.9rem;font-weight:600;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.25);animation:popIn 0.3s ease';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── MY BOOKINGS PAGE ──
async function renderBookingsPage(filter) {
  const list = document.getElementById('bookingsList');
  const empty = document.getElementById('emptyState');
  if (!list) return;

  list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light)">Loading bookings...</div>';

  let bookings = [];

  // try Firestore first
  if (typeof fetchBookings === 'function') {
    bookings = await fetchBookings();
  }

  // fallback to localStorage
  if (bookings.length === 0) {
    bookings = JSON.parse(localStorage.getItem('seBookings') || '[]');
  }

  if (filter && filter !== 'all') bookings = bookings.filter(b => b.status === filter);

  if (bookings.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  list.innerHTML = bookings.map(b => {
    const statusClass = b.status === 'Confirmed' ? 'status-confirmed' : b.status === 'Completed' ? 'status-completed' : 'status-cancelled';
    const canCancel = b.status === 'Confirmed';
    return `
    <div class="booking-card" id="card-${b.id}">
      <div class="booking-card-top">
        <div class="booking-service-info">
          <div class="booking-icon">${b.icon}</div>
          <div>
            <h3>${b.service}</h3>
            <p class="booking-category">${b.category}</p>
          </div>
        </div>
        <span class="booking-status ${statusClass}">${b.status === 'Confirmed' ? '🟢 Upcoming' : b.status === 'Completed' ? '✅ Completed' : '❌ Cancelled'}</span>
      </div>
      <div class="booking-details-grid">
        <div class="booking-detail"><span class="bd-label">📅 Date</span><span>${b.date}</span></div>
        <div class="booking-detail"><span class="bd-label">⏰ Time</span><span>${b.slot}</span></div>
        <div class="booking-detail"><span class="bd-label">👤 Name</span><span>${b.name}</span></div>
        <div class="booking-detail"><span class="bd-label">📞 Phone</span><span>${b.phone}</span></div>
        <div class="booking-detail"><span class="bd-label">📍 Address</span><span>${b.address}</span></div>
        <div class="booking-detail"><span class="bd-label">💳 Payment</span><span>${b.payment}</span></div>
        <div class="booking-detail"><span class="bd-label">🧾 Booking ID</span><span style="font-family:monospace;font-size:0.8rem">${b.id}</span></div>
        <div class="booking-detail"><span class="bd-label">💰 Total Paid</span><span style="color:var(--primary);font-weight:700">₹${b.price}</span></div>
      </div>
      <div class="booking-card-footer">
        <span style="font-size:0.8rem;color:var(--text-light)">Booked on ${b.bookedOn}</span>
        <div style="display:flex;gap:10px">
          ${canCancel ? `<button class="btn btn-outline" onclick="openCancelModal('${b.firestoreId || b.id}')">Cancel</button>` : ''}
          <button class="btn btn-primary" onclick="location.href='booking.html'">Book Again</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterBookings(status, btn) {
  document.querySelectorAll('.booking-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderBookingsPage(status);
}

let cancelTargetId = null;
function openCancelModal(id) {
  cancelTargetId = id;
  document.getElementById('cancelModal').classList.add('show');
  document.getElementById('confirmCancelBtn').onclick = async () => {
    // cancel in Firestore
    if (typeof cancelBookingInFirestore === 'function') {
      await cancelBookingInFirestore(cancelTargetId);
    }
    // cancel in localStorage fallback
    const all = JSON.parse(localStorage.getItem('seBookings') || '[]');
    const updated = all.map(b => (b.id === cancelTargetId || b.firestoreId === cancelTargetId) ? { ...b, status: 'Cancelled' } : b);
    localStorage.setItem('seBookings', JSON.stringify(updated));
    closeCancelModal();
    renderBookingsPage();
    showToast('Booking cancelled successfully.');
  };
}
function closeCancelModal() {
  document.getElementById('cancelModal')?.classList.remove('show');
  cancelTargetId = null;
}
