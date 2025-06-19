# Supabase Setup Guide for Leila

## 1. Create Supabase Account (Free)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new project:
   - Project name: `leila` (or `heyleila`)
   - Database password: (save this!)
   - Region: Choose closest to you

## 2. Set Up Database

1. Once project is created, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" to create all tables

## 3. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJS...` (long string)

## 4. Configure Your App

1. Create `.env.local` file in the frontend:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Restart your dev server

## 5. Test It

1. Go to your app and create a booking
2. Check Supabase dashboard → **Table Editor** → **bookings**
3. You should see your booking!

## Features You Get:

### ✅ Real Database
- All bookings saved permanently
- SQL queries for complex searches
- Real-time updates

### ✅ Authentication (Optional)
```javascript
// Sign up contractors
const { user } = await supabase.auth.signUp({
  email: 'contractor@example.com',
  password: 'password'
})

// Sign in
const { user } = await supabase.auth.signIn({
  email: 'contractor@example.com',
  password: 'password'
})
```

### ✅ Real-time Subscriptions
```javascript
// Listen for new jobs
supabase
  .from('jobs')
  .on('INSERT', payload => {
    console.log('New job!', payload.new)
  })
  .subscribe()
```

### ✅ File Storage
```javascript
// Upload contractor photos
const { data } = await supabase.storage
  .from('avatars')
  .upload('public/avatar1.png', file)
```

## SQL Examples:

### Find available contractors near a location:
```sql
SELECT * FROM contractors 
WHERE status = 'active' 
AND 'Plumbing' = ANY(services)
ORDER BY rating DESC;
```

### Get contractor stats:
```sql
SELECT 
  COUNT(*) as total_jobs,
  AVG(price) as avg_price,
  SUM(price) as total_earnings
FROM jobs 
WHERE contractor_id = 'xxx' 
AND status = 'completed';
```

## Why This is Better Than Firestore:

1. **SQL Power**: Complex queries, joins, aggregations
2. **Cheaper**: More generous free tier
3. **Open Source**: PostgreSQL can be migrated anywhere
4. **Built-in Auth**: No separate auth service needed
5. **Real-time**: WebSocket subscriptions included

## Next Steps:

1. Set up authentication for contractors
2. Add real-time job notifications
3. Create admin dashboard
4. Add payment processing with Stripe

The app will work in "demo mode" without Supabase configured, but with it, everything becomes real!