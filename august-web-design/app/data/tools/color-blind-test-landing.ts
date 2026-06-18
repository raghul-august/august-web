// Landing copy for the Color Blind Test tool.
// Plain TypeScript — no React, no JSX.

export const EXPECTATIONS = [
  {
    bold: "12 quick plates",
    rest: "of dot patterns to identify, similar to a classic Ishihara color vision screen.",
  },
  {
    bold: "~2 minutes",
    rest: "to complete. Anonymous and processed entirely in your browser.",
  },
  {
    bold: "Screening, not diagnosis",
    rest: ". You'll get a result tier and a likely deficiency pattern, plus what to do next.",
  },
];

export const CALIBRATION_TIPS = [
  "Turn your screen brightness up to 100%.",
  "Disable any blue-light filter (Night Shift, f.lux) for the duration of the test.",
  "Sit at arm's length and view the test in a well-lit room (avoid direct sunlight on the screen).",
  "Don't wear tinted lenses or color-correcting glasses while testing.",
];

export const FAQ_ITEMS = [
  {
    q: "Is this a medical diagnosis?",
    a: "No. This is an online screening tool. A definitive color vision diagnosis requires a clinical exam with calibrated equipment (such as the Ishihara plate book under controlled lighting, the Hardy-Rand-Rittler test, or an anomaloscope). Online tests are sensitive to your screen, lighting and viewing distance.",
  },
  {
    q: "How accurate is an online color-blind test?",
    a: "Online Ishihara-style tests can flag the most common red-green deficiencies fairly reliably, but they're less reliable for tritan (blue-yellow) deficiency and for distinguishing protanopia from deuteranopia. Treat the result as a starting point.",
  },
  {
    q: "What are the main types of color vision deficiency?",
    a: "Red-green deficiencies are the most common deuteranopia/deuteranomaly (green-cone) affects roughly 6% of men of European descent, and protanopia/protanomaly (red-cone) affects about 2%. Tritanopia (blue-yellow) is rare (~0.01%). Total color blindness (monochromacy) is extremely rare.",
  },
  {
    q: "Why do I see different numbers on different attempts?",
    a: "Online tests vary by screen calibration, ambient lighting, and even browser color profile. If your result changes between attempts, the most likely answer is the most consistent one and an eye-care professional can confirm definitively.",
  },
  {
    q: "Is there a treatment for color blindness?",
    a: "Inherited color vision deficiency has no cure, but adaptive strategies (apps that label colors, color-correcting glasses, labeling systems) help many people. Acquired deficiencies from disease or medication can sometimes be reversed by treating the underlying cause.",
  },
];
