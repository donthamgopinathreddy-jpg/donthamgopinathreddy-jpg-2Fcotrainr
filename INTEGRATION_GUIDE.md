# Integration Guide: Adding Biometric Settings to Profile Page

## Quick Start

To add biometric authentication settings to your profile page, follow these steps:

### 1. Import the BiometricSettings Component

Add this import to your profile page (e.g., `client/pages/Profile.tsx`):

```typescript
import BiometricSettings from "@/components/BiometricSettings";
```

### 2. Add Component to Security Section

In your profile page's security settings section, add the BiometricSettings component:

```tsx
{showSecuritySection && (
  <div className="space-y-6">
    {/* Existing security settings */}
    
    {/* Add Biometric Settings */}
    {userProfile?.id && (
      <>
        <hr className="border-gray-200" />
        <BiometricSettings userId={userProfile.id} />
      </>
    )}
    
    {/* Other settings... */}
  </div>
)}
```

### 3. Complete Example

Here's how it might look in context:

```tsx
import BiometricSettings from "@/components/BiometricSettings";

export default function Profile() {
  const { userProfile } = useAuth();
  const [showSecuritySection, setShowSecuritySection] = useState(false);

  return (
    <div className="space-y-6">
      {/* Other profile sections */}

      {/* Security Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => setShowSecuritySection(!showSecuritySection)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-900">Security</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              showSecuritySection ? "rotate-180" : ""
            }`}
          />
        </button>

        {showSecuritySection && (
          <div className="px-6 py-4 border-t border-gray-200 space-y-6">
            {/* Existing security settings */}

            {/* Biometric Settings */}
            {userProfile?.id && (
              <>
                <hr className="border-gray-200" />
                <BiometricSettings userId={userProfile.id} />
              </>
            )}

            {/* Other settings... */}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Component Features

The `BiometricSettings` component provides:

- ✅ **Auto-detection**: Automatically detects available biometric methods
- ✅ **Toggle**: Easy enable/disable toggle switch
- ✅ **Status**: Shows current biometric status
- ✅ **Device Info**: Displays what biometric type is available
- ✅ **Security Info**: Educates users about how biometric works
- ✅ **Error Handling**: Shows error messages if something goes wrong
- ✅ **Loading States**: Handles loading and checking states

## Component Props

```typescript
interface BiometricSettingsProps {
  userId: string;  // Required: The user's ID from Supabase auth
}
```

## Styling

The component uses Tailwind CSS classes and is styled to match:
- CoTrainr design system
- Existing profile page styling
- Light and dark mode support

## Browser/Device Support

| Platform | Status | Notes |
|----------|--------|-------|
| iOS App | ✅ Full | Face ID / Touch ID |
| Android App | ✅ Full | Fingerprint / Face |
| Web (Chrome) | ⚠️ Limited | Simulated for testing |
| Web (Safari) | ⚠️ Limited | Simulated for testing |

## User Flow

1. User opens Profile → Security section
2. User sees "Biometric Settings" option
3. User sees toggle switch
4. User can enable/disable biometric authentication
5. Settings are saved to database automatically

## API Integration

The component automatically:

1. **Detects** available biometric methods via `useBiometricAuth` hook
2. **Checks** if biometric is enabled for user via Supabase query
3. **Enables** biometric by updating `user_security_settings` table
4. **Disables** biometric by updating database
5. **Shows** success/error messages using `toast` notifications

## Database Requirements

The component requires the `user_security_settings` table with:

```sql
CREATE TABLE user_security_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  biometric_type VARCHAR(50) DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

## Customization

You can customize the component by:

1. **Styling**: Modify Tailwind classes in the component
2. **Text**: Change the label text and descriptions
3. **Icons**: Use different lucide-react icons
4. **Behavior**: Modify the toggle handler function

Example customization:

```tsx
// Custom styling
<BiometricSettings userId={userProfile.id} />

// Or wrap with custom styling
<div className="bg-gradient-to-r from-blue-50 to-purple-50">
  <BiometricSettings userId={userProfile.id} />
</div>
```

## Troubleshooting

### Component not showing

- Ensure `userId` prop is passed correctly
- Check if `user_security_settings` table exists in database
- Verify RLS policies allow user to access their own settings

### Biometric option not appearing

- Check if device actually supports biometric
- Verify `useBiometricAuth` hook is detecting correctly
- Test on actual device (not web browser)

### Toggle not working

- Check browser console for errors
- Verify Supabase connection
- Check RLS policies on database
- Ensure user is properly authenticated

## Next Steps

1. ✅ Add component to your profile page
2. ⏳ Test the toggle functionality
3. ⏳ Ensure database is set up correctly
4. ⏳ Test on iOS and Android devices
5. ⏳ Deploy to production

## Additional Resources

- See `BIOMETRIC_AUTH_SETUP.md` for complete setup guide
- Check `client/hooks/useBiometricAuth.ts` for hook documentation
- Review `client/components/BiometricSettings.tsx` for component code

## Questions?

If you have questions about:
- **Integration**: Check this file
- **Setup**: See `BIOMETRIC_AUTH_SETUP.md`
- **Code**: Review the component files
- **Architecture**: Check `BIOMETRIC_IMPLEMENTATION_SUMMARY.md`
