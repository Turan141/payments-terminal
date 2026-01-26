# Server-Side Implementation Guide

This project currently uses client-side mocks for payment processing. This guide outlines the necessary steps to implement a real server-side backend for the payment terminal.

## 1. Environment Configuration

Create a `.env.local` (or update `.env`) with necessary secrets. Do not commit this file to version control.

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/payments_db"

# Payment Gateway (Example: Stripe, Adyen, etc.)
PAYMENT_GATEWAY_API_KEY="sk_test_..."
PAYMENT_GATEWAY_webhook_SECRET="whsec_..."

# OCR Service (Existing)
NEXT_PUBLIC_OCR_API_URL="https://demo.vibo.tips/api/terminal/bill/recognize"
# Note: The current frontend uses a hardcoded key for the demo OCR.
# Move this to a server-side route proxy if possible to hide the key.
OCR_API_KEY="56d3b2c2f25b74b2229c625c2904b3ac99345c0f049ca23e4cc18df52d7"
```

## 2. Database Schema (Prisma Example)

We need to store transaction attempts and their statuses.

```prisma
model Transaction {
  id            String   @id @default(cuid())
  amount        Decimal
  currency      String   @default("EUR")
  recipient     String
  status        String   // "PENDING", "SUCCESS", "FAILED"
  paymentMethod String   // "CARD", "APPLE_PAY", "GOOGLE_PAY"

  // For card payments (Do NOT store full card numbers)
  maskedCard    String?  // "**** **** **** 1234"
  cardBrand     String?  // "VISA", "MASTERCARD"

  // Audit
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  gatewayRef    String?  // Reference ID from payment provider
}
```

## 3. required API Endpoints

Create the following API routes in `app/api/`.

### A. Process Card Payment

**Route:** `POST /api/pay/card`

**Request Body:**

```json
{
	"amount": "10.00",
	"recipient": "Coffee Shop",
	"cardNumber": "1234567812345678",
	"expiry": "12/25",
	"cvv": "123"
}
```

**Responsibilities:**

1.  Validate input data (Luhn algorithm for generic card check).
2.  **Security:** Never log full card details.
3.  Interact with the Payment Gateway.
4.  Save `Transaction` record with status.
5.  Return success/failure response.

**Response Success:**

```json
{
	"success": true,
	"transactionId": "txn_123abc",
	"redirectUrl": "/status?result=success&txn=txn_123abc"
}
```

### B. Process Wallet Payment (Simulated/Tokenized)

**Route:** `POST /api/pay/wallet`

**Request Body:**

```json
{
  "amount": "10.00",
  "recipient": "Merchant",
  "walletType": "google_pay" | "apple_pay",
  "token": "payment_token_from_provider"
}
```

### C. Check Transaction Status (Optional but recommended)

**Route:** `GET /api/transaction/[id]`

Used by the status page to verify the payment actually happened, rather than just trusting URL parameters.

## 4. Frontend Integration

Once the APIs are ready, update `app/pay/page.tsx`:

1.  **Remove `handlePay` mock:**
    Replace the `setTimeout` simulation with a real `fetch` call.

    ```typescript
    const handlePay = async (e: React.FormEvent) => {
    	e.preventDefault()
    	if (!validate()) return
    	setIsProcessing(true)

    	try {
    		const res = await fetch("/api/pay/card", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({ ...formData, amount, recipient })
    		})

    		const data = await res.json()
    		if (data.success) {
    			router.push(
    				`/status?result=success&amount=${amount}&recipient=${recipient}&ref=${data.transactionId}`
    			)
    		} else {
    			throw new Error(data.message || "Payment failed")
    		}
    	} catch (error) {
    		// Handle error state
    		router.push(`/status?result=failed&amount=${amount}&recipient=${recipient}`)
    	}
    }
    ```

2.  **Update `app/status/page.tsx`:**
    - Ideally, fetch the transaction status from the server using the `ref` (transaction ID) from the URL to confirm validity, instead of relying purely on URL params.

## 5. Security & Compliance Notes

- **PCI-DSS:** If you are handling raw card numbers (PAN), you must be PCI compliant.
  - _Recommendation:_ Use a Payment Gateway's "Elements" or "Tokenizer" (like Stripe.js) on the frontend so raw card data never touches your server.
  - If using tokenizer, `app/pay/page.tsx` will send a `paymentMethodId` instead of `cardNumber` to your backend.
- **Validation:** Sanitize all inputs on the server side.
