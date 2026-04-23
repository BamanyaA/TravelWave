# Security Specification

## 1. Data Invariants
- A user profile (`/users/{userId}`) can only be created by the owner and must match their `request.auth.uid`.
- An application (`/applications/{appId}`) must have a `userId` matching the authenticated user's UID.
- Only admins or the owner of an application can read it.
- Only admins can update the `status` of an application.
- Payments (`/payments/{paymentId}`) must link to a valid application.
- Role-based access is controlled via the `/admins/{userId}` collection.

## 2. The Dirty Dozen Payloads (Target: DENY)
1. **Identity Spoofing**: User `A` tries to create a profile at `/users/B`.
2. **Privilege Escalation**: User `A` tries to set `role: 'admin'` in their profile.
3. **Application Theft**: User `B` tries to read User `A`'s application.
4. **Unauthorized Update**: User `A` tries to set their application status to `approved`.
5. **Ghost Field Injection**: User `A` tries to add a `isVerified: true` field to an application.
6. **ID Poisoning**: User `A` tries to create an application with a 2KB document ID.
7. **PII Leak**: Guest user tries to `list` all users to get emails.
8. **Orphaned Application**: User `A` creates an application without a `userId`.
9. **Relational Sync Bypass**: User `A` tries to confirm a payment for User `B`'s application.
10. **Immutable Field Tampering**: User `A` tries to change the `createdAt` timestamp.
11. **Client-Side Fake Admin**: User `A` tries to access `/admins/{userId}` without being one.
12. **Status Shortcutting**: User `A` tries to skip from `pending` to `approved` without admin action.

## 3. Test Runner (Conceptual)
Tests will be implemented in `firestore.rules.test.ts` using the Firebase Emulator SDK.
