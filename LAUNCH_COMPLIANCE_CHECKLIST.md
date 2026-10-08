# Launch compliance checklist

Status from a source-code review on 8 October 2026. This is an implementation inventory, not a legal opinion or a substitute for confirming the production configuration.

| Item | Status | Finding / follow-up |
| --- | --- | --- |
| Privacy notice | Incomplete | The notice now covers inquiry data, purposes, rights, AI use, and processors. Add the privacy contact email, business correspondence address, production processing locations, and confirmed retention schedule before launch. |
| Image and font rights | Pending evidence | Cormorant Garamond and Manrope include SIL Open Font License notices. Rights/provenance for brand files, renders, videos, and sequence frames must be confirmed and recorded by the asset owner. |
| Data export and deletion | Request path implemented; manual fulfilment | The privacy form routes access/export/correction/deletion requests for review. There are no user accounts or app database; review mailbox copies, backups, and provider retention manually. Verify identity before disclosure or deletion. |
| Auto-renewal disclosure | Not applicable to current site | The site offers no subscription, recurring plan, or online payment. Terms say any renewal/cancellation terms belong in a separate services agreement. |
| SOC 2 claims | No claim found | No SOC 2 representation was found in the reviewed app/repo text. Do not add one without an applicable independent report. |
| AI training on user data | No app integration; disclosed | The app has no AI service or training integration. The privacy notice says 14.85 Concept Limited does not use inquiry data to train AI models. Recheck vendor terms when production providers are confirmed. |
| Reject on cookie banner | Implemented for current app | First-visit notice offers Accept optional and Reject optional. No analytics or advertising trackers were found. Current browser storage use is disclosed; any future optional tracker must be gated on consent in code. |
| Liability cap in Terms | Pending | The Terms disclose that no cap has been approved. Add a reviewed cap only after confirming the amount and governing law. |
| Business DPA | Pending | No DPA is published. Confirm the actual business processing scope, roles, security commitments, and subprocessors before publishing one. |
| Package licenses | Reviewed | 374 installed packages had license metadata. GSAP’s current Standard “No Charge” license expressly covers commercial use and restricts use in no-code visual animation-building competitors and removal of notices. This site appears to be a practice website, not a competing animation builder; retain the license link with the release records. |
| Online cancellation | Not applicable to current site | No accounts, subscriptions, or recurring billing exist to cancel online. Reassess if these are added. |
| Published subprocessors | Page created; entries pending | `/subprocessors` is linked from the footer. Replace pending host/CDN and SMTP entries with provider legal names, services, processing locations, and current terms. |
| Trackers before consent | None found in source | No analytics, advertising, or cross-site tracker tags were found. Keep this true or ensure optional technologies are blocked until consent. |
| TOS acceptance checkbox | Implemented | RFQ submission requires a separate Website Terms checkbox; server validates and records its timestamp in the inquiry email. |
| Customer logos | No third-party customer logos found | No third-party customer logo list was found in the reviewed site code. Confirm asset permissions for all visible brand and project imagery. |
| Uptime SLA | No false SLA found | Terms expressly state there is no guaranteed uptime percentage or service-level agreement. |
| Email unsubscribe | Not applicable to current site | The RFQ form does not enroll users in marketing email and the app has no newsletter sender. Add unsubscribe handling before any marketing email program. |

## Required before production publication

- Confirm hosting/CDN and SMTP providers, legal names, and processing locations; update `/subprocessors` and the Privacy Notice.
- Provide the privacy contact email and business correspondence address.
- Approve an inquiry retention/deletion schedule and liability limit with appropriate legal review.
- Confirm asset provenance and commercial rights for brand imagery, renders, and videos; retain proof in the asset register.
- Retain a copy/reference to the [GSAP Standard “No Charge” license](https://gsap.com/standard-license) with the release records and recheck it if the product scope changes.
- Set `NEXT_PUBLIC_SITE_URL` and production SMTP/privacy-recipient environment variables.
