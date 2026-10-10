# Security Specification: Vortex UC Top-Up Store

## 1. Data Invariants

1. **Product Integrity**: Only verified administrators can create, update, or delete products. Public users have read-only access to products.
2. **Order Creation & Identity**: Any customer (including guest players) can create an order with a valid schema. The order status must start strictly as `Awaiting Payment`.
3. **Order State Machine**: Non-admin customers cannot change order status to `Payment Confirmed`, `Delivered`, or `Refunded`. Only administrators can advance orders to fulfillment states or reject them.
4. **Manual Payment Submissions**: Customers can submit payment proof for an existing order with status `pending`. Customers cannot approve their own submissions or mark them `approved`.
5. **No Password Policy**: Neither orders nor user profiles ever request or store PUBG player account passwords.
6. **Receipt URL Isolation**: Payment receipts uploaded during manual checkout can only be viewed by administrators and the verified customer matching the order number/ID.
7. **Admin Privilege Escalation Guard**: The `admins` collection can only be written by existing superadmins or server bootstrap. Users cannot add themselves to `/admins/`.
8. **Duplicate Reference Prevention**: An approved transaction reference cannot be reused across multiple orders.
9. **Settings Lockdown**: Only administrators can modify `siteSettings` and read `auditLogs`.

---

## 2. The Dirty Dozen Payloads (Adversarial Test Vectors)

1. **Payload 1 (Self-Elevation Attack)**:
   A malicious unauthenticated user attempts to create `/admins/attacker_uid` with `role: "superadmin"`.
   *Expected: PERMISSION_DENIED*

2. **Payload 2 (Ghost Price Manipulation)**:
   A malicious user writes an update to `/products/{productId}` changing `prices.PKR` from `5000` to `1`.
   *Expected: PERMISSION_DENIED*

3. **Payload 3 (Instant Delivery Exploit)**:
   A buyer attempts to create an order directly with `status: "Delivered"` instead of `"Awaiting Payment"`.
   *Expected: PERMISSION_DENIED*

4. **Payload 4 (Client Status Jump)**:
   A customer submits an update to their order `/orders/{orderId}` changing `status` from `"Awaiting Payment"` to `"Payment Confirmed"`.
   *Expected: PERMISSION_DENIED*

5. **Payload 5 (ID Poisoning Attack)**:
   Attacker sends a 50KB random junk string as `orderId` or `playerId` to cause denial of wallet.
   *Expected: PERMISSION_DENIED*

6. **Payload 6 (Shadow Field Injection)**:
   Attacker sends an extra undocumented field `isAdmin: true` inside a payment submission payload.
   *Expected: PERMISSION_DENIED*

7. **Payload 7 (Self-Approval of Payment)**:
   Attacker creates a payment submission directly with `status: "approved"` and `verifiedBy: "system"`.
   *Expected: PERMISSION_DENIED*

8. **Payload 8 (Site Settings Hijack)**:
   Non-admin attempts to overwrite `/siteSettings/general` to redirect bank accounts to attacker's wallet.
   *Expected: PERMISSION_DENIED*

9. **Payload 9 (Audit Log Tampering)**:
   Attacker tries to delete or alter `/auditLogs/{logId}` records.
   *Expected: PERMISSION_DENIED*

10. **Payload 10 (Negative Price Injection)**:
    Attacker tries to create an order with negative amount (`amount: -500`).
    *Expected: PERMISSION_DENIED*

11. **Payload 11 (Customer PII Scraping)**:
    Unauthenticated user attempts a list query over `/orders` without specifying their own verified order number.
    *Expected: PERMISSION_DENIED*

12. **Payload 12 (Impersonation of Admin via Unverified Email)**:
    Attacker logs in with unverified email `princemadni88@gmail.com` without proper credentials and attempts admin write.
    *Expected: PERMISSION_DENIED*

---

## 3. Test Runner Specification

The test runner will verify that all 12 payloads return `PERMISSION_DENIED` under Firestore emulator or active rules.
