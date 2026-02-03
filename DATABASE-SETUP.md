# Database Setup Instructions

## Supabase Configuration

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://ztsvyfcwaxhaurssgiqt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Run Database Migration

To create the `buyer_preferences` table in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-migrations/buyer_preferences.sql`
4. Click "Run" to execute the migration

### 3. Verify Table Creation

After running the migration, you should see a new table called `buyer_preferences` in your database with the following structure:

- Contact information fields (name, email, phone)
- Program interest flags (HUD homes, REO, conventional, new construction)
- Financing preference flags (FHA, VA, USDA, conventional loan)
- Property type preferences
- Location preferences (coastal, mountains, piedmont, triangle, charlotte)
- Lifestyle features
- Budget and requirements (min/max budget, bedrooms, bathrooms)
- Timeline and first-time buyer status
- Additional notes
- Back office fields (status, assigned_agent_id)

### 4. Row Level Security (RLS)

The migration automatically sets up RLS policies:

- **Public Insert**: Anyone can submit preferences (for form submissions)
- **Authenticated Read**: Only authenticated users (admins) can view submissions

### 5. Accessing Submitted Data

To view submitted buyer preferences:

1. Go to Supabase Dashboard → Table Editor
2. Select the `buyer_preferences` table
3. View all submissions with timestamps
4. Filter by status, date, or other criteria

### 6. Admin Dashboard (Future)

The admin view to review and manage buyer preferences will be added in a future update. For now, use the Supabase dashboard to:

- View submissions
- Update status (new → contacted → qualified → closed)
- Assign leads to agents
- Export data for follow-up

## Buyer Preference Tool

The buyer preference collection tool is available at:

**URL**: `/education/buyer-preferences`

### Features:

1. **7-Step Interactive Wizard**:
   - Step 1: Home Buying Programs (HUD, REO, Conventional, New Construction)
   - Step 2: Financing Options (FHA, VA, USDA, Conventional + Down Payment Assistance)
   - Step 3: Property Types (Single Family, Condo, Townhouse, Land, Manufactured)
   - Step 4: Location Preferences (Coastal, Mountains, Piedmont, Triangle, Charlotte)
   - Step 5: Lifestyle Features (Waterfront, Golf, Rural, Urban, Suburban, Retirement)
   - Step 6: Budget & Requirements (Price range, bedrooms, bathrooms, timeline)
   - Step 7: Contact Information (Name, email, phone)

2. **Progress Tracking**: Visual progress bar showing completion percentage

3. **Multi-Select Options**: Users can select multiple preferences in each category

4. **Database Submission**: All preferences are saved to Supabase for back office follow-up

5. **Success Confirmation**: Thank you message after successful submission

### Integration Points:

- Add link to buyer preference tool in navigation menu
- Add call-to-action buttons on homepage
- Include in education section menu
- Feature in email marketing campaigns

## Next Steps

1. Run the database migration in Supabase
2. Test the buyer preference tool at `/education/buyer-preferences`
3. Verify submissions are being saved to the database
4. Set up email notifications for new submissions (optional)
5. Build admin dashboard to review and manage leads (future phase)
