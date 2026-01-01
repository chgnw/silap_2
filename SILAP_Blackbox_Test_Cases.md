# SILAP - Blackbox Testing Test Cases (Positive Testing Only)

## Test Information
- **Application Name:** SILAP (Sistem Informasi Layanan Antar dan Pickup)
- **Testing Type:** Blackbox Testing - Positive Test Cases
- **Test Date:** December 2025
- **Tester:** [Your Name]

---

## 📊 Test Case Summary

| Category | Module | Total Test Cases |
|----------|--------|------------------|
| **Authentication & Authorization** | Login & Access Control | 6 |
| **Admin** | Waste Category CRUD | 4 |
| **Admin** | Other CRUD (Representative) | 2 |
| **Admin** | Payment Verification | 3 |
| **Admin** | Driver Verification | 2 |
| **Customer** | Subscription | 4 |
| **Customer** | Pickup Request | 4 |
| **Customer** | Reward Redemption | 3 |
| **Driver** | Vehicle Assignment | 3 |
| **Driver** | Pickup Flow | 10 |
| **TOTAL** | - | **41** |

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### TC-AUTH: Authentication & Role-Based Access

| TC ID | Scenario | User Type | Input Data | Steps | Expected Output | Actual Output | Status |
|-------|----------|-----------|------------|-------|-----------------|---------------|--------|
| TC-AUTH-001 | Admin login | Admin | Email: admin@silap.com<br>Password: Admin123! | 1. Navigate to /login<br>2. Enter credentials<br>3. Click "Login" | Redirect to /admin dashboard | | ⬜ PENDING |
| TC-AUTH-002 | Driver login (verified) | Driver | Email: driver@silap.com<br>Password: Driver123! | 1. Navigate to /login<br>2. Enter credentials<br>3. Click "Login" | Redirect to /driver dashboard | | ⬜ PENDING |
| TC-AUTH-003 | Customer login (unsubscribed) | Customer | Email: customer@silap.com<br>Password: Cust123! | 1. Navigate to /login<br>2. Enter credentials<br>3. Click "Login" | Redirect to /pricing page | | ⬜ PENDING |
| TC-AUTH-004 | Customer login (subscribed) | Customer | Email: subscribed@silap.com<br>Password: Cust123! | 1. Navigate to /login<br>2. Enter credentials<br>3. Click "Login" | Redirect to /dashboard | | ⬜ PENDING |
| TC-AUTH-005 | Customer registration | New User | Name: "John Doe"<br>Email: john@test.com<br>Phone: 081234567890<br>Password: Pass123!<br>Address: "Jl. Test 123" | 1. Navigate to /register<br>2. Fill all fields<br>3. Submit | Account created, redirect to /login | | ⬜ PENDING |
| TC-AUTH-006 | Logout | Any Role | N/A | 1. Click logout button<br>2. Confirm | Redirect to home, session cleared | | ⬜ PENDING |

---

## 👨‍💼 ADMIN ROLE

### TC-ADM-WASTE: Waste Category CRUD (Full Testing)

| TC ID | Scenario | Input Data | Steps | Expected Output | Actual Output | Status |
|-------|----------|------------|-------|-----------------|---------------|--------|
| TC-ADM-WASTE-001 | Create waste category | Name: "Plastik PET"<br>Icon: valid_icon.png<br>Price: 5000 | 1. Navigate to /admin/waste<br>2. Click "Add Category"<br>3. Fill form & upload icon<br>4. Submit | Success message, category in table | | ⬜ PENDING |
| TC-ADM-WASTE-002 | View all waste categories | N/A | 1. Navigate to /admin/waste | Table shows all categories with name, icon, price | | ⬜ PENDING |
| TC-ADM-WASTE-003 | Update waste category | Name: "Plastik PET (Updated)"<br>Price: 6000 | 1. Click "Edit" on category<br>2. Update fields<br>3. Submit | Success message, changes in table | | ⬜ PENDING |
| TC-ADM-WASTE-004 | Delete waste category | N/A | 1. Click "Delete" on category<br>2. Confirm | Success, category soft-deleted (hidden) | | ⬜ PENDING |

---

### TC-ADM-CRUD: Other CRUD Modules (Representative Testing)

| TC ID | Module | Scenario | Input Data | Expected Output | Actual Output | Status |
|-------|--------|----------|------------|-----------------|---------------|--------|
| TC-ADM-CRUD-001 | Reward Category | Create category | Name: "Elektronik"<br>Icon: icon.png | Success, category created | | ⬜ PENDING |
| TC-ADM-CRUD-002 | Vehicle | Create vehicle | Plate: "B1234XYZ"<br>Category: Pickup Truck<br>Icon: vehicle.jpg | Success, vehicle created | | ⬜ PENDING |

**Note:** *Modul CRUD lainnya (Reward Items, Vehicle Category, Subscription Plans) menggunakan pattern yang sama, sehingga cukup diwakilkan dengan 2 test case ini untuk memastikan konsistensi implementasi.*

---

### TC-ADM-PAY: Payment Verification

| TC ID | Scenario | Steps | Expected Output | Actual Output | Status |
|-------|----------|-------|-----------------|---------------|--------|
| TC-ADM-PAY-001 | View pending payments | 1. Navigate to /admin/subscriptions<br>2. Filter by "Pending" | List of pending payments displayed | | ⬜ PENDING |
| TC-ADM-PAY-002 | Verify payment | 1. Click "View" on payment<br>2. Review details<br>3. Click "Verify"<br>4. Confirm | Status → "Verified", customer subscription activated, email sent | | ⬜ PENDING |
| TC-ADM-PAY-003 | View payment proof | 1. Click "View" on payment<br>2. View uploaded image | Modal shows customer info, plan details, payment proof image | | ⬜ PENDING |

---

### TC-ADM-DRV: Driver Verification

| TC ID | Scenario | Steps | Expected Output | Actual Output | Status |
|-------|----------|-------|-----------------|---------------|--------|
| TC-ADM-DRV-001 | View pending drivers | 1. Navigate to /admin/drivers<br>2. Filter "Pending" | List of pending driver registrations | | ⬜ PENDING |
| TC-ADM-DRV-002 | Verify driver | 1. Click "View" on driver<br>2. Review documents<br>3. Click "Verify"<br>4. Confirm | Status → "Verified", driver can login, email sent | | ⬜ PENDING |

---

## 👤 CUSTOMER ROLE

### TC-CUST-SUB: Subscription

| TC ID | Scenario | Input Data | Steps | Expected Output | Actual Output | Status |
|-------|----------|------------|-------|-----------------|---------------|--------|
| TC-CUST-SUB-001 | View subscription plans | N/A | 1. Navigate to /pricing | All available plans displayed | | ⬜ PENDING |
| TC-CUST-SUB-002 | Subscribe to plan | Plan: "Premium"<br>Payment Proof: proof.jpg (1MB) | 1. Click "Subscribe" on plan<br>2. Fill payment form<br>3. Upload proof<br>4. Submit | Success, status "Pending verification" | | ⬜ PENDING |
| TC-CUST-SUB-003 | View subscription status | N/A | 1. Navigate to /dashboard | Shows subscription status, expiry date | | ⬜ PENDING |
| TC-CUST-SUB-004 | Access pickup page (subscribed) | N/A | 1. Login as subscribed customer<br>2. Navigate to /dashboard/pickup | Page loads successfully | | ⬜ PENDING |

---

### TC-CUST-PICKUP: Pickup Request

| TC ID | Scenario | Input Data | Steps | Expected Output | Actual Output | Status |
|-------|----------|------------|-------|-----------------|---------------|--------|
| TC-CUST-PICKUP-001 | Create pickup request | Address: "Jl. Test 123"<br>Date: Tomorrow<br>Time: 10:00<br>Notes: "Depan pintu" | 1. Navigate to /dashboard/pickup<br>2. Click "Request Pickup"<br>3. Fill form<br>4. Submit | Success, pickup created with status "Pending" | | ⬜ PENDING |
| TC-CUST-PICKUP-002 | View pickup history | N/A | 1. Navigate to history tab | List of all pickups with status | | ⬜ PENDING |
| TC-CUST-PICKUP-003 | View pickup details | N/A | 1. Click on completed pickup | Shows date, driver, waste items, points earned | | ⬜ PENDING |
| TC-CUST-PICKUP-004 | View updated points | N/A | 1. Check dashboard after completed pickup | Points balance updated correctly | | ⬜ PENDING |

---

### TC-CUST-REWARD: Reward Redemption

| TC ID | Scenario | Input Data | Steps | Expected Output | Actual Output | Status |
|-------|----------|------------|-------|-----------------|---------------|--------|
| TC-CUST-REWARD-001 | View available rewards | N/A | 1. Navigate to /dashboard/rewards | List of rewards with required points | | ⬜ PENDING |
| TC-CUST-REWARD-002 | Redeem reward | Reward: "Voucher 50K" (1000 pts)<br>Balance: 2000 pts | 1. Click "Redeem" on reward<br>2. Confirm | Success, points deducted, redemption record created | | ⬜ PENDING |
| TC-CUST-REWARD-003 | View redemption history | N/A | 1. Navigate to redemption history | List of redeemed rewards with dates | | ⬜ PENDING |

---

## 🚚 DRIVER ROLE

### TC-DRV-VEHICLE: Vehicle Assignment & Activation

| TC ID | Scenario | Input Data | Steps | Expected Output | Actual Output | Status |
|-------|----------|------------|-------|-----------------|---------------|--------|
| TC-DRV-VEHICLE-001 | Select and assign vehicle | Vehicle: "B1234XYZ - Pickup Truck" | 1. Navigate to /driver<br>2. Click "Select Vehicle"<br>3. Choose vehicle<br>4. Confirm | Vehicle assigned to driver | | ⬜ PENDING |
| TC-DRV-VEHICLE-002 | Set location and activate | Location: "Jakarta Selatan"<br>Coordinates: (lat, lng) | 1. Set pickup location on map<br>2. Click "Activate"<br>3. Confirm | Status → "Active", available for pickups | | ⬜ PENDING |
| TC-DRV-VEHICLE-003 | Logout and unbind vehicle | N/A | 1. Click logout<br>2. Confirm | Vehicle unbinded, status → "Available" | | ⬜ PENDING |

---

### TC-DRV-PICKUP: Pickup Flow (Complete)

| TC ID | Scenario | Input Data | Steps | Expected Output | Actual Output | Status |
|-------|----------|------------|-------|-----------------|---------------|--------|
| TC-DRV-PICKUP-001 | View pending requests | N/A | 1. Activate driver status<br>2. View pickup requests | List of nearby pending requests | | ⬜ PENDING |
| TC-DRV-PICKUP-002 | View request details | N/A | 1. Click on pickup request | Shows customer name, address, date/time, notes | | ⬜ PENDING |
| TC-DRV-PICKUP-003 | Accept pickup request | N/A | 1. Click "Accept" on request<br>2. Confirm | Status → "Accepted", customer notified | | ⬜ PENDING |
| TC-DRV-PICKUP-004 | Start navigation | N/A | 1. Click "Navigate" | Opens navigation to customer location | | ⬜ PENDING |
| TC-DRV-PICKUP-005 | Mark "On The Way" | N/A | 1. Click "On The Way"<br>2. Confirm | Status → "On The Way", customer notified | | ⬜ PENDING |
| TC-DRV-PICKUP-006 | Mark "Arrived" | N/A | 1. Click "Arrived"<br>2. Confirm | Status → "Arrived", waste input form appears | | ⬜ PENDING |
| TC-DRV-PICKUP-007 | Input waste data | Plastik PET: 5 kg<br>Kardus: 3 kg | 1. Enter waste quantities<br>2. Submit | Waste data saved successfully | | ⬜ PENDING |
| TC-DRV-PICKUP-008 | Complete pickup | N/A | 1. Click "Complete"<br>2. Confirm | Status → "Completed", points added to customer | | ⬜ PENDING |
| TC-DRV-PICKUP-009 | View pickup history | N/A | 1. Navigate to history tab | List of completed pickups | | ⬜ PENDING |
| TC-DRV-PICKUP-010 | View earnings summary | N/A | 1. Navigate to dashboard | Shows total pickups, total earnings | | ⬜ PENDING |

---

## 📝 Test Execution Guidelines

### Test Execution Order (Recommended)

```
Phase 1: Authentication & Setup (TC-AUTH-001 to TC-AUTH-006)
├─ Test all login scenarios
└─ Verify role-based redirects

Phase 2: Admin Functions (TC-ADM-WASTE-001 to TC-ADM-DRV-002)
├─ Setup master data (Waste Categories, Vehicles, etc.)
├─ Verify driver accounts
└─ Process pending payments

Phase 3: Customer Journey (TC-CUST-SUB-001 to TC-CUST-REWARD-003)
├─ Subscribe to plan
├─ Request pickup
└─ Redeem rewards

Phase 4: Driver Journey (TC-DRV-VEHICLE-001 to TC-DRV-PICKUP-010)
├─ Assign vehicle & activate
├─ Complete full pickup flow
└─ View history & earnings
```

---

### Status Symbols

- ⬜ **PENDING** - Belum ditest
- ✅ **PASS** - Test berhasil
- ❌ **FAIL** - Test gagal
- ⚠️ **BLOCKED** - Tidak bisa ditest (ada dependency)

---

### How to Fill Actual Output

**Format yang disarankan:**

```
✅ Berhasil redirect ke /admin (sesuai expected)
✅ Data muncul di table dengan benar
✅ Status berubah menjadi "Verified", email terkirim
❌ Redirect ke /pricing padahal harusnya /dashboard
❌ Error 500 muncul saat submit
```

**Tips:**
- Isi setelah melakukan test
- Tulis hasil aktual yang kamu lihat
- Screenshot bisa disimpan terpisah dengan naming: `TC-[ID].png`
- Kalau PASS, cukup tulis "✅ Sesuai expected"
- Kalau FAIL, jelaskan apa yang berbeda

---

## 📊 Test Summary Report Template

Setelah semua test selesai, isi summary ini:

```
===========================================
SILAP BLACKBOX TESTING - TEST SUMMARY
===========================================

Test Period: [Start Date] - [End Date]
Tester: [Your Name]

Total Test Cases: 41
├─ Executed: [X]
├─ Passed: [X]
├─ Failed: [X]
└─ Blocked: [X]

Pass Rate: [X]%

Breakdown by Category:
├─ Authentication: [X]/6 passed
├─ Admin Functions: [X]/11 passed
├─ Customer Functions: [X]/11 passed
└─ Driver Functions: [X]/13 passed

Critical Issues Found: [X]
Medium Issues Found: [X]
Minor Issues Found: [X]

Conclusion:
[Ringkasan hasil testing]
```

---

## 🐛 Bug Report Template (If Test Fails)

```markdown
BUG ID: BUG-001
Test Case: TC-XXX-XXX
Severity: 🔴 High / 🟠 Medium / 🟡 Low
Status: 🆕 Open / 🔄 In Progress / ✅ Fixed

Description:
[Jelaskan bug yang ditemukan]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[Yang seharusnya terjadi]

Actual Result:
[Yang benar-benar terjadi]

Screenshot:
[Nama file screenshot jika ada]

Environment:
- Browser: Chrome 120
- OS: macOS / Windows
- Date: [Test date]
```

---

## 📌 Notes

### Why Positive Testing Only?

Positive testing memverifikasi bahwa sistem berfungsi sesuai dengan requirement ketika diberikan input yang valid. Untuk aplikasi SILAP, pendekatan ini sudah cukup untuk memastikan:
- ✅ Semua fitur utama berfungsi dengan baik
- ✅ User flow dapat diselesaikan end-to-end
- ✅ Integrasi antar modul bekerja dengan benar

### Representative Testing Approach

Untuk modul CRUD yang repetitive (Reward Category, Vehicle Category, Subscription Plans), testing dilakukan secara representative dengan fokus pada:
- **Waste Category**: Full CRUD testing (Create, Read, Update, Delete)
- **Other Modules**: Sample testing untuk memastikan implementasi pattern yang konsisten

Pendekatan ini efisien dan sudah cukup untuk membuktikan bahwa implementasi CRUD di seluruh sistem konsisten.

---

## ✅ Testing Checklist

Sebelum memulai testing, pastikan:
- [ ] Test environment sudah ready (localhost/staging)
- [ ] Database dalam kondisi clean/reset
- [ ] Test accounts sudah dibuat (admin, driver, customer)
- [ ] Master data initial sudah ada (waste categories, vehicles, etc.)
- [ ] Browser console terbuka untuk melihat errors jika ada

Setelah testing selesai:
- [ ] Semua test case sudah diisi Actual Output & Status
- [ ] Screenshot disimpan dengan naming convention yang benar
- [ ] Test summary sudah diisi
- [ ] Bug report dibuat untuk test yang FAIL
- [ ] Dokumentasi lengkap untuk laporan skripsi
