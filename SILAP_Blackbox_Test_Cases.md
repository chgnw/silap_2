# SILAP - Blackbox Testing Test Cases

## Test Information
- **Application Name:** SILAP (Sistem Informasi Layanan Antar dan Pickup)
- **Testing Type:** Blackbox Testing - Functional Testing (Positive Test Cases Only)
- **Testing Approach:** Feature-based testing
- **Test Date:** January 2026
- **Tester:** [Your Name]

---

## 📊 Test Case Summary

| No | Feature Module | Total Test Cases |
|----|----------------|------------------|
| 1 | Authentication & Authorization | 6 |
| 2 | Master Data Management (Admin) | 12 |
| 3 | Payment & Driver Verification (Admin) | 6 |
| 4 | Subscription Management (Customer) | 6 |
| 5 | Pickup Request System (Customer) | 8 |
| 6 | Rewards & Points System (Customer) | 5 |
| 7 | Vehicle Management (Driver) | 5 |
| 8 | Driver Pickup Operations | 10 |
| 9 | Profile Management | 3 |
| 10 | Tier System | 3 |
| **TOTAL** | **10 Feature Modules** | **64** |

---

## 🔐 1. AUTHENTICATION & AUTHORIZATION

**Feature Description:** User authentication system dengan role-based access control yang mengatur redirect berdasarkan role dan subscription status.

| TC ID | Test Scenario | User Type | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|-----------|------------|-----------------|---------------|--------|
| TC-AUTH-001 | Login as Admin | Admin | Email: admin@silap.com<br>Password: Admin123! | Redirect to `/admin` dashboard | | ⬜ PENDING |
| TC-AUTH-002 | Login as Driver (verified) | Driver | Email: driver@silap.com<br>Password: Driver123! | Redirect to `/driver` dashboard | | ⬜ PENDING |
| TC-AUTH-003 | Login as Customer (unsubscribed) | Customer | Email: customer@silap.com<br>Password: Cust123! | Redirect to `/pricing` page | | ⬜ PENDING |
| TC-AUTH-004 | Login as Customer (subscribed) | Customer | Email: subscribed@silap.com<br>Password: Cust123! | Redirect to `/dashboard` | | ⬜ PENDING |
| TC-AUTH-005 | Register as Customer | New Customer | First Name: "John"<br>Last Name: "Doe"<br>Email: john@test.com<br>Phone: 081234567890<br>Password: Pass123!<br>Address: "Jl. Test 123" | Account created, redirect to `/login` with success message | | ⬜ PENDING |
| TC-AUTH-006 | Register as Driver | New Driver | First Name: "Driver"<br>Last Name: "Test"<br>Email: newdriver@test.com<br>Phone: 081234567891<br>Password: Driver123!<br>KTP: 1234567890123456<br>SIM: 1234567890123456 | Account created with status "Pending Verification", redirect to login | | ⬜ PENDING |

---

## 📂 2. MASTER DATA MANAGEMENT (ADMIN)

**Feature Description:** Admin dapat mengelola master data untuk waste categories, reward categories, reward items, vehicles, vehicle categories, dan subscription plans.

### 2.1 Waste Category Management

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-WASTE-001 | Create new waste category | Name: "Plastik PET"<br>Icon: valid_icon.png<br>Price: 5000 | Success, category created and displayed in table | | ⬜ PENDING |
| TC-WASTE-002 | View all waste categories | N/A | Table displays all categories with name, icon image, price per kg | | ⬜ PENDING |
| TC-WASTE-003 | Update waste category | Name: "Plastik PET (Updated)"<br>Price: 6000 | Success, changes reflected in table | | ⬜ PENDING |
| TC-WASTE-004 | Delete waste category | Select existing category | Success, category soft-deleted (`is_active = FALSE`) | | ⬜ PENDING |
| TC-WASTE-005 | Re-add deleted category | Name: (previously deleted)<br>Price: 5500 | Category reactivated with updated data | | ⬜ PENDING |

### 2.2 Reward Category & Items Management

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-REWARD-001 | Create reward category | Name: "Elektronik"<br>Icon: icon.png | Success, category created | | ⬜ PENDING |
| TC-REWARD-002 | Create reward item | Name: "Voucher 50K"<br>Category: Elektronik<br>Points: 1000<br>Stock: 10<br>Icon: voucher.png | Success, reward created and displayed | | ⬜ PENDING |
| TC-REWARD-003 | View all rewards with icons | N/A | Table displays rewards with icon images | | ⬜ PENDING |

### 2.3 Vehicle & Vehicle Category Management

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-VEHICLE-001 | Create vehicle category | Name: "Pickup Truck"<br>Min Weight: 0<br>Max Weight: 500<br>Icon: truck.png | Success, category created with image displayed in table | | ⬜ PENDING |
| TC-VEHICLE-002 | Create vehicle | Plate: "B1234XYZ"<br>Category: Pickup Truck<br>Icon: vehicle.jpg | Success, vehicle created | | ⬜ PENDING |
| TC-VEHICLE-003 | View vehicles with category images | N/A | Table displays vehicles with category icon images | | ⬜ PENDING |

### 2.4 Subscription Plan Management

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-PLAN-001 | Create subscription plan | Name: "Premium"<br>Price: 100000<br>Duration: 30 days<br>Frequency: Weekly | Success, plan created | | ⬜ PENDING |

---

## ✅ 3. PAYMENT & DRIVER VERIFICATION (ADMIN)

**Feature Description:** Admin memverifikasi pembayaran subscription dan registrasi driver dengan kemampuan verify, reject, atau cancel.

### 3.1 Payment Verification

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-PAY-001 | View pending payments | N/A | List of pending payments with customer info | | ⬜ PENDING |
| TC-PAY-002 | Verify payment with reference number | Reference: SUB-xxxxxxxx-xxxxxxxx | Status → "Verified", reference saved, customer subscription activated, email sent | | ⬜ PENDING |
| TC-PAY-003 | Reject payment | Reason: "Bukti tidak jelas" | Status → "Rejected", reason saved, email sent | | ⬜ PENDING |
| TC-PAY-004 | View payment history (verified & rejected) | N/A | Table shows verified/rejected payments with status badges, reference numbers (for verified) or cancel reasons (for rejected) | | ⬜ PENDING |

### 3.2 Driver Verification

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-DRV-VER-001 | View pending driver registrations | N/A | List of drivers with KTP & SIM numbers (formatted with character count) | | ⬜ PENDING |
| TC-DRV-VER-002 | Verify driver account | Select driver → Verify | Status → "Verified", driver can login, email sent | | ⬜ PENDING |

---

## 💳 4. SUBSCRIPTION MANAGEMENT (CUSTOMER)

**Feature Description:** Customer dapat subscribe ke plan, upload payment proof, dan melihat status subscription.

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-SUB-001 | View available subscription plans | N/A | All active plans displayed with price, duration, frequency | | ⬜ PENDING |
| TC-SUB-002 | Subscribe and upload payment proof | Plan: "Premium"<br>Payment Proof: proof.jpg (< 2MB) | Success, status "Pending verification" | | ⬜ PENDING |
| TC-SUB-003 | View active subscription status | N/A | Dashboard shows subscription card with plan name, expiry date, formatted invoice code (monospace) | | ⬜ PENDING |
| TC-SUB-004 | Access pickup page (subscribed user) | N/A | `/dashboard/pickup` loads successfully, shows weekly pickup count | | ⬜ PENDING |
| TC-SUB-005 | View subscription history | N/A | Table shows past subscriptions with status | | ⬜ PENDING |
| TC-SUB-006 | Renew expired subscription | Select plan → Upload proof | New payment pending verification | | ⬜ PENDING |

---

## 📅 5. PICKUP REQUEST SYSTEM (CUSTOMER)

**Feature Description:** Customer dengan subscription aktif dapat membuat pickup request dengan validasi frequency (Weekly: max 1/week, Bi-weekly: max 2/week, Flexible: unlimited).

| TC ID | Test Scenario | Subscription Frequency | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------------------|------------|-----------------|---------------|--------|
| TC-PICKUP-001 | Create first pickup request (Weekly plan) | Weekly | Date: Tomorrow<br>Time: 10:00<br>Address: "Jl. Test 123"<br>Waste: Plastik 5kg | Success, pickup created status "Pending", weekly count = 1 | | ⬜ PENDING |
| TC-PICKUP-002 | Attempt 2nd pickup same week (Weekly plan) | Weekly | Date: 2 days later (same week)<br>Waste: Kardus 3kg | Error: "Batas pickup mingguan tercapai" (max 1/week) | | ⬜ PENDING |
| TC-PICKUP-003 | Create first pickup request (Bi-weekly plan) | Bi-weekly | Date: Tomorrow<br>Waste: Plastik 5kg | Success, pickup created, weekly count = 1 | | ⬜ PENDING |
| TC-PICKUP-004 | Create 2nd pickup same week (Bi-weekly plan) | Bi-weekly | Date: 2 days later (same week)<br>Waste: Kardus 3kg | Success, pickup created, weekly count = 2 | | ⬜ PENDING |
| TC-PICKUP-005 | Attempt 3rd pickup same week (Bi-weekly plan) | Bi-weekly | Date: 3 days later (same week) | Error: "Batas pickup mingguan tercapai" (max 2/week) | | ⬜ PENDING |
| TC-PICKUP-006 | Create multiple pickups (Flexible plan) | Flexible | Create 3+ pickups same week | All pickups created successfully (no limit) | | ⬜ PENDING |
| TC-PICKUP-007 | View pickup calendar | N/A | FullCalendar displays all scheduled pickups with color-coded status | | ⬜ PENDING |
| TC-PICKUP-008 | View pickup history | N/A | Table shows past pickups with driver, waste details, invoice code (monospace), points earned | | ⬜ PENDING |

**Note:** Frequency validation menggunakan `event_date` (bukan `created_at`) dan case-insensitive matching untuk flexibility ("Weekly", "weekly", "Bi-weekly", "bi-weekly", etc).

---

## 🎁 6. REWARDS & POINTS SYSTEM (CUSTOMER)

**Feature Description:** Customer mengumpulkan points dari pickup dan dapat menukar dengan rewards. Tier otomatis assigned berdasarkan total points.

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-REWARD-001 | View available rewards | N/A | Grid/list displays rewards with icons, required points, stock | | ⬜ PENDING |
| TC-REWARD-002 | Redeem reward (sufficient points) | Reward: "Voucher 50K" (1000 pts)<br>Current Balance: 2000 pts | Success, points deducted (balance = 1000), redemption record created | | ⬜ PENDING |
| TC-REWARD-003 | View points transaction history | N/A | Shows earned points from pickups and spent on rewards | | ⬜ PENDING |
| TC-REWARD-004 | View redemption history | N/A | Table shows redeemed rewards with dates and points spent | | ⬜ PENDING |
| TC-REWARD-005 | Filter rewards by category | Category: "Voucher" | Only vouchers displayed | | ⬜ PENDING |

---

## 🚗 7. VEHICLE MANAGEMENT (DRIVER)

**Feature Description:** Driver select vehicle, set location, activate status, dan unbind vehicle saat logout.

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-VEH-001 | View available vehicles | N/A | List shows only unassigned vehicles | | ⬜ PENDING |
| TC-VEH-002 | Select vehicle | Vehicle: "B1234XYZ - Pickup Truck" | Success, vehicle assigned to driver | | ⬜ PENDING |
| TC-VEH-003 | Set pickup location | Location: "Jakarta Selatan"<br>Coordinates: (lat, lng) | Location saved | | ⬜ PENDING |
| TC-VEH-004 | Activate driver status | Vehicle selected + Location set | Status → "Active", driver available for pickup requests | | ⬜ PENDING |
| TC-VEH-005 | Logout and unbind vehicle | N/A | Vehicle unbinded (status → "Available"), session cleared | | ⬜ PENDING |

---

## 🚚 8. DRIVER PICKUP OPERATIONS

**Feature Description:** Driver melihat pickup requests yang sesuai (location, weight, vehicle category), accept, dan complete pickup dengan input waste data.

| TC ID | Test Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------------|---------------|--------|
| TC-DRV-PICKUP-001 | View pending requests (filtered) | Driver location: "Jakarta Selatan"<br>Vehicle: Pickup Truck (0-500kg) | Only shows pickups matching: location (case-insensitive), weight range, vehicle category, date >= today | | ⬜ PENDING |
| TC-DRV-PICKUP-002 | View request details | Select pickup | Modal shows customer name, phone, address, date/time, notes, waste categories, total weight | | ⬜ PENDING |
| TC-DRV-PICKUP-003 | Accept pickup request | Click "Accept" | Status → "Accepted", customer notified, request hidden from other drivers | | ⬜ PENDING |
| TC-DRV-PICKUP-004 | Navigate to location | Click "Navigate" | Opens map navigation to customer address | | ⬜ PENDING |
| TC-DRV-PICKUP-005 | Update status: On The Way | Click "On The Way" | Status → "On The Way", customer notified | | ⬜ PENDING |
| TC-DRV-PICKUP-006 | Update status: Arrived | Click "Arrived" | Status → "Arrived", waste input form appears | | ⬜ PENDING |
| TC-DRV-PICKUP-007 | Input waste data | Plastik PET: 5 kg<br>Kardus: 3 kg | Waste data saved with quantities | | ⬜ PENDING |
| TC-DRV-PICKUP-008 | Complete pickup | Click "Complete" | Status → "Completed", points calculated (5kg×5000 + 3kg×3000 = 34000 pts), added to customer balance | | ⬜ PENDING |
| TC-DRV-PICKUP-009 | View pickup history | N/A | Table shows completed pickups with dates, customers, earnings | | ⬜ PENDING |
| TC-DRV-PICKUP-010 | View earnings summary | N/A | Dashboard shows total pickups completed, total earnings | | ⬜ PENDING |

**Note:** Location matching menggunakan case-insensitive comparison (`UPPER(pe.pickup_regency) = UPPER(?)`).

---

## 👤 9. PROFILE MANAGEMENT

**Feature Description:** User dapat view dan update profile information.

| TC ID | Test Scenario | User Role | Input Data | Expected Output | Actual Output | Status |
|-------|---------------|-----------|------------|-----------------|---------------|--------|
| TC-PROFILE-001 | View profile | Customer | N/A | Displays name, email, phone, address, tier badge with icon | | ⬜ PENDING |
| TC-PROFILE-002 | Update profile | Customer | Phone: 081234567890<br>Address: "Jl. Baru 456" | Success, changes saved and displayed | | ⬜ PENDING |
| TC-PROFILE-003 | View driver profile | Driver | N/A | Shows driver info, KTP number, SIM number, verification status, statistics (responsive on mobile) | | ⬜ PENDING |

---

## 🏆 10. TIER SYSTEM

**Feature Description:** Customer otomatis assigned ke tier berdasarkan total points dengan tier icon yang ditampilkan di dashboard.

| TC ID | Test Scenario | Points Range | Expected Output | Actual Output | Status |
|-------|---------------|--------------|-----------------|---------------|--------|
| TC-TIER-001 | View tier badge (Bronze) | 0 - 999 points | Dashboard shows Bronze tier with custom icon image (not placeholder) | | ⬜ PENDING |
| TC-TIER-002 | Auto tier upgrade (Silver) | After pickup: points >= 1000 | Tier automatically updated to Silver, icon changes | | ⬜ PENDING |
| TC-TIER-003 | View tier icon | Any tier | Tier icon displays custom image with fallback to dummy.png on error | | ⬜ PENDING |

---

## 📝 Test Execution Guidelines

### Recommended Test Order

```
Phase 1: Setup & Foundation (TC-AUTH, TC-WASTE, TC-REWARD, TC-VEHICLE, TC-PLAN)
├─ Authentication & Master Data
└─ Total: ~20 test cases

Phase 2: Admin Verification (TC-PAY, TC-DRV-VER)
├─ Payment & Driver Verification
└─ Total: 6 test cases

Phase 3: Customer Journey (TC-SUB, TC-PICKUP, TC-REWARD)
├─ Subscription → Pickup → Rewards
└─ Total: ~20 test cases

Phase 4: Driver Journey (TC-VEH, TC-DRV-PICKUP)
├─ Vehicle Selection → Pickup Operations
└─ Total: 15 test cases

Phase 5: Profiles & Tiers (TC-PROFILE, TC-TIER)
└─ Total: 6 test cases
```

---

### Status Symbols

- ⬜ **PENDING** - Belum ditest
- ✅ **PASS** - Test berhasil sesuai expected
- ❌ **FAIL** - Test gagal
- ⚠️ **BLOCKED** - Tidak bisa ditest (dependency)

---

### How to Fill Actual Output

**Format:**
- ✅ Sesuai expected output
- ✅ Redirect ke /admin, tampil dashboard admin
- ✅ Category muncul di table dengan icon image ter-display
- ✅ Frequency validation bekerja: Error muncul "Batas pickup mingguan tercapai"
- ❌ Expected redirect /dashboard tapi redirect ke /pricing
- ❌ Icon tidak muncul, hanya path text

**Best Practice:**
- Kalau PASS dan sesuai 100%, cukup tulis: "✅ Sesuai expected"
- Kalau PASS tapi ada detail penting, tulis detail tersebut
- Kalau FAIL, jelaskan perbedaan antara expected vs actual

---

## 📊 Test Summary Report Template

Seteleh semua testing selesai:

```
=====================================================
SILAP - BLACKBOX TESTING SUMMARY REPORT
=====================================================

Informasi Testing:
- Application: SILAP v1.0
- Test Type: Blackbox - Functional Testing (Positive Cases)
- Test Period: [Start Date] - [End Date]
- Tester: [Your Name]
- Environment: [Production / Staging / Local]

Total Test Cases: 64

Execution Summary:
├─ Total Executed: [X]
├─ Passed: [X]
├─ Failed: [X]
└─ Blocked: [X]

Pass Rate: [X]%

Breakdown by Feature Module:
1. Authentication & Authorization: [X]/6 passed
2. Master Data Management: [X]/12 passed
3. Payment & Driver Verification: [X]/6 passed
4. Subscription Management: [X]/6 passed
5. Pickup Request System: [X]/8 passed
6. Rewards & Points System: [X]/5 passed
7. Vehicle Management: [X]/5 passed
8. Driver Pickup Operations: [X]/10 passed
9. Profile Management: [X]/3 passed
10. Tier System: [X]/3 passed

Issues Found:
├─ Critical: [X]
├─ Medium: [X]
└─ Minor: [X]

Kesimpulan:
[Tulis kesimpulan testing results]

Rekomendasi:
[Jika ada improvement yang perlu dilakukan]

```

---

## 🐛 Bug Report Template

Jika menemukan bug saat testing:

```markdown
BUG ID: BUG-XXX
Related Test Case: TC-YYY-ZZZ
Severity: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

Title:
[Brief bug title]

Description:
[Detailed description]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Environment:
- Browser: Chrome 120
- OS: macOS Sonoma
- URL: http://localhost:3000/...
- Date: [Test date]

Screenshot/Evidence:
[Attach if available]

Priority: [High/Medium/Low]
Status: [Open/In Progress/Fixed/Closed]
```

---

## 📋 Feature Coverage Checklist

Pastikan semua fitur di-cover:

**Authentication & Authorization**
- [x] Role-based login redirect
- [x] Subscription-based access control

**Admin Features**
- [x] Master data CRUD (Waste, Reward, Vehicle, Plans)
- [x] Payment verification (verify/reject/cancel)
- [x] Driver verification
- [x] View history

**Customer Features**
- [x] Subscription & payment
- [x] Pickup request dengan frequency validation
- [x] Weekly pickup count tracking
- [x] Reward redemption
- [x] Points & tier system
- [x] Profile management

**Driver Features**
- [x] Vehicle management (select/activate/unbind)
- [x] Location-based pickup filtering (case-insensitive)
- [x] Pickup operations (accept → navigate → update status → input waste → complete)
- [x] Earnings tracking

**System Features**
- [x] File uploads (icons, payment proofs)
- [x] Email notifications
- [x] Automatic tier assignment
- [x] Soft delete & reactivation
- [x] Invoice code formatting

---

## 💡 Tips untuk Dokumentasi Skripsi

### Methodology Section
```
Metode Testing: Blackbox Testing - Functional Testing
Teknik: Positive Testing
Pendekatan: Feature-based Testing

Rasionalisasi:
- Positive testing dipilih untuk memverifikasi bahwa semua fitur 
  berfungsi sesuai requirement ketika diberikan input yang valid.
- Feature-based organization memastikan coverage yang comprehensive 
  terhadap seluruh fungsionalitas sistem.
```

### Results Section
```
Hasil Testing:
- Total 64 test cases covering 10 feature modules
- Pass rate: [X]%
- Semua fitur critical (Authentication, Subscription, Pickup, Payment 
  Verification) berfungsi dengan baik
- [Detail findings jika ada]
```

### Best Practice
1. **Screenshot Organization:**
   - Folder structure: `/evidence/[feature-name]/TC-XXX-YYY.png`
   - Example: `/evidence/pickup-system/TC-PICKUP-001.png`

2. **Evidence Documentation:**
   - Critical features: Screenshot + brief description
   - CRUD operations: Screenshot of success message
   - API calls: Save response JSON if relevant

3. **Test Data:**
   - Use consistent test data across all test cases
   - Document test accounts (admin, customer, driver)
   - Document master data used

---

## ✅ Pre-Testing Checklist

Sebelum memulai testing:
- [ ] Environment ready (database, uploads folder, email config)
- [ ] Test accounts created:
  - [ ] Admin account (verified)
  - [ ] Driver account (verified)
  - [ ] Customer account (unsubscribed)
  - [ ] Customer account (subscribed)
- [ ] Master data seeded:
  - [ ] Waste categories dengan icons
  - [ ] Reward categories & items dengan icons
  - [ ] Vehicle categories & vehicles dengan icons
  - [ ] Subscription plans (Weekly, Bi-weekly, Flexible)
  - [ ] Tier levels configured
- [ ] Redis running (untuk session)
- [ ] Browser console ready (untuk debug jika perlu)

---

## 📖 Notes

### Kenapa Positive Testing Saja?

Untuk skripsi, positive testing sudah cukup karena:
1. ✅ Memverifikasi semua requirement terpenuhi
2. ✅ Menunjukkan sistem berfungsi end-to-end
3. ✅ Membuktikan integrasi antar modul bekerja
4. ✅ Lebih praktis dan fokus pada functionality

Negative testing lebih appropriate untuk:
- Security testing
- Production-ready validation
- QA comprehensive

### Feature-Based vs Role-Based Organization

**Feature-based** (yang digunakan):
- ✅ Better coverage visibility
- ✅ Easier to identify missing features
- ✅ Clearer for documentation
- ✅ Menghindari redundancy

**Role-based** (alternatif):
- Multiple roles test same feature
- More redundant test cases
- Harder to track feature coverage

---

## 🎯 Kesimpulan

Document ini meng-cover **64 positive test cases** untuk **10 feature modules** di aplikasi SILAP dengan fokus pada:
- ✅ Functional correctness
- ✅ End-to-end user flows
- ✅ Feature completeness
- ✅ Integration validation

Testing approach ini sesuai untuk:
- 📚 Thesis/Skripsi requirements
- 🎓 Academic documentation
- ✅ Functional acceptance testing
