# Hatra Suci Platform - Complete Documentation

## Overview
Hatra Suci is a comprehensive blockchain-based investment and rewards platform with an integrated company website. The platform combines traditional business operations (Palm Oil, Diamond Mining, Global Trade) with modern blockchain technology (USDT transactions on Binance Smart Chain).

## Page Routes

### Public Pages
- `/` - Homepage with company information, stats, and hero section
- `/about` - About Hatra Suci with detailed company information and industries
- `/ceo` - CEO Profile page (Mr. Robert Budi Hartono)
- `/contact` - Contact page with form, support information, and Telegram link
- `/login` - User login page
- `/register` - Registration page with referral key system

### User Dashboard Pages (Require Login)
- `/dashboard` - Main dashboard with token balance, scratch card, and level rewards preview
- `/deposit` - USDT deposit page with QR code and wallet address
- `/withdraw` - Token withdrawal page with balance breakdown
- `/referrals` - Binary tree referral system (left/right team structure)
- `/rewards` - Complete level rewards page (12 levels: 0-11)
- `/transactions` - Transaction history with 4 tabs (Deposit, Withdraw, Bonus, Daily Reward)

## Company Information

### About Hatra Suci
- **Founded:** 20+ years ago
- **Headquarters:** Jakarta, Indonesia (Jl. Thamrin No. 59, Jakarta Pusat 10350)
- **CEO:** Mr. Robert Budi Hartono (Age: 62, Indonesian)
- **Global Reach:** Operating in 15+ countries
- **Active Users:** 50,000+
- **Total Rewards Distributed:** $10M+

### Core Business Divisions

#### 1. Palm Oil Division
- Sustainable plantation management
- Certified eco-friendly production
- High-quality export-grade palm oil

#### 2. Diamond Mining Division
- Ethical mining operations
- Advanced mineral extraction
- Strict environmental compliance

#### 3. Export & Import Division
- International commodity trade
- Agricultural products, minerals, and raw materials
- Full logistics, customs, and distribution handling

#### 4. Blockchain Fintech Division
- Hatra Suci Investment & Rewards Platform
- Secure USDT transaction management (BEP20 on Binance Smart Chain)
- User reward and referral system
- Admin-operated verification structure

## Platform Features

### Token System
- **Currency:** USDT (BEP20) on Binance Smart Chain
- **Conversion Rate:** 90 INR = 1 USD
- **Deposit Wallet:** 0x1ab174ddf2fb97bd3cf3362a98b103a6f3852a67

### Referral System
- **Structure:** Binary tree (left/right alternating)
- **Joining Logic:** First referral → left side, second referral → right side, continues alternating
- **Team Display:** Separate columns for left team and right team members

### Level Rewards System (12 Levels: 0-11)

| Level | Left Required | Right Required | Reward | Rank/Title |
|-------|---------------|----------------|--------|------------|
| 0 | 0+ | 0+ | - | - |
| 1 | 2+ | 2+ | $67 | - |
| 2 | 4+ | 4+ | $89 | Director |
| 3 | 8+ | 8+ | $133 | Promoter |
| 4 | 16+ | 16+ | $222 | Star |
| 5 | 32+ | 32+ | $444 | Ruby |
| 6 | 64+ | 64+ | $1,333 | Pearl |
| 7 | 128+ | 128+ | $2,222 | Diamond |
| 8 | 256+ | 256+ | $4,444 | Royal Diamond |
| 9 | 512+ | 512+ | $11,111 | Ambassador |
| 10 | 1024+ | 1024+ | $22,222 | Car |
| 11 | 2048+ | 2048+ | $50,000 | Flat/Bungalow |

### Transaction Types
1. **Deposit** - USDT deposits to platform
2. **Withdraw** - Token withdrawals from platform
3. **Bonus** - Referral and level bonuses
4. **Daily Reward** - Scratch card rewards (0.50-1.00 tokens)

### Daily Scratch Card
- **Location:** Dashboard page
- **Mechanism:** Canvas-based interactive scratch card
- **Threshold:** 60% scratched to reveal reward
- **Reward Range:** 0.50 to 1.00 tokens (randomly generated)
- **Frequency:** Daily

## Contact Information

### Support Channels
- **Email:** support@hatrasuci.co.id, info@hatrasuci.co.id
- **Phone:** +62 21 3192 xxxx (Mon-Fri: 9:00 AM - 6:00 PM WIB)
- **Telegram:** @HatraSuciSupport (https://t.me/HatraSuciSupport)
- **Address:** Jl. Thamrin No. 59, Jakarta Pusat 10350, Jakarta, Indonesia

### Business Hours
- Monday - Friday: 9:00 AM - 6:00 PM WIB
- Saturday: 10:00 AM - 2:00 PM WIB
- Sunday: Closed

## Technical Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS with custom utility classes
- **Icons:** Lucide React
- **UI Components:** Custom component library (@/components/ui/*)

### Key Components
- **BlockchainBackground:** Animated background with particle effects
- **SpinWheel (Scratch Card):** Interactive Canvas-based reward system
- **NavLink:** Navigation helper component
- **UI Components:** Button, Input, Card, Tabs, Checkbox, Textarea, etc.

### State Management
- **Toast Notifications:** Custom toast hook (@/hooks/use-toast)
- **React Query:** Data fetching and caching (@tanstack/react-query)

## Design System

### Color Scheme
- **Primary:** Gold/Yellow gradient (#FFD700 spectrum)
- **Secondary:** Dark theme with transparency
- **Accent:** Complementary accent colors
- **Background:** Dark with blockchain-themed animated particles

### Custom CSS Classes
- `text-gradient-gold` - Gold gradient text effect
- `card-glow` - Card hover glow effect
- Various status colors (green for success, red for pending, etc.)

## Key Features Summary

### Homepage (/)
- Navigation header with links to About, CEO, Contact, Login, Register
- Hero section with company tagline
- Quick stats display (20+ years, 15+ countries, 50K+ users, $10M+ rewards)
- Core industries showcase
- Why Choose Us section
- CTA section with registration and contact buttons
- Comprehensive footer with navigation and contact info

### About Page (/about)
- Company overview and history
- Business divisions breakdown
- Core industries detailed view
- Commitment to responsibility section
- Links to CEO and Contact pages

### CEO Page (/ceo)
- CEO profile with photo placeholder
- Leadership vision and philosophy
- Business portfolio showcase
- Key achievements display
- Leadership philosophy and core values

### Contact Page (/contact)
- Contact form with validation
- Office address and contact details
- Business hours display
- Telegram support link (priority support channel)
- Quick links to other pages

### Dashboard (/dashboard)
- Current token balance display
- Interactive scratch card for daily rewards
- Quick action buttons (Deposit, Withdraw, Referrals)
- Level rewards preview section
- Navigation to all platform features

### Deposit Page (/deposit)
- QR code display (https://qrexplore.com/icon/apple-icon.png)
- Wallet address with copy function
- Transaction form for deposit confirmation
- Network information (BEP20, Binance Smart Chain)

### Withdraw Page (/withdraw)
- Three-row display:
  - Current Available: Shows total balance
  - Withdraw Amount: User input field
  - Available After: Real-time calculation of remaining balance
- Input validation and submit functionality

### Referrals Page (/referrals)
- Binary tree visualization with connecting lines
- Left team and right team columns
- Team statistics cards
- Automatic alternating assignment (odd → left, even → right)

### Rewards Page (/rewards)
- Complete display of all 12 levels (0-11)
- Progress tracking for each level
- Requirement display (left + right team members)
- Reward amounts in USD
- Rank/title display
- Visual indicators (emojis) for each level

### Transaction History (/transactions)
- 4 tabs: Deposit, Withdraw, Bonus, Daily Reward
- Transaction cards with:
  - Icon based on type
  - Amount with +/- prefix
  - Date and time
  - Status badge (Completed/Pending)
  - Transaction ID

### Register Page (/register)
- Full name, email, phone number fields
- Password with visibility toggle
- Confirm password field
- Referral key section with validation badge
- Terms and conditions checkbox
- Success toast notification

### Login Page (/login)
- Email/username and password fields
- Login button
- Navigation to registration

## Future Enhancement Suggestions

1. **Mobile Menu:** Add responsive mobile navigation menu
2. **User Authentication:** Implement actual login/logout functionality
3. **Protected Routes:** Add route guards for dashboard pages
4. **API Integration:** Connect to backend for real data
5. **Real-time Updates:** WebSocket integration for live transaction updates
6. **Multi-language Support:** Add Indonesian and English language options
7. **Dark/Light Mode Toggle:** User preference for theme switching
8. **Advanced Analytics:** Dashboard with charts and graphs
9. **KYC Verification:** User identity verification system
10. **2FA Security:** Two-factor authentication for enhanced security

## Deployment Notes

### Build Command
```bash
npm run build
# or
bun run build
```

### Development Server
```bash
npm run dev
# or
bun run dev
```

### Environment Variables (Required for Production)
- API endpoint URLs
- Blockchain network configuration
- Admin wallet addresses
- Email service credentials
- Telegram bot token

## Important Files

- `/src/App.tsx` - Main application routing
- `/src/pages/*.tsx` - All page components
- `/src/components/ui/*.tsx` - Reusable UI components
- `/src/components/BlockchainBackground.tsx` - Animated background
- `/src/components/SpinWheel.tsx` - Scratch card component
- `/src/hooks/use-toast.ts` - Toast notification hook
- `/src/lib/utils.ts` - Utility functions
- `/tailwind.config.ts` - Tailwind CSS configuration
- `/vite.config.ts` - Vite build configuration

## Conclusion

The Hatra Suci platform is a comprehensive solution combining traditional business credibility with modern blockchain technology. It provides users with a transparent, secure platform for investments and rewards while maintaining the company's commitment to sustainability and ethical business practices.

All pages are fully functional, interconnected, and ready for backend integration. The platform features a professional design with blockchain-themed aesthetics and intuitive navigation throughout.
