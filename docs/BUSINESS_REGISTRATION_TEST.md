# Business Registration Flow - Manual Test Guide

## Test Scenario: Register as Business User

### Prerequisites
- App running on device/emulator
- Firebase configured
- No existing account with test email

### Test Steps

#### Step 1: Basic Information
1. Open registration screen
2. Fill in all fields:
   - First Name: "Juan"
   - Last Name: "Perez"
   - Email: "juan.perez.business@test.com"
   - Phone: "04121234567" (valid Venezuelan format)
   - Date of Birth: Select any date
   - Password: "Test123456"
   - Confirm Password: "Test123456"
   - Accept Terms: Check the box
3. Click "Continuar"

**Expected:**
- Button should be enabled when all fields are valid
- Should navigate to Step 2

#### Step 2: User Type Selection
1. Select "Negocio" option
2. Click "Continuar"

**Expected:**
- "Negocio" card should be highlighted
- Should navigate to Step 3 (Business Info)
- Progress bar should show 3/4

#### Step 3: Business Information
1. Fill in business details:
   - Business Name: "Panadería La Esquina"
   - Category: Select "Panadería"
   - Description: "Panadería artesanal con productos frescos" (optional)
   - Address: "Av. Principal, Centro Comercial La Plaza, Local 5"
   - Phone: "04141234567"
2. Click "Continuar"

**Expected:**
- Button should be enabled when required fields are filled
- Should navigate to Step 4 (Confirmation)
- Progress bar should show 4/4

#### Step 4: Confirmation
1. Review all information displayed
2. Click "Crear Cuenta"

**Expected:**
- Loading indicator should appear
- Console logs should show:
  - "Creating business profile during registration..."
  - "Business profile created: [business-id]"

### Expected Database State

After successful registration, verify in Firebase Console:

#### Users Collection
Document ID: `[generated-user-uid]`
```json
{
  "id": "[user-uid]",
  "firstName": "Juan",
  "lastName": "Perez",
  "email": "juan.perez.business@test.com",
  "phone": "+5804121234567",
  "dateOfBirth": "[selected-date]",
  "isActive": true,
  "userTypes": {
    "client": {
      "status": "active",
      "createdAt": "[timestamp]"
    },
    "business": {
      "status": "active",
      "createdAt": "[timestamp]"
    }
  },
  "currentUserType": "business",
  "currentBusinessId": "[business-id]",
  "currentBranchId": null,
  "preferences": {
    "language": "es",
    "currency": "USD",
    "notifications": {
      "orders": true,
      "promotions": false,
      "email": true
    }
  },
  "createdAt": "[timestamp]"
}
```

#### Businesses Collection
Document ID: `[generated-business-id]`
```json
{
  "id": "[business-id]",
  "businessName": "Panadería La Esquina",
  "category": "bakery",
  "description": "Panadería artesanal con productos frescos",
  "address": "Av. Principal, Centro Comercial La Plaza, Local 5",
  "phone": "04141234567",
  "logoUrl": null,
  "bannerUrl": null,
  "ownerId": "[user-uid]",
  "isActive": true,
  "isVerified": false,
  "followersCount": 0,
  "rating": 0,
  "reviewsCount": 0,
  "createdAt": "[timestamp]",
  "updatedAt": "[timestamp]"
}
```

### Common Issues & Debugging

#### Issue: Button not enabling on Step 1
- Check phone format: Must be 04XX XXXXXXX (Venezuelan mobile)
- Check passwords match
- Check all fields have values
- Check terms accepted

#### Issue: Business creation fails
- Check Firebase rules allow write to businesses collection
- Check userId is passed correctly in params
- Check console for error messages

#### Issue: currentBusinessId not set
- Verify PUT /users/profile endpoint is called
- Check users.js has put_profile method
- Verify no errors in console

### Success Criteria

- [ ] User can complete all 4 steps
- [ ] User document created in Firebase with correct data
- [ ] Business document created in Firebase with correct data
- [ ] User's currentBusinessId matches created business ID
- [ ] Both client and business userTypes are active
- [ ] No console errors during registration
- [ ] User is logged in after registration
- [ ] User can access business features

## Implementation Details

### Flow Overview
1. `RegistrationForm.jsx` - UI component with 4 steps
2. `use-registration.js` - Hook managing form state and validation
3. `BusinessOnboardingStep.jsx` - Step 3 component for business data
4. `auth-service.js` - Creates user, then business, then updates user with businessId
5. `businesses/resource.js` - Handles business creation in Firebase
6. `users.js` - Handles user creation and updates

### API Calls Sequence
1. POST /users - Create user document
2. POST /businesses - Create business profile (if selectedUserType === 'business')
3. PUT /users/profile - Update user with currentBusinessId
