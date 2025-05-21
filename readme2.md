👤 User Management
 Create users table in Supabase (name, email, wallet_address, role, group_name)

 Display users on / (index) page

 Add InviteUserModal with role + wallet inputs

 Add Signup.tsx page

 Connect Supabase Auth to signup form

 Handle duplicate email or wallet edge cases

 Style and validate form inputs

 Add edit/delete user functionality (optional: admin-only)

💸 Expense Management
 Set up expenses table (id, amount, notes, participants, etc.)

 Add expense detail view (/expenses/:id)

 Add new expense form (/expenses/new)

 Add “paid by” and “split between” logic

 Calculate balance per user

 Enable deletion of expenses with confirmation

 Link expenses to user IDs in Supabase

🔒 Roles & Permissions
 Enforce frontend UI for role-based access

 Store and validate role on page access

 Optional: Set up Supabase RLS (Row-Level Security)

🔐 Wallet/Web3 Integration
 Add wallet address field to user table

 Integrate wallet connect component (e.g., RainbowKit or web3modal)

 Sign message on login (optional)

 Add toggle for wallet visibility (public/private)

 Tie wallet address to user identity in expenses

🧪 Testing & QA
 Add seed/mock data to Supabase

 Test full invite > view > expense > balance cycle

 Test auth/signup flow end-to-end

 Setup staging preview (Codesandbox, Vercel, etc.)

🧭 Navigation & UX
 Add nav menu with links to /, /signup, /expenses

 Handle 404s gracefully with NotFound.tsx

 Onboarding message when no users/expenses yet

🛠 Dev Process & Collaboration
 This shared GitHub issue created

 Add contributor guidelines (or comments here on what not to break)

 Assign file/component ownership (e.g., Signup.tsx = A, Index.tsx = B)

 Add a Notion or Google Doc backup planning space (optional)
