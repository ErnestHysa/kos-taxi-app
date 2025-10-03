# Stripe Payment Integration Setup

## Overview

Your Kos Taxi application has Stripe payment integration built-in and ready to use. This guide will walk you through the complete setup process to enable online payments.

---

## Why Stripe?

Stripe was selected for your application because:

✅ **Fully supports Greece** - Compliant with EU regulations (GDPR, PSD2)  
✅ **Easy integration** - Works seamlessly with Flask and React  
✅ **Secure** - PCI DSS Level 1 certified  
✅ **Popular payment methods** - Credit cards, debit cards, mobile payments  
✅ **Great documentation** - Comprehensive guides and support  
✅ **Test mode** - Develop and test without real money  

---

## Step-by-Step Setup

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click **"Start now"** or **"Sign up"**
3. Enter your email address
4. Create a password
5. Verify your email address
6. Complete the registration form:
   - Business name: "Kos Taxi" (or your company name)
   - Country: **Greece**
   - Business type: Select appropriate option
   - Industry: "Transportation & Logistics"

### Step 2: Get Your API Keys

1. Log in to your Stripe Dashboard
2. Click on **"Developers"** in the left sidebar
3. Click on **"API keys"**
4. You'll see two types of keys:

   **Test Mode Keys** (for development):
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...` (click "Reveal test key")

   **Live Mode Keys** (for production):
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

5. **Copy both test keys** for now (we'll start in test mode)

### Step 3: Configure Backend (Flask)

#### Option A: Environment Variable (Recommended)

Set the Stripe secret key as an environment variable:

```bash
export STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"
```

To make it permanent, add to your shell profile:

```bash
echo 'export STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"' >> ~/.bashrc
source ~/.bashrc
```

#### Option B: Configuration File

Edit `/home/ubuntu/kos_taxi_backend/src/routes/ride.py`:

Find this line (around line 10):
```python
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', 'sk_test_...')
```

Replace with:
```python
stripe.api_key = 'sk_test_YOUR_SECRET_KEY_HERE'
```

⚠️ **Warning**: Don't commit this to version control!

### Step 4: Configure Frontend (React)

Edit `/home/ubuntu/kos-taxi-app/src/components/RiderView.jsx`:

Find this section (around line 150):
```javascript
const stripe = await loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');
```

Replace with your publishable key:
```javascript
const stripe = await loadStripe('pk_test_51ABC123...');
```

### Step 5: Rebuild and Deploy

```bash
# Rebuild frontend
cd /home/ubuntu/kos-taxi-app
pnpm run build

# Copy to backend
cp -r dist/* ../kos_taxi_backend/src/static/

# Restart backend (if running locally)
cd ../kos_taxi_backend
source venv/bin/activate
python src/main.py
```

If deployed, the changes will be reflected automatically after rebuild.

---

## Testing Payments

### Test Card Numbers

Stripe provides test card numbers for different scenarios:

| Card Number | Scenario | Result |
|-------------|----------|--------|
| 4242 4242 4242 4242 | Success | Payment succeeds |
| 4000 0000 0000 0002 | Decline | Card declined |
| 4000 0000 0000 9995 | Insufficient funds | Insufficient funds error |
| 4000 0027 6000 3184 | 3D Secure | Requires authentication |

**For all test cards:**
- Use any future expiry date (e.g., 12/25)
- Use any 3-digit CVC (e.g., 123)
- Use any postal code (e.g., 12345)

### Test Payment Flow

1. **Request a Ride**
   - Go to https://60h5imcl10zo.manus.space
   - Fill in rider information
   - Set pickup and destination
   - Click "Request Ride"

2. **Accept as Driver**
   - Switch to Driver Dashboard
   - Select a driver account
   - Click "Accept Ride" on the pending request

3. **Make Payment**
   - The rider will see a payment prompt
   - Enter test card: `4242 4242 4242 4242`
   - Enter expiry: `12/25`
   - Enter CVC: `123`
   - Click "Pay"

4. **Verify Payment**
   - Check Stripe Dashboard > Payments
   - You should see the test payment listed

---

## Going Live (Production)

### Before Going Live

Complete these requirements in your Stripe Dashboard:

1. **Business Information**
   - Legal business name
   - Business address
   - Tax ID (if applicable)
   - Website URL

2. **Bank Account**
   - Add your Greek bank account
   - Verify account ownership
   - Set payout schedule

3. **Identity Verification**
   - Upload required documents
   - Verify business ownership
   - Complete KYC process

### Switch to Live Mode

1. In Stripe Dashboard, toggle from **Test** to **Live** mode
2. Get your live API keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

3. Update your application:

   **Backend:**
   ```bash
   export STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_SECRET_KEY"
   ```

   **Frontend:**
   ```javascript
   const stripe = await loadStripe('pk_live_YOUR_LIVE_PUBLISHABLE_KEY');
   ```

4. Rebuild and deploy
5. Test with a real card (small amount)
6. Verify payment appears in Stripe Dashboard

---

## Payment Flow in Your App

### How It Works

1. **Rider requests ride** → Ride created with status "pending"
2. **Driver accepts ride** → Status changes to "accepted"
3. **Backend creates Payment Intent** → Stripe generates client secret
4. **Frontend displays payment form** → Stripe Elements secure form
5. **Rider enters card details** → Data sent directly to Stripe (not your server)
6. **Stripe processes payment** → Returns success/failure
7. **Backend updates ride** → Payment status saved to database
8. **Ride completed** → Status changes to "completed"

### Security Features

✅ **PCI Compliance** - Card data never touches your server  
✅ **Tokenization** - Cards converted to secure tokens  
✅ **3D Secure** - Additional authentication when required  
✅ **Fraud Detection** - Stripe's built-in fraud prevention  
✅ **Encrypted** - All data encrypted in transit  

---

## Pricing and Fees

### Stripe Fees (Greece)

**Standard Pricing:**
- European cards: 1.4% + €0.25 per transaction
- Non-European cards: 2.9% + €0.25 per transaction

**Example:**
- Ride fare: €20.00
- Stripe fee: €0.53 (1.4% + €0.25)
- You receive: €19.47

### Payout Schedule

- **Default**: Daily automatic payouts
- **Customizable**: Weekly or monthly
- **Timing**: 2-3 business days to your bank account

---

## Monitoring Payments

### Stripe Dashboard

Access your Stripe Dashboard at https://dashboard.stripe.com

**Key Sections:**

1. **Payments** - View all transactions
2. **Customers** - Manage customer records
3. **Disputes** - Handle chargebacks
4. **Reports** - Financial reports and analytics
5. **Logs** - API request logs for debugging

### In Your Application

Check payment status via API:

```bash
curl https://60h5imcl10zo.manus.space/api/rides/1/payment-status
```

Response:
```json
{
  "payment_status": "succeeded",
  "payment_intent_id": "pi_xxx"
}
```

---

## Handling Refunds

### Full Refund

```python
import stripe
stripe.api_key = 'sk_test_...'

# Refund a payment
refund = stripe.Refund.create(
    payment_intent='pi_xxx',
)
```

### Partial Refund

```python
refund = stripe.Refund.create(
    payment_intent='pi_xxx',
    amount=500,  # €5.00 in cents
)
```

### Via Dashboard

1. Go to Stripe Dashboard > Payments
2. Find the payment
3. Click "Refund"
4. Enter amount
5. Confirm

---

## Common Issues

### Issue: "Invalid API Key"

**Cause**: Wrong or missing API key

**Fix**:
- Verify you copied the full key
- Check you're using the right mode (test vs live)
- Ensure environment variable is set correctly

### Issue: "Payment Requires Authentication"

**Cause**: 3D Secure authentication required

**Fix**:
- This is normal for some cards
- Follow the authentication prompts
- Use test card 4000 0027 6000 3184 to test this flow

### Issue: "Card Declined"

**Cause**: Various reasons (insufficient funds, etc.)

**Fix**:
- In test mode: Use correct test cards
- In live mode: Ask customer to contact their bank
- Check Stripe Dashboard for specific decline reason

---

## Webhooks (Advanced)

Webhooks allow Stripe to notify your app of events (payment succeeded, refund issued, etc.).

### Setup Webhooks

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **"Add endpoint"**
3. Enter URL: `https://60h5imcl10zo.manus.space/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** (starts with `whsec_`)

### Implement Webhook Handler

Add to `/home/ubuntu/kos_taxi_backend/src/routes/ride.py`:

```python
@ride_bp.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        # Update ride payment status
        ride = Ride.query.filter_by(
            payment_intent_id=payment_intent['id']
        ).first()
        if ride:
            ride.payment_status = 'succeeded'
            db.session.commit()
    
    return jsonify({'success': True}), 200
```

---

## Additional Resources

### Stripe Documentation
- **Main Docs**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Payment Intents**: https://stripe.com/docs/payments/payment-intents
- **Testing**: https://stripe.com/docs/testing

### Support
- **Stripe Support**: https://support.stripe.com
- **Community**: https://stripe.com/community

### Your Application
- **Live App**: https://60h5imcl10zo.manus.space
- **Documentation**: See `KOS_TAXI_DOCUMENTATION.md`

---

## Checklist

Use this checklist to ensure proper setup:

### Test Mode Setup
- [ ] Created Stripe account
- [ ] Obtained test API keys
- [ ] Configured backend with secret key
- [ ] Configured frontend with publishable key
- [ ] Rebuilt and deployed application
- [ ] Tested payment with test card
- [ ] Verified payment in Stripe Dashboard

### Production Setup
- [ ] Completed business information
- [ ] Added bank account
- [ ] Verified identity
- [ ] Switched to live mode
- [ ] Updated API keys to live keys
- [ ] Tested with real card (small amount)
- [ ] Set up webhooks (optional)
- [ ] Configured payout schedule

---

## Summary

Your Kos Taxi application is **ready for Stripe payments**. The integration is complete and functional. You just need to:

1. **Get your API keys** from Stripe
2. **Add them to your application** (backend + frontend)
3. **Rebuild and deploy**
4. **Start accepting payments!**

For test mode, you can start immediately. For live mode, complete Stripe's verification process first.

---

**Questions?** Refer to the full documentation in `KOS_TAXI_DOCUMENTATION.md` or visit Stripe's support resources.

**Ready to accept payments!** 💳✨
