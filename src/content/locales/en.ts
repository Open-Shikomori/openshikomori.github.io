const en = {
  language: {
    label: "Language",
    switcherAriaLabel: "Choose the site language",
    fr: "Francais",
    en: "English",
    ar: "العربية",
  },
  site: {
    badge: "Open-source Comorian AI",
    brand: "OpenShikomori",
    nav: {
      milestone: "Milestone",
      privacy: "Privacy",
      roadmap: "Roadmap",
      support: "Support",
    },
    repoPill: "Public code, private dataset",
  },
  hero: {
    eyebrow: "Public foundation",
    title: "Collect and safeguard Comorian voices with a trustworthy public shell.",
    description:
      "This Bun-powered app shell is the baseline for multilingual public pages, milestone reporting, and the guided recording flow that follows in later phases.",
    primaryCta: "Start Recording",
    secondaryCta: "Read the roadmap",
    note: "The recording route opens in the next milestone steps. This first public release explains the target, the privacy model, and the contribution path before audio collection goes live.",
    panelTitle: "Phase 1 foundation",
    panelLead: "What the start-recording path will do as soon as the submission pipeline is unlocked:",
    checklist: [
      "Choose one of the four Comorian speech variants",
      "Read a short reviewed prompt and record a 1 to 30 second clip",
      "Submit private audio while public progress remains transparent",
    ],
  },
  progress: {
    eyebrow: "Current milestone",
    title: "First target: enough reviewed speech to improve a Comorian Whisper model.",
    description:
      "The immediate public goal is clear: make the recording mission understandable and visible before the private upload pipeline opens.",
    note: "Live counters appear after the private submission flow is connected. The values below show the working target, not fake real-time results.",
    metrics: [
      {
        label: "Speech target",
        value: "10 hours",
        detail: "Shared openly so contributors know the real size of the first milestone.",
      },
      {
        label: "Collected now",
        value: "0 hours",
        detail: "Collection opens after the recorder and protected upload path are finished.",
      },
      {
        label: "Transcribed now",
        value: "0 hours",
        detail: "Transcription stays owner-reviewed first so the dataset remains consistent.",
      },
    ],
    previewTitle: "What Start Recording means today",
    previewBody:
      "The button scrolls to the contribution preview because the public recorder is not live yet. Phase 2 unlocks contributor entry and prompt selection; Phase 3 unlocks recording and private upload.",
    previewSteps: [
      "Low-friction entry with optional name, avatar, and email",
      "Prompt matched to the chosen Comorian variant",
      "Private WAV upload with public progress updates after review",
    ],
  },
  trust: {
    eyebrow: "Privacy and trust",
    title: "Open-source in public, raw voices in private, consent explained in plain language.",
    description:
      "This project is built as a public-interest language effort. The code and milestones stay visible; the contributed recordings stay private for review, transcription, and dataset curation.",
    pillars: [
      {
        title: "Privacy-first recordings",
        body: "Raw audio is not exposed on the public site. Only reviewed progress totals and milestone framing are shown publicly.",
      },
      {
        title: "Calm consent language",
        body: "Contributors should understand what happens to their voices before recording: private storage, owner review, and future model training use.",
      },
      {
        title: "Open-source credibility",
        body: "The public face should make the project legible to contributors, students, and supporters even before formal sponsorship tooling exists.",
      },
    ],
  },
  roadmap: {
    eyebrow: "Roadmap",
    title: "The roadmap is visible, but this release keeps attention on contribution readiness.",
    description:
      "Future model interaction matters, but Phase 1 stays disciplined: public mission, trust framing, and a clear path into later recorder work.",
    phases: [
      {
        stage: "Now",
        title: "Public foundation and trust",
        body: "Explain the mission, show the first target, and make privacy expectations plain.",
      },
      {
        stage: "Next",
        title: "Contributor entry and prompting",
        body: "Add optional identity, variant choice, and approved prompt delivery for each contribution.",
      },
      {
        stage: "Later",
        title: "Recording, upload, and public progress",
        body: "Unlock private audio submission, reviewed progress counters, and the owner workflow for curation.",
      },
    ],
  },
  contact: {
    eyebrow: "Support path",
    title: "Support starts with conversation, repository visibility, and careful stewardship.",
    description:
      "Formal donations are intentionally out of scope for this release. The public site instead gives supporters a clear picture of the project and a simple path to follow the work.",
    channels: [
      {
        title: "Open-source coordination",
        body: "Use the public repository and future issue tracker as the first home for collaboration, fixes, and contribution questions.",
        action: "Public repository",
        hint: "Publish the repository URL before launch.",
      },
      {
        title: "Sponsor preparation",
        body: "Use this page to explain the current milestone, the privacy stance, and why the speech dataset is being built carefully first.",
        action: "Sponsor brief",
        hint: "Add a direct contact email before sponsor outreach starts.",
      },
    ],
  },
} as const;

export default en;
