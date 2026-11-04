/**
 * KnowledgeTrack Automated End-to-End API & Business Logic Test Suite
 */

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extra = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  };

  console.log('\n========================================');
  console.log('🧪 RUNNING KNOWLEDGETRACK COMPREHENSIVE TEST SUITE');
  console.log('========================================\n');

  try {
    // 1. Health Probe
    console.log('--- 1. Testing Health & Connectivity ---');
    const health = await fetch(`${BASE_URL}/health`).then((r) => r.json());
    assert(health.status === 'ok', 'API health status is "ok"');

    // 2. Auth Flow: Registration
    console.log('\n--- 2. Testing Authentication & Registration ---');
    const testEmail = `test.user.${Date.now()}@knowledgetrack.io`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test User',
        email: testEmail,
        password: 'Password@123',
        role: 'Knowledge Owner',
        department: 'Engineering',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, 'User registration succeeds with JWT token');

    // Duplicate email registration should fail with 400
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate User',
        email: testEmail,
        password: 'Password@123',
      }),
    });
    assert(dupRes.status === 400, 'Duplicate email registration correctly rejected with 400 Bad Request');

    // Invalid Login should fail with 401
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword' }),
    });
    assert(badLoginRes.status === 401, 'Invalid login credentials rejected with 401 Unauthorized');

    // 3. Login Demo Accounts
    console.log('\n--- 3. Testing Demo Role Logins ---');
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@knowledgetrack.io', password: 'Admin@123' }),
    }).then((r) => r.json());
    assert(adminLogin.user?.role === 'Admin', 'Admin login successful with Admin role');
    const adminToken = adminLogin.token;

    const ownerLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.sharma@knowledgetrack.io', password: 'Owner@123' }),
    }).then((r) => r.json());
    assert(ownerLogin.user?.role === 'Knowledge Owner', 'Knowledge Owner login successful with Knowledge Owner role');
    const ownerToken = ownerLogin.token;

    const viewerLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@knowledgetrack.io', password: 'Viewer@123' }),
    }).then((r) => r.json());
    assert(viewerLogin.user?.role === 'Viewer', 'Viewer login successful with Viewer role');
    const viewerToken = viewerLogin.token;

    // 4. Role Permissions Matrix Checks
    console.log('\n--- 4. Testing Role Permissions & Guards ---');
    // Viewer tries to create an article -> 403 Forbidden
    const viewerCreate = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${viewerToken}` },
      body: JSON.stringify({
        title: 'Viewer Attempt',
        description: 'Should fail',
        content: 'Content',
        category: 'HR',
        reviewInterval: 90,
      }),
    });
    assert(viewerCreate.status === 403, 'Viewer blocked from creating article (403 Forbidden)');

    // Knowledge Owner creates an article -> 201 Created
    const ownerCreateRes = await fetch(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({
        title: 'Owner Created Onboarding Checklist',
        description: 'Checklist for new engineering hires',
        content: '### Steps\n1. Setup git\n2. Run tests',
        category: 'HR',
        reviewInterval: 60,
        tags: ['HR', 'Checklist'],
      }),
    });
    const ownerCreateData = await ownerCreateRes.json();
    assert(ownerCreateRes.status === 201 && ownerCreateData.data?._id, 'Knowledge Owner can create articles');
    const createdArticleId = ownerCreateData.data?._id;

    // Knowledge Owner tries to delete an article -> 403 Forbidden (Only Admin can delete)
    const ownerDeleteRes = await fetch(`${BASE_URL}/articles/${createdArticleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(ownerDeleteRes.status === 403, 'Knowledge Owner cannot delete article (403 Forbidden, Admin only)');

    // Viewer tries to delete -> 403 Forbidden
    const viewerDeleteRes = await fetch(`${BASE_URL}/articles/${createdArticleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    assert(viewerDeleteRes.status === 403, 'Viewer cannot delete article (403 Forbidden)');

    // 5. Review Flow & Dynamic Date Calculations
    console.log('\n--- 5. Testing Review Flow & Date Calculation Rules ---');
    const reviewRes = await fetch(`${BASE_URL}/articles/${createdArticleId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ notes: 'Verified compliance with Q4 standards' }),
    });
    const reviewData = await reviewRes.json();
    assert(
      reviewRes.status === 200 && reviewData.message.includes('Article reviewed successfully'),
      'Mark as Reviewed succeeds with formatted message',
      `Message: ${reviewData.message}`
    );
    assert(reviewData.data?.status === 'CURRENT', 'Post-review status transitions to CURRENT');
    assert(reviewData.data?.daysRemaining === 60, 'Days remaining calculated precisely as 60 for 60-day interval');

    // 6. Article Fetch, Search & Filter Verification
    console.log('\n--- 6. Testing Search, Filtering, and Sorting ---');
    // Search by title keyword
    const searchRes = await fetch(`${BASE_URL}/articles?search=Payment`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(
      searchRes.data?.some((a) => a.title.includes('Payment')),
      'Search by keyword "Payment" finds relevant article'
    );

    // Filter by Status: Overdue
    const overdueRes = await fetch(`${BASE_URL}/articles?status=Overdue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(
      overdueRes.data?.every((a) => a.status === 'OVERDUE'),
      'Status filter "Overdue" strictly returns only OVERDUE articles'
    );

    // Filter by Category: Finance
    const categoryRes = await fetch(`${BASE_URL}/articles?category=Finance`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(
      categoryRes.data?.every((a) => a.category === 'Finance'),
      'Category filter "Finance" strictly returns only Finance articles'
    );

    // 7. Dashboard Calculation Logic
    console.log('\n--- 7. Testing Dashboard Stats & Health Score Calculation ---');
    const dashRes = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    const stats = dashRes.stats;
    assert(
      stats.totalArticles === stats.current + stats.dueSoon + stats.overdue,
      'Total Articles equals Current + Due Soon + Overdue exactly'
    );
    const expectedHealth = Math.round((stats.current / stats.totalArticles) * 100);
    assert(stats.healthScore === expectedHealth, `Knowledge Health Score calculated dynamically (${stats.healthScore}%)`);
    assert(
      dashRes.requiringAttention && Array.isArray(dashRes.requiringAttention),
      'Dashboard returns "Articles Requiring Attention" list'
    );

    // 8. User Management (Admin Only)
    console.log('\n--- 8. Testing Admin User Provisioning & Guards ---');
    // Knowledge Owner attempts to list all users / provision -> 403
    const nonAdminUserPost = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({ name: 'Hacker', email: 'hack@test.com', role: 'Admin' }),
    });
    assert(nonAdminUserPost.status === 403, 'Non-admin blocked from provisioning users (403 Forbidden)');

    // Admin provisions new user
    const newUserEmail = `compliance.officer.${Date.now()}@knowledgetrack.io`;
    const adminUserCreateRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Chief Compliance Officer',
        email: newUserEmail,
        password: 'Password@123',
        role: 'Knowledge Owner',
        department: 'Compliance',
      }),
    });
    const adminUserCreate = await adminUserCreateRes.json();
    assert(adminUserCreateRes.status === 201 && adminUserCreate.data?._id, 'Admin successfully provisions new user');
    const createdUserId = adminUserCreate.data?._id;

    // Admin updates user role
    const updateRoleRes = await fetch(`${BASE_URL}/users/${createdUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ role: 'Admin' }),
    });
    const updateRoleData = await updateRoleRes.json();
    assert(updateRoleData.data?.role === 'Admin', 'Admin can modify user role to Admin');

    // Admin deletes the test user
    const deleteUserRes = await fetch(`${BASE_URL}/users/${createdUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteUserRes.status === 200, 'Admin can remove user account');

    // Clean up created test article
    const adminDeleteArt = await fetch(`${BASE_URL}/articles/${createdArticleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDeleteArt.status === 200, 'Admin can delete article');

    // 9. Notifications & Activity Logs
    console.log('\n--- 9. Testing In-App Notifications & Audit Stream ---');
    const notifs = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(notifs.success && Array.isArray(notifs.data), 'In-app notifications retrieved successfully');

    const activity = await fetch(`${BASE_URL}/activity`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    assert(activity.success && activity.data?.length > 0, 'Activity log returns immutable audit events');

    console.log('\n========================================');
    console.log(`🏁 TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
};

runTests();
