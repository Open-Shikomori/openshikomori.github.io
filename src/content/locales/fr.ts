const fr = {
  language: {
    label: "Langue",
    switcherAriaLabel: "Choisir la langue du site",
    fr: "Francais",
    en: "English",
    ar: "العربية",
  },
  site: {
    badge: "IA comorienne open source",
    brand: "OpenShikomori",
    nav: {
      milestone: "Objectif",
      privacy: "Confidentialite",
      roadmap: "Feuille de route",
      support: "Soutien",
    },
    repoPill: "Code public, jeu de donnees prive",
  },
  hero: {
    eyebrow: "Fondation publique",
    title: "Collecter et proteger les voix comoriennes avec une interface publique fiable.",
    description:
      "Cette base Bun et React prepare les pages publiques multilingues, le suivi du jalon et le parcours d'enregistrement guide des prochaines phases.",
    primaryCta: "Start Recording",
    secondaryCta: "Lire la feuille de route",
    note: "Le parcours d'enregistrement ouvre dans les prochaines etapes du jalon. Cette premiere version publique explique d'abord l'objectif, la confidentialite et la logique de contribution.",
    panelTitle: "Fondation de la phase 1",
    panelLead: "Voici ce que fera le parcours Start Recording des que la soumission privee sera ouverte :",
    checklist: [
      "Choisir l'une des quatre variantes de parole comorienne",
      "Lire une phrase validee puis enregistrer un extrait de 1 a 30 secondes",
      "Envoyer un audio prive pendant que le progres public reste transparent",
    ],
  },
  progress: {
    eyebrow: "Jalon actuel",
    title: "Premier objectif : assez de parole relue pour ameliorer un modele Whisper comorien.",
    description:
      "L'objectif public immediat est simple : rendre la mission d'enregistrement claire et visible avant l'ouverture du pipeline de soumission privee.",
    note: "Les compteurs en direct arriveront quand le flux de soumission privee sera connecte. Les valeurs ci-dessous montrent l'objectif de travail, pas de faux resultats temps reel.",
    metrics: [
      {
        label: "Objectif parole",
        value: "10 heures",
        detail: "Affiche publiquement pour que tout le monde comprenne la taille du premier jalon.",
      },
      {
        label: "Collecte actuelle",
        value: "0 heure",
        detail: "La collecte ouvre apres le recorder et le chemin d'upload protege.",
      },
      {
        label: "Transcription actuelle",
        value: "0 heure",
        detail: "La transcription reste d'abord relue par le porteur du projet pour garder un format coherent.",
      },
    ],
    previewTitle: "Ce que veut dire Start Recording aujourd'hui",
    previewBody:
      "Le bouton mene vers un apercu concret, car le recorder public n'est pas encore en ligne. La phase 2 ouvre l'entree contributeur et les prompts ; la phase 3 ouvre l'enregistrement et l'upload prive.",
    previewSteps: [
      "Entree legere avec nom, avatar et email facultatifs",
      "Prompt adapte a la variante comorienne choisie",
      "Upload WAV prive puis mise a jour publique apres revue",
    ],
  },
  trust: {
    eyebrow: "Confidentialite et confiance",
    title: "Open source en public, voix brutes en prive, consentement explique avec des mots simples.",
    description:
      "Le projet est pense comme un effort d'interet public pour la langue. Le code et les jalons restent visibles ; les enregistrements contribues restent prives pour revue, transcription et curation du dataset.",
    pillars: [
      {
        title: "Enregistrements prives",
        body: "Les audios bruts ne sont pas exposes sur le site public. Seuls les totaux de progression et le cadre du jalon sont visibles.",
      },
      {
        title: "Consentement calme",
        body: "Les contributeurs doivent comprendre ce qui arrive a leur voix avant d'enregistrer : stockage prive, revue par le porteur et usage futur pour l'entrainement.",
      },
      {
        title: "Credibilite open source",
        body: "La vitrine publique doit rassurer contributeurs, etudiants et soutiens avant meme l'arrivee d'un dispositif sponsor plus formel.",
      },
    ],
  },
  roadmap: {
    eyebrow: "Feuille de route",
    title: "La feuille de route reste visible, mais cette version garde la priorite sur la preparation des contributions.",
    description:
      "Les futures interactions modele sont importantes, mais la phase 1 reste disciplinee : mission publique, cadre de confiance et passage clair vers le recorder a venir.",
    phases: [
      {
        stage: "Maintenant",
        title: "Fondation publique et confiance",
        body: "Expliquer la mission, montrer l'objectif initial et rendre les attentes de confidentialite tres claires.",
      },
      {
        stage: "Ensuite",
        title: "Entree contributeur et prompts",
        body: "Ajouter l'identite facultative, le choix de variante et la livraison des phrases validees.",
      },
      {
        stage: "Apres",
        title: "Enregistrement, upload et progres public",
        body: "Ouvrir la soumission audio privee, les compteurs revus et le flux proprietaire de curation.",
      },
    ],
  },
  contact: {
    eyebrow: "Chemin de soutien",
    title: "Le soutien commence par la discussion, la visibilite du depot et une gouvernance claire.",
    description:
      "Les dons formels restent hors scope dans cette version. Le site public donne donc surtout une vision claire du projet et un chemin simple pour suivre le travail.",
    channels: [
      {
        title: "Coordination open source",
        body: "Le depot public et son futur espace de tickets doivent devenir le premier point pour collaborer, corriger et poser des questions.",
        action: "Depot public",
        hint: "Publier l'URL du depot avant le lancement.",
      },
      {
        title: "Preparation sponsor",
        body: "Cette page doit deja expliquer le jalon actuel, le cadre de confidentialite et pourquoi le dataset vocal est construit avec prudence.",
        action: "Brief sponsor",
        hint: "Ajouter une adresse email directe avant l'ouverture des demarches sponsor.",
      },
    ],
  },
} as const;

export default fr;
