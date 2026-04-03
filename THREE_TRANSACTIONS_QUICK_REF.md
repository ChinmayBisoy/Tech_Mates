# Three Transactions - Quick Reference

## Visual Summary

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DEVELOPER'S MONEY FLOWS                           │
└──────────────────────────────────────────────────────────────────────┘

                         💼 TRANSACTION 1
                    CLIENT → DEVELOPER ($)
                         
                      Milestone Payment
                              
                Client funds project milestone
                       ↓
                Money in Escrow (held)
                       ↓
              Developer completes work
                       ↓
               Client releases payment
                       ↓
              90% → Developer Wallet ✅
              10% → Platform Revenue


                    📊 DEVELOPER'S WALLET
                           (Balance)
                    
               ┌──────────────────────┐
               │ Available: ₹9,000   │
               │ Pending: ₹5,000     │
               │ Total: ₹14,000      │
               └──────────────────────┘


              💳 TRANSACTION 3                 🏦 TRANSACTION 2
         DEVELOPER → TECH-MATES             DEVELOPER → BANK/UPI
              
           Subscription Payment               Withdrawal
              
        Developer upgrades Pro              Developer withdraws
          Pays ₹839 from bank              Converts wallet → bank
                 ↓                              ↓
    Wallet: ₹9,000 - ₹839                Wallet: ₹9,000 → ₹7,000
           = ₹8,161                     Bank: +₹2,000 (in 2-5 days)
                 ↓                            ↓
        ✅ Pro Badge Unlocked        ✅ Money in Account
        ✅ All Features Enabled      ✅ Can withdraw weekly
```

---

## Three Transactions Explained Simply

### 1️⃣ CLIENT PAYS DEVELOPER
**When?** After project work is complete  
**How much?** Variable (₹1,000 → ₹100,000+)  
**Payment method?** UPI / Card / Razorpay  
**Time to receive?** Instant (on wallet)  
**Can withdraw?** After client approves  

```
Client: "I'll pay ₹1000 for this design"
         ↓
Developer: Completes work
         ↓
Client: Approves and releases payment
         ↓
Developer: Gets ₹900 in wallet (after 10% fee)
```

### 2️⃣ DEVELOPER WITHDRAWS MONEY
**When?** Anytime (minimum ₹500)  
**From?** Wallet (earned from projects)  
**To?** Bank account or UPI ID  
**Time to receive?** 2-5 business days  
**Method?** Bank Transfer (NEFT/IMPS) or UPI  

```
Developer: "I have ₹5000 in wallet, I need cash"
         ↓
Enters bank details
         ↓
Requests ₹3000 withdrawal
         ↓
Razorpay processes
         ↓
Bank transfer initiated
         ↓
Money arrives in account (2-5 days)
```

### 3️⃣ DEVELOPER BUYS SUBSCRIPTION
**When?** To unlock Pro/Max features  
**Cost?** ₹839 (Pro) or ₹4,145 (Max) monthly  
**Payment method?** UPI / Card (from bank, not wallet)  
**Time to activate?** Instant  
**Lasts?** 1 month (auto-renews unless cancelled)  

```
Developer: "I want Pro features to get more clients"
         ↓
Clicks "Upgrade to Pro"
         ↓
Selects UPI payment
         ↓
Scans QR / enters UPI ID
         ↓
Pays ₹839
         ↓
✅ Pro Badge appears
✅ Featured listings enabled
✅ Priority support enabled
```

---

## Side-by-Side Comparison

| Feature | Transaction 1 | Transaction 2 | Transaction 3 |
|---------|---|---|---|
| **Direction** | Client → Dev | Dev → Bank | Dev → Tech-Mates |
| **Amount** | Variable | Variable (min ₹500) | Fixed (₹839/₹4,145) |
| **From** | Client's bank | Dev's wallet | Dev's bank |
| **To** | Dev's wallet | Dev's bank/UPI | Tech-Mates account |
| **Time** | Instant (after approval) | 2-5 days | Instant |
| **Frequency** | Per project | Weekly/Monthly | Monthly |
| **Require KYC** | No | Yes | No |
| **Affect balance** | +₹ (90% of payment) | -₹ (immediately) | -₹ (from bank, not wallet) |
| **Status tracking** | Yes | Yes | Yes |

---

## Developer's Wallet Journey

```
STAGE 1: New Developer
┌─────────────────┐
│ Wallet: ₹0      │  (Fresh account)
│ Subscription: Free
└─────────────────┘

        ↓ (Gets hired for ₹1000 project)

STAGE 2: Milestone Funded
┌─────────────────┐
│ Wallet: ₹0      │  (Still pending approval)
│ Pending: ₹900   │  (90% of ₹1000 after client releases)
│ Subscription: Free
└─────────────────┘

        ↓ (Client releases payment)

STAGE 3: Payment Released
┌─────────────────┐
│ Wallet: ₹900    │  ✅ Can use now
│ Pending: ₹0     │
│ Subscription: Free
└─────────────────┘

        ↓ (Developer wants Pro features, upgrades subscription)

STAGE 4: Paid Subscription
┌─────────────────┐
│ Wallet: ₹61     │  (₹900 - ₹839 subscription fee)
│ Pending: ₹0     │
│ Subscription: Pro ✅
└─────────────────┘

        ↓ (Gets more projects, earns ₹9000)

STAGE 5: Multiple Projects
┌─────────────────┐
│ Wallet: ₹9,061  │
│ Pending: ₹0     │
│ Subscription: Pro
└─────────────────┘

        ↓ (Withdraws ₹5000 to bank)

STAGE 6: After Withdrawal
┌─────────────────┐
│ Wallet: ₹4,061  │  (₹9,061 - ₹5,000 withdrawn)
│ Pending: ₹0     │
│ Subscription: Pro
│ Withdrawn: ₹5,000 (processing)
└─────────────────┘

        ↓ (2-5 days later)

STAGE 7: Withdrawal Complete
┌─────────────────┐
│ Wallet: ₹4,061  │  (Can withdraw again)
│ Bank: +₹5,000   │  ✅ Received!
│ Subscription: Pro (renews next month)
└─────────────────┘
```

---

## Common Scenarios

### Scenario A: Happy Path
```
1. Developer accepts project (₹2000)
2. Client funds milestone: ₹2000 paid
3. Developer completes work
4. Client releases: Dev wallet +₹1800 (90%)
5. Developer has ₹1800 available
6. Developer withdraws ₹1000 to bank
7. Money arrives in 2-5 days
8. Developer still has ₹800 in wallet
9. Later: Developer upgrades to Pro: ₹800 - ₹839 FAIL (not enough)
10. Developer waits for next project payment
```

### Scenario B: Multiple Projects
```
1. Project 1 released: Wallet +₹1800
2. Project 2 released: Wallet +₹3600 (total: ₹5400)
3. Developer pays subscription: ₹5400 - ₹839 = ₹4561
4. Developer withdraws ₹4000: ₹4561 - ₹4000 = ₹561 left
5. Project 3 released: ₹561 + ₹2700 = ₹3261
6. Developer withdraws ₹3000: ₹3261 - ₹3000 = ₹261 left
```

### Scenario C: Subscription Renewal
```
Month 1:
- Developer pays ₹839 for Pro
- Subscription active for 30 days

Day 30:
- Auto-renewal triggered
- Tries to charge ₹839 again
- If wallet < ₹839: Use payment method on file
- If no payment method: Subscription paused (show warning)

Day 31:
- If payment succeeded: Subscription continues
- If payment failed: Subscription cancelled (show notification)
```

---

## Payment Method for Each Transaction

| Transaction | Payment Method | Source |
|---|---|---|
| **Transaction 1** (Client→Dev) | Card/UPI/Razorpay | Client's bank |
| **Transaction 2** (Dev→Bank) | Bank Transfer/UPI | Developer's wallet |
| **Transaction 3** (Dev→Tech-Mates) | Card/UPI/Razorpay | Developer's bank |

⚠️ **Note**: Transaction 2 uses wallet balance, not bank card!

---

## Implementation Status

### Transaction 1: Client → Developer
- [ ] Create Razorpay config
- [ ] Add fundMilestone endpoint
- [ ] Add payment verification
- [ ] Add escrow logic
- [ ] Add wallet credit logic

### Transaction 2: Developer → Bank
- [ ] Create withdrawal form
- [ ] Add Razorpay Payouts API
- [ ] Add wallet deduction
- [ ] Add status tracking
- [ ] Add success notifications

### Transaction 3: Developer → Tech-Mates
- [ ] Create UPI payment form
- [ ] Add Razorpay order creation
- [ ] Add payment verification
- [ ] Add subscription creation
- [ ] Add auto-renewal logic

---

## Quick Action Items

**For Developers (Getting Money)**
1. Complete project (Transaction 1)
2. Withdraw to bank (Transaction 2)
3. Optional: Upgrade subscription (Transaction 3)

**For Clients (Paying)**
1. Fund milestone (Transaction 1)
2. Wait for completion
3. Release payment
4. Developer gets money

**For Platform**
1. Take 10% fee from each milestone
2. Process withdrawals via Razorpay
3. Handle subscription billing
4. Track all transactions

---

## Error Handling

**What if client doesn't release?**
- Auto-release after 7 days
- Developer gets money automatically
- Notification sent to both parties

**What if withdrawal fails?**
- Money stays in wallet
- Show error message
- Developer can retry
- Support ticket option

**What if subscription payment fails?**
- Show warning
- Ask for new payment method
- Subscription paused (not cancelled)
- Can reactivate anytime

---

## Key Reminders

✅ **All amounts in PAISE in database** (100 paise = ₹1)  
✅ **Display in RUPEES in UI** (₹1 = 100 paise)  
✅ **Platform fee always 10%** (configurable)  
✅ **Minimum withdrawal: ₹500**  
✅ **Subscription auto-renews** unless cancelled  
✅ **KYC required for withdrawal only**  
✅ **All transactions logged** for audit trail  
✅ **Webhooks verify payments** not frontend  

---

## Next Steps

1. Read: `THREE_MONEY_TRANSACTIONS.md` (full details)
2. Setup: Environment variables (keys & secrets)
3. Code: Follow implementation checklist above
4. Test: Use test credentials from Razorpay
5. Deploy: Go live with production keys
