
Feature: Build the auth flow with clerk 

Goals:
1. Build the landing page for my web app. (for the design and structure see the file: C:\Users\AlphaQuadrant\Documents\0 self project\Agent Projects\water-station-web\docs\specs\000-auth_workflow\landing-page-ui-ux.md)
2. Build the sign up flow. (use the clerk default sign-up component for next.js)
3. Build the sign in flow. (use the clerk default sign-in component for next.js)
4. After the user sign-up, he/she will be redirected to complete-registration-form,
   for the form : use (react-hook-form and zod validation):
   Form contains this: 
    is_owner (ask if he/she is an owner? if not then he/she is a staff)
    
    If user is an owner (the form fields will be)
    - water station name (owner's water station name)
   
    If the user is a staff (the form fields will be)
    - name
    - phone number
    - gender
    - water-station-invite-code (organization)
  
    then submit the form using my supabase edge function (use axios):
    const url = 'https://yiguiyjnuvxrhqjyyykv.supabase.co/functions/v1/update-clerk-session-tokens';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // for token use the clerk  const { getToken } = useAuth();
        },
        body: JSON.stringify(payload(input)),
    });

    // for the payload of my supabase edge function:
    return {
    is_owner: input.isOwner,
    organization: input.water-station-invite-code, // if owner just leave it null
    ...(input.gender ? { gender: input.gender } : {}), // if owner just leave it null
    ...(input.phoneNumber ? { phone_number: input.phoneNumber } : {}), // if owner just leave it null
  };





