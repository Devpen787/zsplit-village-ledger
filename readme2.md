## ✅ Project Roadmap

### 👤 User Management
- [x] Create users table in Supabase (name, email, wallet_address, role, group_name)
- [x] Display users on `/` (index) page
- [x] Add `InviteUserModal` with role + wallet inputs
- [x] Add `Signup.tsx` page
- [ ] Connect Supabase Auth to signup form
- [ ] Handle duplicate email or wallet edge cases
- [ ] Style and validate form inputs
- [ ] Add edit/delete user functionality (optional: admin-only)

### 💸 Expense Management
- [x] Set up expenses table (id, amount, notes, participants, etc.)
- [x] Add expense detail view (`/expenses/:id`)
- [x] Add new expense form (`/expenses/new`)
- [ ] Add “paid by” and “split between” logic
- [ ] Calculate balance per user
- [ ] Enable deletion of expenses with confirmation
- [ ] Link expenses to user IDs in Supabase

### 🔒 Roles & Permissions
- [ ] Enforce frontend UI for role-based access
- [ ] Store and validate role on page access
- [ ] (Optional) Set up Supabase RLS (Row-Level Security)

### 🔐 Wallet/Web3 Integration
- [x] Add wallet address field to user table
- [ ] Integrate wallet connect component (e.g., RainbowKit or Web3Modal)
- [ ] Sign message on login (optional)
- [ ] Add toggle for wallet visibility (public/private)
- [ ] Tie wallet address to user identity in expenses

### 🧪 Testing & QA
- [ ] Add seed/mock data to Supabase
- [ ] Test full invite → view → expense → balance cycle
- [ ] Test auth/signup flow end-to-end
- [ ] Setup staging preview (e.g., Codesandbox, Vercel)

### 🧭 Navigation & UX
- [ ] Add nav menu with links to `/`, `/signup`, `/expenses`
- [ ] Handle 404s gracefully with `NotFound.tsx`
- [ ] Add onboarding message when no users/expenses yet

### 🛠 Dev Process & Collaboration
- [x] Create shared GitHub checklist (this file!)
- [ ] Add contributor guidelines (`CONTRIBUTING.md`)
- [ ] Assign file/component ownership (e.g., `Signup.tsx = A`, `Index.tsx = B`)
- [ ] (Optional) Create Notion or Google Doc planning space
