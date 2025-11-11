export default async function Callback({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  const code = params.code;
  const error = params.error;

  if (error) {
    return (
      <div className="p-8">
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="p-8">
        <h1>Error</h1>
        <p>No authorization code provided.</p>
      </div>
    );
  }

  // Exchange code for access token
  const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return (
      <div className="p-8">
        <h1>Error</h1>
        <p>Server configuration error: Missing environment variables.</p>
      </div>
    );
  }

  const tokenResponse = await fetch(
    'https://graph.facebook.com/v18.0/oauth/access_token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return (
      <div className="p-8">
        <h1>Error</h1>
        <p>Failed to exchange code for token: {JSON.stringify(tokenData)}</p>
      </div>
    );
  }

  const accessToken = tokenData.access_token;

  // Get Instagram Business Account ID
  const accountsResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
  );

  const accountsData = await accountsResponse.json();

  if (!accountsResponse.ok) {
    return (
      <div className="p-8">
        <h1>Error</h1>
        <p>Failed to get accounts: {JSON.stringify(accountsData)}</p>
      </div>
    );
  }

  const pages = accountsData.data || [];
  const instagramAccount = pages.find(
    (page: any) => page.instagram_business_account
  );

  if (!instagramAccount) {
    return (
      <div className="p-8">
        <h1>Error</h1>
        <p>No Instagram Business Account found linked to your pages.</p>
        <details>
          <summary>Debug Info - Pages Data</summary>
          <pre>{JSON.stringify(pages, null, 2)}</pre>
        </details>
      </div>
    );
  }

  const accountId = instagramAccount.instagram_business_account.id;

  return (
    <div className="p-8">
      <h1>Login Successful</h1>
      <p><strong>Access Token:</strong> {accessToken}</p>
      <p><strong>Instagram Account ID:</strong> {accountId}</p>
    </div>
  );
}