OHS LEAGUE REDESIGNED MULTI-PAGE VERSION

Open index.html. Keep all files in the same folder.

Pages:
Home, Standings, Fixtures, Results, Clubs, Players, Awards, News, Admin.

Admin login uses Supabase Auth.
Create the administrator in Supabase Auth with your chosen email and password, then add that user's UUID to public.admin_users.


Important: because this password is embedded in frontend JavaScript, it is NOT a secure production secret. Anyone inspecting app.js can see it. For a genuinely secured public site, use Supabase Auth + RLS and do not rely on a frontend password.

The multi-goal match editor lets the admin add unlimited goal rows with:
- scorer
- optional assister
- minute

Run supabase-schema.sql in your Supabase SQL Editor before using match_events.


NETLIFY
-------
This package is prepared for Netlify static hosting.
Before deployment, set the real Supabase Publishable/anon key in app.js.
