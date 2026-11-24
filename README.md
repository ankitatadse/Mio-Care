# Kitten Care Diary

A small mobile web app for you and your sister to log your Persian kitten's meals, weight, health notes, vaccines and deworming. Plain HTML, CSS and JavaScript. No build step.

## Files

- `index.html` the page
- `app.js` the app logic
- `config.js` your Supabase URL and key
- `supabase.sql` creates the one table the app needs
- `vercel.json` tells Vercel to serve it as a static site

## Set up (about 10 minutes)

1. **Supabase.** Create a free project at supabase.com. Open SQL Editor, paste everything from `supabase.sql`, press Run.
2. **Keys.** In Supabase go to Project Settings > API. Copy the Project URL and the `anon public` key into `config.js`.
3. **Deploy.** Put these files in a GitHub repo, then import the repo in Vercel and press Deploy. Framework preset: Other. No build command, no output directory.
4. **Share.** Open the Vercel link on both phones and use "Add to Home Screen". Start in the Profile tab: name, birth date and both your names.

## Notes

- Without keys in `config.js` the app still works, but data stays only in that one browser.
- Data refreshes every 15 seconds and whenever you reopen the app.
- Anyone who has your site link can view and edit the data. Keep the link private. Do not add personal information beyond the kitten's details.
- Vaccine and deworming dates follow a common kitten schedule. Confirm with your vet.
# Mio-Care
