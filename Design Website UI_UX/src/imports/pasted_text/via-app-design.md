# 🎨 Figma AI Design Prompt for "Via" Application

---

## **Project Overview**
Design a clean, minimal, and modern multi-service platform called **"Via"** - a location-based service marketplace for housing, grocery, and transport. The design should follow Pathao.com's aesthetic principles with a focus on simplicity, bold colors, and intuitive user flows.

---

## **🎨 Design System**

### **Color Palette**
- **Primary Green:** `#4DBE55` (Main brand color, CTAs, success states)
- **Light Green:** `#79ED91` (Accents, highlights, hover states)
- **Slate Gray:** `#71776D` (Secondary text, borders)
- **Muted Green:** `#698696` (Tertiary elements, backgrounds)
- **Light Gray:** `#BEBEBE` (Disabled states, dividers)
- **White:** `#FFFFFF` (Backgrounds, cards)
- **Black/Dark:** `#1A1A1A` (Primary text, headings)

### **Typography**
- **Font Family:** Inter or Poppins (Modern, clean, highly readable)
- **Headings:** Bold (700) - H1: 32px, H2: 24px, H3: 20px
- **Body:** Regular (400) - 16px
- **Small Text:** 14px
- **Caption:** 12px

### **Design Principles**
- **Minimal & Clean:** Generous whitespace, no clutter
- **Card-Based Layout:** Rounded corners (12-16px radius)
- **Bold CTAs:** High contrast, prominent placement
- **Mobile-First:** Responsive design starting from 375px width
- **Consistent Spacing:** 8px grid system (8, 16, 24, 32, 48, 64px)
- **Subtle Shadows:** Soft elevation for cards and modals

---

## **📱 Core Pages & Features to Design**

### **1. Landing Page / Home**
**Elements:**
- Clean hero section with app value proposition
- Three main service cards (Housing, Grocery, Transport) with icons
- Featured listings preview
- How it works section (3-4 steps)
- Download app CTA section
- Footer with links

**Layout:** Full-width hero, grid layout for services, card carousel for listings

---

### **2. Authentication Pages**

**A. Login/Signup Page**
- Tab toggle: Login | Register
- Email/Phone input field
- Password input with show/hide toggle
- Role selection dropdown (Resident, Landlord, Seller, Driver, Admin)
- Social login buttons (Google, Facebook)
- "Forgot Password" link
- Primary CTA button in `#4DBE55`

**B. Role-Specific Onboarding**
- Progressive form based on selected role
- Phone verification step
- Profile completion progress bar

---

### **3. Dashboard (Role-Based)**

**A. Resident Dashboard**
- Welcome message with user name
- Quick action buttons (Search Housing, Order Grocery, Book Transport)
- Recent activity feed
- Saved listings section
- Active orders/bookings status cards
- AI Chatbot floating action button (bottom-right)

**B. Landlord Dashboard**
- Property listing stats (Total, Active, Pending)
- "Add New Listing" prominent CTA
- Recent visit requests
- Claimed listings management
- Revenue/ledger overview

**C. Seller Dashboard**
- Sales overview cards (Today, This Week, This Month)
- Inventory quick view
- "Upload Price List" (OCR feature) button
- Pending orders notification
- Virtual ledger balance display

**D. Driver Dashboard**
- Today's earnings card
- Active/completed rides counter
- "Go Online/Offline" toggle
- Upcoming ride requests
- Rating display

**E. Admin Dashboard**
- Platform analytics (users, listings, orders, revenue)
- Pending verification queue
- System health indicators
- Recent activity log
- Quick actions (Verify, Approve, Reject)

---

### **4. Housing/Rental Module**

**A. Property Listing Page**
- Search bar with filters (location, budget, type)
- Filter chips: Bachelor/Family, Furnished, Block area
- Grid/List view toggle
- Property cards showing:
  - Image carousel (3-4 images)
  - Price (bold, prominent)
  - Title & location
  - Tags (Bachelor allowed, Attached bath, etc.)
  - "Claimed" badge if applicable
  - Save/Wishlist heart icon
- Map view toggle (Leaflet map integration)
- Pagination or infinite scroll

**B. Property Detail Page**
- Image gallery (main image + thumbnails)
- Price header with CTA buttons (Contact, Request Visit)
- Property details grid:
  - Rent, Deposit, Area
  - Room type, Floor, Facilities
  - Location map embed
- Landlord info card (name, verified badge, contact)
- "Claim This Listing" button (if unclaimed)
- Similar listings carousel

**C. Add/Edit Listing (Landlord)**
- Multi-step form:
  1. Basic info (title, description, rent, deposit)
  2. Property details (area, rooms, floor, type)
  3. Facilities checklist
  4. Image upload (drag & drop)
  5. Location picker (map)
- Progress indicator
- Preview before publish
- Save as draft option

---

### **5. Grocery Module**

**A. Grocery Browse Page**
- Category tabs (Rice, Vegetables, Meat, Dairy, etc.)
- Search bar with voice input icon
- Product grid cards:
  - Product image
  - Name & unit (e.g., "Miniket Rice - 1kg")
  - Price comparison (showing multiple sellers)
  - "Add to Cart" button
  - Seller badge
- Price range filter
- Sort options (Price: Low-High, Distance, Rating)

**B. Product Detail Modal/Page**
- Product image
- Name & description
- Price comparison table (Seller | Price | Distance | Action)
- Unit selector (if applicable)
- Quantity stepper
- Add to cart CTA
- Seller info & ratings

**C. Shopping Cart Page**
- Cart items list with:
  - Product image, name, unit
  - Seller name
  - Quantity stepper
  - Price
  - Remove button
- Cart summary card:
  - Subtotal
  - Delivery fee (calculated)
  - **Optimization suggestion banner:** "Split order to save ৳120" or "Buy all from Seller A to save on delivery"
  - Total (bold, large)
- Checkout button
- Continue shopping link

**D. Recipe-to-Cart Feature**
- Recipe search/input field
- Voice input: "Kala Bhuna banabo"
- Recipe card display:
  - Recipe name & image
  - Ingredient list with quantities
  - "Add All to Cart" button
  - Individual ingredient add buttons
- Auto-populated cart with optimization

**E. OCR Price List Upload (Seller)**
- Upload area (drag & drop or camera)
- Preview of uploaded image
- OCR extraction results in editable table:
  - Item name | Price | Unit | Confidence score
- Manual correction fields
- "Verify & Save" button
- Success confirmation

---

### **6. Transport Booking Module**

**A. Transport Booking Page**
- Map view (Leaflet) with pickup/drop-off pins
- Location input fields (autocomplete)
- Vehicle type selector (cards):
  - Auto-rickshaw
  - CNG
  - EV
  - Bike
- Fare estimate card:
  - Distance & time
  - Price range
  - "Book Now" CTA
- Recent destinations quick select

**B. Booking Confirmation Page**
- Booking details card:
  - Pickup & drop-off locations
  - Vehicle type
  - Estimated fare
  - Driver assignment status
- Live tracking map (if driver assigned)
- Driver info card (name, rating, vehicle number)
- Contact driver button
- Cancel booking option

**C. Ride History Page**
- List of past rides
- Each ride card:
  - Date & time
  - Route (pickup → drop-off)
  - Fare paid
  - Rating given
  - "Book Again" button

---

### **7. Checkout & Payment Flow**

**A. Order Review Page**
- Order summary:
  - Items from multiple sellers (grouped)
  - Subtotal per seller
  - Delivery fees breakdown
  - **Virtual Ledger explanation:** "Single payment, distributed to sellers"
  - Grand total (prominent)
- Delivery address selector
- Payment method selector:
  - bKash (sandbox)
  - Cash on Delivery
  - Mock payment
- **Idempotency note:** "Secure payment processing"
- Place Order button

**B. Payment Success Page**
- Success animation (checkmark in `#4DBE55`)
- Order confirmation number
- Order summary
- Estimated delivery time
- Track order button
- Continue shopping button

**C. Virtual Ledger View (User)**
- Transaction history
- Payment breakdown:
  - Seller A: ৳XXX
  - Seller B: ৳XXX
  - Platform fee: ৳XX
- Download receipt option

---

### **8. AI Chatbot Interface**

**Design Elements:**
- Floating action button (bottom-right, `#4DBE55`)
- Chat modal/drawer:
  - Header: "Via Assistant" with close button
  - Chat history area (user messages right, bot left)
  - Quick action chips: "Find housing", "Order groceries", "Book transport"
  - Input field with send button
  - Voice input toggle
- Suggested responses based on context
- Typing indicator
- Graceful fallback message if AI is slow

---

### **9. Admin Panel**

**A. Admin Dashboard**
- KPI cards (4-column grid):
  - Total Users
  - Active Listings
  - Orders Today
  - Revenue (Virtual Ledger)
- Recent activity table
- Pending verification queue cards
- System status indicators

**B. User Management Page**
- Searchable user table
- Filters (role, status, date)
- User cards/rows with:
  - Name, email, phone
  - Role badge
  - Status (Active/Inactive)
  - Actions (Edit, Suspend, Verify)

**C. Listing Verification Queue**
- Pending listings grid
- Each card:
  - Preview images
  - Details summary
  - Landlord info
  - **Approve/Reject buttons**
  - Edit suggestion option

**D. Ledger Management**
- Virtual ledger overview
- Seller balance table
- Transaction history
- Withdrawal request queue
- Export reports button

---

### **10. Profile & Settings**

**A. User Profile Page**
- Profile header with avatar
- Personal info section (editable)
- Saved addresses
- Payment methods
- Notification preferences toggle
- Language selector

**B. Settings Page**
- Account settings
- Privacy settings
- App preferences
- Help & Support
- Logout button (red)

---

## **🎯 Component Library to Create**

### **Buttons**
- **Primary:** `#4DBE55` background, white text, rounded (8px)
- **Secondary:** White background, `#4DBE55` border & text
- **Ghost:** Transparent, `#4DBE55` text
- **Disabled:** `#BEBEBE` background
- **Sizes:** Small (32px), Medium (40px), Large (48px)

### **Input Fields**
- Default state: Gray border `#BEBEBE`
- Focus state: Green border `#4DBE55`
- Error state: Red border
- Placeholder text: `#71776D`
- Icons: Left-aligned (search, location, etc.)

### **Cards**
- **Property Card:** Image top, content below, shadow-sm
- **Product Card:** Square image, price bold, add button
- **Service Card:** Icon + title + description, hover lift effect
- **Stats Card:** Number large, label small, icon accent

### **Badges & Tags**
- **Role Badge:** Colored background (different per role)
- **Status Badge:** Green (Active), Yellow (Pending), Red (Rejected)
- **Feature Tags:** Light green background `#79ED91`, dark text

### **Navigation**
- **Top Navbar:** Logo (Via), Nav links, User menu, Cart icon
- **Side Nav (Dashboard):** Icons + labels, active state highlight
- **Bottom Nav (Mobile):** Home, Search, Cart, Profile

### **Modals & Overlays**
- Centered modal with backdrop blur
- Close button (X) top-right
- Header, content, footer sections
- Max-width: 600px

### **Loading States**
- Skeleton screens for cards
- Spinner for buttons (`#4DBE55`)
- Progress bars for multi-step forms

### **Empty States**
- Illustration + text + CTA
- Examples: Empty cart, no listings, no orders

---

## **📐 Responsive Breakpoints**

- **Mobile:** 375px - 767px (Single column, bottom nav)
- **Tablet:** 768px - 1023px (2-column grid, hamburger menu)
- **Desktop:** 1024px - 1439px (3-4 column grid, side nav)
- **Large Desktop:** 1440px+ (Max-width container 1280px)

---

## **✨ Micro-Interactions & Animations**

- **Hover Effects:** 
  - Cards lift 4px with shadow increase
  - Buttons darken 10%
  - Images scale 1.05x
- **Transitions:** 200-300ms ease-in-out
- **Loading:** Smooth skeleton shimmer
- **Success:** Checkmark animation with green pulse
- **Page Transitions:** Fade-in 150ms

---

## **🎨 Figma-Specific Instructions**

1. **Create Design Tokens:**
   - Colors (Primary, Secondary, Semantic)
   - Typography scale
   - Spacing system (8px grid)
   - Border radius tokens
   - Shadow presets

2. **Component Variants:**
   - Button states (Default, Hover, Active, Disabled)
   - Input states (Default, Focus, Error, Disabled)
   - Card sizes (Small, Medium, Large)

3. **Auto-Layout:**
   - Use for all cards, lists, buttons
   - Set padding and spacing consistently
   - Enable responsive resizing

4. **Constraints:**
   - Mobile-first constraints
   - Horizontal scaling for desktop

5. **Prototyping:**
   - Link key user flows:
     - Login → Dashboard → Browse → Cart → Checkout → Success
     - Add Listing flow
     - Transport booking flow
   - Use smart animate for transitions

---

## **📝 Copy & Content Guidelines**

- **Tone:** Friendly, professional, concise
- **CTAs:** Action-oriented ("Book Now", "Add to Cart", "Find Housing")
- **Error Messages:** Helpful, not technical
- **Empty States:** Encouraging with clear next steps

---

## **🎯 Priority Pages for MVP Demo**

**Design these first (must-have for presentation):**
1. Landing Page
2. Login/Signup
3. Resident Dashboard
4. Property Listing + Detail
5. Grocery Browse + Cart
6. Checkout & Payment Success
7. Admin Dashboard
8. AI Chatbot Interface

**Secondary (if time permits):**
9. Seller Dashboard with OCR upload
10. Transport Booking
11. Recipe-to-Cart flow
12. Profile & Settings

---

## **🔗 Inspiration References**

- **Pathao.com:** Clean layout, bold CTAs, service cards
- **Daraz.com.bd:** Product cards, price display, cart flow
- **Airbnb:** Property listings, map integration, filters
- **Instacart:** Grocery browsing, cart optimization UI

---

## **✅ Deliverables Expected from Figma AI**

1. **Complete Design System** (Colors, Typography, Components)
2. **10-12 Key Screens** (Mobile + Desktop versions)
3. **Interactive Prototype** (Main user flows)
4. **Component Library** (Reusable, variant-based)
5. **Style Guide** (Documentation page)

---

**Final Note to Figma AI:**  
Create a cohesive, professional design that balances Pathao's bold, minimal aesthetic with the complex functionality of a multi-service platform. Prioritize clarity and ease of use. Every screen should feel fast, modern, and trustworthy. Use the green color palette strategically to guide user attention to primary actions. Ensure the design is developer-friendly with clear spacing, consistent components, and proper auto-layout implementation.

---

Would you like me to refine any specific section or add more details for particular features?