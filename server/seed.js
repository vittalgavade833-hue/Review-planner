import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Article from './models/Article.js';
import Activity from './models/Activity.js';
import Notification from './models/Notification.js';
import { computeArticleReviewFields } from './utils/reviewCalculator.js';
import { connectDB } from './config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('Seeding KnowledgeTrack database...');

    // Clear existing collections
    await User.deleteMany({});
    await Article.deleteMany({});
    await Activity.deleteMany({});
    await Notification.deleteMany({});

    // 1. Create Demo Users
    const admin = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'admin@knowledgetrack.io',
      password: 'Admin@123',
      role: 'Admin',
      department: 'Executive Operations',
      status: 'active',
    });

    const owner1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.sharma@knowledgetrack.io',
      password: 'Owner@123',
      role: 'Knowledge Owner',
      department: 'Human Resources',
      status: 'active',
    });

    const owner2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@knowledgetrack.io',
      password: 'Owner@123',
      role: 'Knowledge Owner',
      department: 'Finance & Compliance',
      status: 'active',
    });

    const owner3 = await User.create({
      name: 'Amit Kumar',
      email: 'amit.kumar@knowledgetrack.io',
      password: 'Owner@123',
      role: 'Knowledge Owner',
      department: 'Cybersecurity & Infrastructure',
      status: 'active',
    });

    const owner4 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@knowledgetrack.io',
      password: 'Owner@123',
      role: 'Knowledge Owner',
      department: 'Engineering',
      status: 'active',
    });

    const viewer = await User.create({
      name: 'Vikram Mehta',
      email: 'viewer@knowledgetrack.io',
      password: 'Viewer@123',
      role: 'Viewer',
      department: 'Quality Assurance',
      status: 'active',
    });

    console.log('Created 6 demo users (Admin, Knowledge Owners, Viewer).');

    // Reference today's date to calculate realistic lastReviewedDates
    // Current time: 2026-11-02
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // 2. Realistic 18 Knowledge Articles with varied statuses:
    // CURRENT: next review > 30 days away
    // DUE SOON: next review between 0 and 30 days away
    // OVERDUE: next review < 0 days away (past)
    const rawArticles = [
      // 1. OVERDUE (Finance) - Next review was due ~8 days ago
      {
        title: 'Payment Process & Vendor Disbursement Guide',
        description: 'Standard operating procedures for international and domestic vendor disbursements, payment batch approvals, and SWIFT reconciliations.',
        content: `### 1. Purpose & Scope
This guide defines the multi-tier approval workflow for enterprise vendor disbursements and banking portal operations.

### 2. Mandatory Verification Checkpoints
- **Vendor Validation:** Every invoice exceeding $5,000 must be cross-matched against an approved Purchase Order (PO).
- **Dual Authorization:** Two designated signatories must verify batch remittance files before upload to the corporate treasury terminal.
- **Tax Withholding & TDS:** Apply mandatory jurisdictional withholdings and generate confirmation chits.

### 3. Payment Execution Windows
- Standard ACH transfers: Processed daily at 10:00 AM and 3:00 PM EST.
- International Wire Transfers: Final submission window closes at 1:30 PM EST for same-day settlement.`,
        category: 'Finance',
        owner: owner2._id,
        // interval 90 days, reviewed 98 days ago => 8 days overdue
        lastReviewedDate: daysAgo(98),
        reviewInterval: 90,
        tags: ['Finance', 'Disbursements', 'Payments', 'Vendor PO', 'Treasury'],
      },

      // 2. OVERDUE (Operations) - Next review was due ~14 days ago
      {
        title: 'Emergency Facility Evacuation & Incident Response Manual',
        description: 'Physical safety protocols, fire safety drills, assembly points, and incident triage for all campus headquarters.',
        content: `### 1. Emergency Escalation Hierarchy
In the event of structural fire, chemical spill, or seismic event, follow the floor warden instructions immediately.

### 2. Evacuation Protocols
- Cease all heavy machinery operations immediately.
- Never use passenger elevators; proceed via designated pressurized stairwells.
- Report directly to Assembly Area B (East Lawn) for headcounts.

### 3. Incident Reporting
Floor wardens must submit post-evacuation status logs to the Health & Safety Director within 60 minutes of all-clear signal.`,
        category: 'Operations',
        owner: admin._id,
        // interval 60 days, reviewed 74 days ago => 14 days overdue
        lastReviewedDate: daysAgo(74),
        reviewInterval: 60,
        tags: ['Safety', 'Facilities', 'Evacuation', 'Crisis Protocol'],
      },

      // 3. OVERDUE (IT) - Next review was due ~5 days ago
      {
        title: 'Cloud Infrastructure Disaster Recovery Runbook',
        description: 'Step-by-step procedures for cross-region failover, database snapshot restoration, and DNS rerouting in incident scenarios.',
        content: `### 1. Objective
Achieve an RTO of less than 30 minutes and an RPO under 5 minutes for core microservices and tenant databases.

### 2. Failover Trigger Conditions
- Total outage of primary cloud availability zone lasting more than 8 minutes.
- Catastrophic replication lag exceeding 120 seconds on secondary clusters.

### 3. Execution Commands & Verification
1. Route53 DNS latency reroute switch to secondary region.
2. Promote read replicas to master cluster.
3. Validate API Gateway health probes across edge locations.`,
        category: 'IT',
        owner: owner3._id,
        // interval 90 days, reviewed 95 days ago => 5 days overdue
        lastReviewedDate: daysAgo(95),
        reviewInterval: 90,
        tags: ['DevOps', 'Disaster Recovery', 'AWS', 'Failover', 'High Availability'],
      },

      // 4. DUE SOON (HR) - Next review due in ~10 days
      {
        title: 'Employee Onboarding & Talent Integration SOP',
        description: 'Standardized 30-60-90 day onboarding framework, IT asset provisioning checklist, and benefits enrollment steps.',
        content: `### 1. Pre-Arrival Workflow
- People Ops triggers Okta provisioning and background verification checks 5 business days prior to Day 1.
- IT ships encrypted laptop and welcome pack.

### 2. Week 1 Induction
- Company mission and culture orientation with VP People.
- Assign dedicated team peer buddy for first 90 days.
- Complete mandatory data protection compliance modules.

### 3. Day 30 / 60 / 90 Check-ins
Structured 1-on-1 performance milestones with direct line manager.`,
        category: 'HR',
        owner: owner1._id,
        // interval 90 days, reviewed 80 days ago => 10 days remaining
        lastReviewedDate: daysAgo(80),
        reviewInterval: 90,
        tags: ['HR', 'Onboarding', 'Talent', 'Compliance', 'People Ops'],
      },

      // 5. DUE SOON (Security) - Next review due in ~18 days
      {
        title: 'Cryptographic Key Management & Certificate Rotation Policy',
        description: 'Protocols for TLS certificate renewal, SSH bastion key lifecycles, and HSM root key storage.',
        content: `### 1. Scope
Governs all public-facing SSL/TLS certificates, internal mutual TLS (mTLS) identities, and asymmetric encryption key pairs.

### 2. Rotation Cadence
- Wildcard TLS certs: Automated ACME rotation every 60 days.
- Bastion SSH keys: Mandatory client regeneration every 90 days.
- KMS Master Keys: Automatic yearly KMS hardware rotation.

### 3. Decommissioning
Old private keys must be purged from memory buffers and archived in air-gapped cold storage.`,
        category: 'Security',
        owner: owner3._id,
        // interval 60 days, reviewed 42 days ago => 18 days remaining
        lastReviewedDate: daysAgo(42),
        reviewInterval: 60,
        tags: ['Security', 'Cryptography', 'SSL', 'Certificates', 'Zero Trust'],
      },

      // 6. DUE SOON (Product) - Next review due in ~7 days
      {
        title: 'Feature Flag Lifecycle & Technical Debt Retirement Protocol',
        description: 'Guidelines for rolling out experimental features via LaunchDarkly, sunsetting deprecated flags, and cleanups.',
        content: `### 1. Feature Flag Lifespan
No experimentation flag should remain active in the production codebase for more than 45 days post general availability.

### 2. Phased Rollout Schedule
- Phase 1: Internal canine testing (100% staff).
- Phase 2: Beta cohorts (10% random users).
- Phase 3: Global GA (100% traffic).

### 3. Cleanup Sprint
Engineers must delete stale conditional logic during the sprint immediately following full GA.`,
        category: 'Product',
        owner: owner4._id,
        // interval 30 days, reviewed 23 days ago => 7 days remaining
        lastReviewedDate: daysAgo(23),
        reviewInterval: 30,
        tags: ['Product', 'Feature Flags', 'Deployment', 'Engineering'],
      },

      // 7. CURRENT (Security) - Next review due in ~150 days
      {
        title: 'IT Security Architecture & Zero Trust Access Guide',
        description: 'Comprehensive enterprise defense blueprint including MFA enforcement, device hygiene posture, and least privilege rules.',
        content: `### 1. Zero Trust Principles
Never trust, always verify. Every request originating inside or outside our network perimeter is inspected and authenticated.

### 2. Device Posture Checks
- Device must be enrolled in corporate MDM with CrowdStrike Falcon active.
- Disk encryption (FileVault / BitLocker) must be verified at every session initiation.
- Passwords must be FIDO2 biometric or hardware security key (YubiKey) backed.

### 3. Network Segmentation
Production VPCs do not share routing tables with development or staging subnets. Access to database clusters requires ephemeral JIT bastion credentials.`,
        category: 'Security',
        owner: owner3._id,
        // interval 180 days, reviewed 30 days ago => 150 days remaining
        lastReviewedDate: daysAgo(30),
        reviewInterval: 180,
        tags: ['Security', 'Zero Trust', 'MFA', 'Architecture', 'Enterprise'],
      },

      // 8. CURRENT (Engineering) - Next review due in ~75 days
      {
        title: 'Production API Versioning & Backward Compatibility Standard',
        description: 'REST and GraphQL contract standards, semantic versioning rules, deprecation warning headers, and client SDK release policies.',
        content: `### 1. Semantic Versioning
All public REST endpoints conform to URL-based major versioning: \`/api/v1/\`, \`/api/v2/\`. Minor non-breaking updates never break JSON contracts.

### 2. Deprecation Protocol
- Deprecation header: \`Sunset: Wed, 11 Nov 2027 00:00:00 GMT\` must be returned on all deprecated paths.
- Active notification emails sent to registered API partners 90 days before sunset.

### 3. Contract Testing
Automated Pact / OpenAPI test suites must pass before merging pull requests.`,
        category: 'Engineering',
        owner: owner4._id,
        // interval 90 days, reviewed 15 days ago => 75 days remaining
        lastReviewedDate: daysAgo(15),
        reviewInterval: 90,
        tags: ['API', 'Engineering', 'Architecture', 'REST', 'Standards'],
      },

      // 9. CURRENT (HR) - Next review due in ~80 days
      {
        title: 'Remote Work Stipend & Ergonomic Home Office Policy',
        description: 'Eligibility criteria, allowable expense categories, hardware replacement frequency, and international tax boundaries.',
        content: `### 1. Annual Stipend Allocation
Full-time employees receive a $1,200 annual home office enhancement budget for ergonomic furniture, monitors, and high-speed broadband.

### 2. Approved Expense Categories
- Standing desks, lumbar support chairs, high-resolution webcams.
- Monthly broadband reimbursement up to $75/month.

### 3. Global Mobility Restrictions
Remote work from outside your registered tax residency country is limited to 30 cumulative days per calendar year.`,
        category: 'HR',
        owner: owner1._id,
        // interval 90 days, reviewed 10 days ago => 80 days remaining
        lastReviewedDate: daysAgo(10),
        reviewInterval: 90,
        tags: ['HR', 'Remote Work', 'Benefits', 'Policy'],
      },

      // 10. CURRENT (Finance) - Next review due in ~250 days
      {
        title: 'Corporate Travel & Expense Reimbursement Policy',
        description: 'Per-diem rates, airline booking class regulations, client entertainment ceilings, and Expensify receipt submission timelines.',
        content: `### 1. Air Travel Guidelines
- Flights under 6 hours: Economy or Premium Economy only.
- Flights exceeding 6 hours across oceans: Business Class permitted with VP prior sign-off.

### 2. Daily Per Diem
- Tier 1 Metro Cities (NYC, London, Tokyo, SF): $120/day.
- Standard Cities: $85/day.

### 3. Expense Filing SLA
All receipts must be submitted via the expense portal within 21 days of trip completion.`,
        category: 'Finance',
        owner: owner2._id,
        // interval 365 days, reviewed 115 days ago => 250 days remaining
        lastReviewedDate: daysAgo(115),
        reviewInterval: 365,
        tags: ['Finance', 'Travel', 'Expenses', 'Compliance'],
      },

      // 11. CURRENT (Operations) - Next review due in ~50 days
      {
        title: 'SaaS Tool Procurement & Vendor Due Diligence Framework',
        description: 'Security questionnaires, SOC2 type II audit requirements, legal review gates, and contract renewal alerts.',
        content: `### 1. Evaluation Stages
1. Business Case & ROI approval by Department Head.
2. InfoSec Security Assessment (SIG Lite + SOC2 Type 2 report).
3. Legal redlining for GDPR/CCPA data processing addendum (DPA).

### 2. Renewal Notice Clause
Contracts must mandate a minimum 60-day written cancellation notice to prevent automatic multi-year lock-in.`,
        category: 'Operations',
        owner: admin._id,
        // interval 90 days, reviewed 40 days ago => 50 days remaining
        lastReviewedDate: daysAgo(40),
        reviewInterval: 90,
        tags: ['Procurement', 'Vendors', 'Legal', 'Operations', 'SOC2'],
      },

      // 12. OVERDUE (Product) - Next review was due ~20 days ago
      {
        title: 'User Analytics & Telemetry Privacy Compliance Standard',
        description: 'Data minimization principles, PostHog/Mixpanel anonymization hashes, and user cookie opt-in management.',
        content: `### 1. Personally Identifiable Information (PII) Ban
Never log raw email addresses, IP addresses, credit card hashes, or physical addresses in analytics payload events.

### 2. User Consent Banners
Strict opt-in required for EU/UK IP addresses before firing third-party behavioral pixels.

### 3. Retention Limits
Event streams are stored for 14 months before automated partition truncation.`,
        category: 'Product',
        owner: owner4._id,
        // interval 60 days, reviewed 80 days ago => 20 days overdue
        lastReviewedDate: daysAgo(80),
        reviewInterval: 60,
        tags: ['Product', 'Privacy', 'Analytics', 'GDPR', 'Telemetry'],
      },

      // 13. DUE SOON (IT) - Next review due in ~24 days
      {
        title: 'Database Backup Verification & Snapshot Integrity Protocol',
        description: 'Automated weekly restore drills into staging sandbox, encryption key verification, and storage lifecycle policies.',
        content: `### 1. Automated Backup Cadence
- Continuous WAL archiving to S3 with object lock.
- Full snapshot taken daily at 02:00 UTC.

### 2. Sandbox Verification Drill
Every Sunday at 04:00 UTC, a synthetic worker provisions a test cluster, restores the latest backup, runs 150 automated integrity queries, and records pass/fail metrics.`,
        category: 'IT',
        owner: owner3._id,
        // interval 60 days, reviewed 36 days ago => 24 days remaining
        lastReviewedDate: daysAgo(36),
        reviewInterval: 60,
        tags: ['Database', 'Postgres', 'Backups', 'IT', 'Storage'],
      },

      // 14. CURRENT (Engineering) - Next review due in ~160 days
      {
        title: 'Microservices Deployment & Canary Release Strategy',
        description: 'Kubernetes deployment strategies, ArgoCD GitOps pipelines, metric-based rollback thresholds, and chaos testing.',
        content: `### 1. Canary Analysis Metrics
During the initial 10-minute 5% traffic split:
- Error rate must remain under 0.05%.
- p99 latency must not degrade by more than 15ms.

### 2. Automated Rollback
If Prometheus triggers an alert, Argo Rollouts instantly aborts the canary and drains traffic back to the stable replica set.`,
        category: 'Engineering',
        owner: owner4._id,
        // interval 180 days, reviewed 20 days ago => 160 days remaining
        lastReviewedDate: daysAgo(20),
        reviewInterval: 180,
        tags: ['Kubernetes', 'CI/CD', 'GitOps', 'DevOps', 'ArgoCD'],
      },

      // 15. OVERDUE (Security) - Next review was due ~3 days ago
      {
        title: 'Third-Party Vulnerability Management & Patching SLA',
        description: 'CVE severity scoring metrics, emergency hotfix SLAs for critical CVEs, and automated Dependabot/Snyk triage.',
        content: `### 1. Remediation SLAs
- **Critical (CVSS 9.0 - 10.0):** 48 hours to production deploy.
- **High (CVSS 7.0 - 8.9):** 7 calendar days.
- **Medium (CVSS 4.0 - 6.9):** Next scheduled release sprint (max 30 days).

### 2. Triage & Exception Process
If a patch introduces breaking regressions, an explicit InfoSec risk acceptance sign-off must be logged in Jira with compensatory firewall rules.`,
        category: 'Security',
        owner: owner3._id,
        // interval 30 days, reviewed 33 days ago => 3 days overdue
        lastReviewedDate: daysAgo(33),
        reviewInterval: 30,
        tags: ['Security', 'Vulnerabilities', 'Patching', 'CVE', 'Compliance'],
      },

      // 16. CURRENT (Operations) - Next review due in ~300 days
      {
        title: 'Global Office Visitor & Physical Access Protocol',
        description: 'Visitor badge management, NDA execution, escort requirements, and badge access revocation upon contractor termination.',
        content: `### 1. Pre-Registration
All external visitors must be registered in the Envoy portal by their employee host at least 24 hours in advance.

### 2. Badging & Escort
Visitors must wear high-visibility orange guest lanyards at all times and remain under employee escort in restricted server and laboratory zones.`,
        category: 'Operations',
        owner: admin._id,
        // interval 365 days, reviewed 65 days ago => 300 days remaining
        lastReviewedDate: daysAgo(65),
        reviewInterval: 365,
        tags: ['Facilities', 'Physical Security', 'Visitors', 'Operations'],
      },

      // 17. DUE SOON (Finance) - Next review due in ~4 days
      {
        title: 'Quarterly Financial Close & Audit Ledger Reconciliation',
        description: 'General ledger freeze cutoffs, intercompany reconciliation workpapers, and Big 4 external audit evidence repository.',
        content: `### 1. Day -3 to Day 0 Timeline
- Freeze revenue recognition subsystem on Day -1 at 23:59 UTC.
- Complete bank statement reconciliations by Day 2.
- CFO flash report presented on Day 4.

### 2. Variance Analysis Thresholds
Any account balance shift greater than 5% or $50,000 against forecast requires written commentary in the close deck.`,
        category: 'Finance',
        owner: owner2._id,
        // interval 90 days, reviewed 86 days ago => 4 days remaining
        lastReviewedDate: daysAgo(86),
        reviewInterval: 90,
        tags: ['Finance', 'Audit', 'Accounting', 'Quarterly Close'],
      },

      // 18. CURRENT (HR) - Next review due in ~45 days
      {
        title: 'Diversity, Inclusion & Equal Opportunity Workplace Charter',
        description: 'Guiding corporate principles for equitable hiring, neutral pay audits, affinity networks, and grievance resolution mechanisms.',
        content: `### 1. Equitable Hiring Panels
All interview loops for senior and leadership roles must feature cross-functional, diverse interviewing panels.

### 2. Annual Pay Equity Audits
External third-party econometric analysis performed annually to ensure statistically zero unexplained compensation discrepancies across demographic groups.`,
        category: 'HR',
        owner: owner1._id,
        // interval 90 days, reviewed 45 days ago => 45 days remaining
        lastReviewedDate: daysAgo(45),
        reviewInterval: 90,
        tags: ['HR', 'Culture', 'Inclusion', 'Workplace', 'Ethics'],
      },
    ];

    console.log(`Creating ${rawArticles.length} realistic knowledge articles with dynamic review intervals...`);

    const createdArticles = [];
    for (const item of rawArticles) {
      const computed = computeArticleReviewFields(item.lastReviewedDate, item.reviewInterval);
      const article = await Article.create({
        ...item,
        nextReviewDate: computed.nextReviewDate,
        status: computed.status,
        createdBy: admin._id,
        reviewHistory: [
          {
            reviewedBy: item.owner,
            reviewedAt: item.lastReviewedDate,
            notes: 'Scheduled comprehensive compliance verification',
          },
        ],
      });
      createdArticles.push(article);
    }

    // 3. Create Sample Activities
    await Activity.create([
      {
        user: owner1._id,
        action: 'article_reviewed',
        article: createdArticles[3]._id,
        articleTitle: createdArticles[3].title,
        details: 'Rahul Sharma reviewed "Employee Onboarding & Talent Integration SOP"',
        timestamp: daysAgo(2),
      },
      {
        user: owner2._id,
        action: 'article_updated',
        article: createdArticles[0]._id,
        articleTitle: createdArticles[0].title,
        details: 'Priya Sharma updated "Payment Process & Vendor Disbursement Guide"',
        timestamp: daysAgo(4),
      },
      {
        user: admin._id,
        action: 'owner_assigned',
        article: createdArticles[4]._id,
        articleTitle: createdArticles[4].title,
        details: 'Admin assigned Amit Kumar as owner for "Cryptographic Key Management"',
        timestamp: daysAgo(6),
      },
      {
        user: owner4._id,
        action: 'article_created',
        article: createdArticles[7]._id,
        articleTitle: createdArticles[7].title,
        details: 'Elena Rostova created "Production API Versioning Standard"',
        timestamp: daysAgo(15),
      },
      {
        user: admin._id,
        action: 'user_created',
        details: 'Admin welcomed Vikram Mehta as Viewer',
        timestamp: daysAgo(20),
      },
    ]);

    // 4. Create Initial In-App Notifications
    await Notification.create([
      {
        user: owner2._id,
        message: '⚠️ "Payment Process & Vendor Disbursement Guide" is overdue for review.',
        type: 'warning',
        article: createdArticles[0]._id,
        articleTitle: createdArticles[0].title,
        read: false,
        createdAt: daysAgo(1),
      },
      {
        user: owner1._id,
        message: '🔔 "Employee Onboarding & Talent Integration SOP" is due for review in 10 days.',
        type: 'reminder',
        article: createdArticles[3]._id,
        articleTitle: createdArticles[3].title,
        read: false,
        createdAt: daysAgo(2),
      },
      {
        user: owner3._id,
        message: '⚠️ "Cloud Infrastructure Disaster Recovery Runbook" review date has passed.',
        type: 'warning',
        article: createdArticles[2]._id,
        articleTitle: createdArticles[2].title,
        read: false,
        createdAt: daysAgo(3),
      },
      {
        user: owner4._id,
        message: '✅ "Feature Flag Lifecycle" review scheduled.',
        type: 'info',
        article: createdArticles[5]._id,
        articleTitle: createdArticles[5].title,
        read: true,
        createdAt: daysAgo(5),
      },
    ]);

    console.log('Database seeded successfully with demo data!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// If run directly via `node seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      console.log('Seeding script completed.');
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
