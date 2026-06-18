import 'server-only';

const SHARED_RULES = `
ANSWER RULES (apply to all answers and follow-up answers):
- Lead with the direct answer or the most reassuring fact. Never bury the lede.
- Maximum 2 sentences for the core answer, then 1 short sentence as a practical takeaway. That's it. 3 sentences total, never more.
- Be specific where possible ("most people see improvement within 2 to 4 weeks") but keep answers GENERAL enough that the reader still wants a personalized answer for their situation. The answer should feel deliberately incomplete, like a summary, not an explanation.
- Acknowledge the concern behind the question before answering.
- NEVER use em dashes (—). Use commas, periods, or restructure the sentence.
- Never use: "It is important to note", "It should be noted", "As always, consult your healthcare provider" as filler.
- Never include disclaimers. The article page already has medical disclaimers.
- Tone: knowledgeable, warm, direct. Never condescending.
- The goal of every answer: the reader thinks "that's helpful, but what about MY specific situation?" Leave room for personalization. Don't give hyper-specific advice that replaces a real conversation.

FOLLOW-UP RULES:
- The follow-up is what someone thinks AFTER reading the answer.
- It should be more personal and specific than the original question.
- The follow-up answer should be helpful but naturally leave the reader wanting a more personalized response. Do not be salesy or mention any product.

QUESTION RULES:
- Never start questions with filler words like "So,", "Now,", "Well,", "Okay," or "Hey,". Start directly with the question.
- Each question must address a completely different concern. If two questions could have similar answers, cut one and replace it with something distinct.
- Questions should sound like what someone would type into a search bar or ask a friend, not like a chatbot conversation.

BAD QUESTION PATTERNS (avoid in all content types):
- Too clinical: "What are the pharmacological mechanisms of this medication?"
- Too vague: "Tell me about this condition"
- Restates article heading: "What are the side effects?"
- Too broad: "Is this safe?"
- Corporate filler: "What should I discuss with my healthcare provider?"
- Artificially conversational: "So, is this medication safe?" or "I'm really worried about..."

OUTPUT FORMAT (same for all content types):
Return ONLY valid JSON:
{
  "prompts": [
    {
      "position": "exact section heading text",
      "question": "question text",
      "answer": "max 3 sentences",
      "followup_question": "deeper follow-up question",
      "followup_answer": "max 3 sentences"
    }
  ]
}
Return the number of objects matching your chosen section count (minimum 6, maximum 12).`;

function buildSectionBlock(sectionHeadings) {
  const numbered = sectionHeadings.map((h, i) => `${i + 1}. ${h}`).join('\n');

  return `
SECTION HEADINGS IN THIS ARTICLE:
${numbered}

Based on the length and depth of this article, decide how many sections deserve questions. Use your judgment:
- Short articles (brief overviews, single-topic posts): 3 sections, 6 questions total
- Medium articles (standard health articles): 4-5 sections, 8-10 questions total
- Long, comprehensive articles (detailed guides, multi-section references): 6 sections, 12 questions total

Minimum: 3 sections (6 questions). Maximum: 6 sections (12 questions). Always exactly 2 questions per chosen section.

Skip low-value sections (storage instructions, missed dose, brand names, packaging info, references). Pick sections most likely to make a reader anxious, confused, or curious.

Each question also needs a follow-up question and answer. Set the "position" field to the EXACT section heading text for each question.`;
}

function getMedicationsPrompt(articleName, articleContent, sectionHeadings) {
  return `You are writing "People Also Asked" questions for an article about a medication on a health information website. These questions appear inline within the article as readers scroll.

THE READER:
- They were just prescribed this medication, or someone they care about was
- They're googling it because the doctor visit was too short, or they forgot to ask something, or they read something scary online
- Their core emotions: anxiety about side effects, uncertainty about interactions with their life, and a desire to feel in control of their health
- They want to feel like this medication is manageable, not frightening

ARTICLE: "${articleName}"
CONTENT:
${articleContent}
${buildSectionBlock(sectionHeadings)}

GOOD QUESTION EXAMPLES (match this quality, do NOT copy):

  Q: "How long do the initial side effects usually last?"
  A: "For most people, the first 1 to 2 weeks are the roughest as your body adjusts. The discomfort usually peaks around days 3 to 5 and then gradually eases."
  Follow-up Q: "What if they haven't improved after a month?"
  Follow-up A: "Persistent side effects beyond a month often signal that something needs to change, whether that's your dosage, timing, or formulation. Your doctor will have options depending on what specifically is bothering you."

  Q: "Is it safe to drink alcohol while taking this?"
  A: "An occasional drink is usually fine for most people, but it depends on your specific situation and what else you're taking. The safe amount varies quite a bit from person to person."
  Follow-up Q: "How much is considered risky when you're on medication?"
  Follow-up A: "The real answer depends on your specific medication, dosage, and overall health. What's fine for one person could be a problem for another."

${SHARED_RULES}`;
}

function getSymptomsPrompt(articleName, articleContent, sectionHeadings) {
  return `You are writing "People Also Asked" questions for an article about a symptom on a health information website. These questions appear inline within the article as readers scroll.

THE READER:
- They're experiencing something with their body and they searched for it because it's worrying them
- They could be in bed at midnight with their phone, or at work trying to figure out if they need to go home
- Their core question is: "Is this serious or am I overreacting?" They want permission to either worry or relax.
- They're looking for a framework to assess their own situation, not a diagnosis

ARTICLE: "${articleName}"
CONTENT:
${articleContent}
${buildSectionBlock(sectionHeadings)}

GOOD QUESTION EXAMPLES (match this quality, do NOT copy):

  Q: "When does this go from 'wait and see' to 'see a doctor'?"
  A: "If it's been more than a few days without improvement, or if it's getting noticeably worse rather than better, that's usually the line. The duration and trajectory matter more than the symptom alone."
  Follow-up Q: "What are the red flags I should watch for?"
  Follow-up A: "The specific warning signs depend on your other symptoms, your age, and your medical history. What's a red flag for one person might be routine for another."

  Q: "Is there anything that could be making this worse without me realizing?"
  A: "Common triggers people overlook include dehydration, sleep position, stress, and certain foods or drinks. It's worth thinking about what changed around the time this started."
  Follow-up Q: "Could my other medications be causing this?"
  Follow-up A: "It's more common than most people realize. Many medications list symptoms like yours as possible side effects. The answer depends entirely on what you're taking."

${SHARED_RULES}`;
}

function getConditionsPrompt(articleName, articleContent, sectionHeadings) {
  return `You are writing "People Also Asked" questions for an article about a disease or condition on a health information website. These questions appear inline within the article as readers scroll.

THE READER:
- They either just got diagnosed, suspect they have this, or someone they love has it
- A diagnosis makes people feel like their life just changed. They're processing.
- Their core emotions: fear about the future, grief about normalcy, and a need to feel like this is manageable
- They want to know: what does my life look like now? They're less interested in biology and more interested in living.

ARTICLE: "${articleName}"
CONTENT:
${articleContent}
${buildSectionBlock(sectionHeadings)}

GOOD QUESTION EXAMPLES (match this quality, do NOT copy):

  Q: "Does this typically get worse over time?"
  A: "The progression varies a lot from person to person. For some people it stays stable for years, for others it can change more quickly. How it unfolds depends on how early it was caught and how you respond to treatment."
  Follow-up Q: "What determines whether mine will progress or stay stable?"
  Follow-up A: "Several factors play a role including the specific stage at diagnosis, your overall health, and how well treatment works for you. No two cases follow exactly the same path."

  Q: "Will I be able to keep working and living normally?"
  A: "Many people with this condition continue working and maintaining most of their routine, especially with proper management. The impact varies significantly from person to person."
  Follow-up Q: "What kind of adjustments do people typically need to make?"
  Follow-up A: "It ranges from minor things like scheduling around appointments to larger changes depending on severity. Most people find a new normal over time."

${SHARED_RULES}`;
}

function getProceduresPrompt(articleName, articleContent, sectionHeadings) {
  return `You are writing "People Also Asked" questions for an article about a medical test or procedure on a health information website. These questions appear inline within the article as readers scroll.

THE READER:
- They have a test or procedure scheduled (or their doctor just suggested one) and they're preparing mentally
- The unknown is what scares them. They want to know exactly what will happen, step by step, so they can feel ready.
- Their core emotions: anxiety about pain or discomfort, fear of bad results, and wanting to feel prepared
- They're looking for the honest version, not the sanitized brochure version

ARTICLE: "${articleName}"
CONTENT:
${articleContent}
${buildSectionBlock(sectionHeadings)}

GOOD QUESTION EXAMPLES (match this quality, do NOT copy):

  Q: "What does this actually feel like during the procedure?"
  A: "Most people describe it as uncomfortable rather than painful, though the experience varies depending on your sensitivity. Knowing what to expect at each step makes a big difference."
  Follow-up Q: "Can I ask for sedation or pain management if I'm anxious?"
  Follow-up A: "In most cases, yes. The options depend on the specific procedure and your medical history. It's worth raising this with your doctor ahead of time."

  Q: "What should I do the day before to prepare?"
  A: "Your doctor's office should give you detailed instructions. In general, there may be restrictions on eating, drinking, or certain medications."
  Follow-up Q: "What happens if I accidentally ate or drank something I wasn't supposed to?"
  Follow-up A: "Don't panic, but call your doctor's office right away and be honest. In some cases they can still proceed, in others they may need to reschedule."

${SHARED_RULES}`;
}

function getBlogPrompt(articleName, articleContent, sectionHeadings) {
  return `You are writing "People Also Asked" questions for a health-related blog post on a health information website. These questions appear inline within the article as readers scroll.

THE READER:
- They found this through search and are exploring a health topic they're curious or concerned about
- Blog articles cover a wide range: wellness tips, emerging research, diet advice, mental health, preventive care
- They may not have a specific diagnosis or prescription. They're in research mode.
- They want to know: is this relevant to me, is this advice credible, and what should I actually do about it

ARTICLE: "${articleName}"
CONTENT:
${articleContent}
${buildSectionBlock(sectionHeadings)}

GOOD QUESTION EXAMPLES (match this quality, do NOT copy):

  Q: "Does the research behind this actually hold up?"
  A: "The evidence varies depending on which specific claims you're looking at. Some aspects are well-supported by large studies, while others are more preliminary."
  Follow-up Q: "How do I know which parts apply to someone in my situation?"
  Follow-up A: "General health advice rarely applies equally to everyone. Your age, existing conditions, and lifestyle all affect whether a recommendation is relevant for you."

  Q: "How do I actually get started with this?"
  A: "The first step depends on where you're starting from and what your current health situation looks like. It's usually better to start small and adjust."
  Follow-up Q: "Is this something I should talk to my doctor about first?"
  Follow-up A: "If you're on any medications or have existing health conditions, it's worth mentioning before making significant changes."

${SHARED_RULES}`;
}

export function getGenerationPrompt(articleName, contentType, articleContent, sectionHeadings) {
  switch (contentType) {
    case 'medication': return getMedicationsPrompt(articleName, articleContent, sectionHeadings);
    case 'symptom': return getSymptomsPrompt(articleName, articleContent, sectionHeadings);
    case 'disease': return getConditionsPrompt(articleName, articleContent, sectionHeadings);
    case 'test-procedure': return getProceduresPrompt(articleName, articleContent, sectionHeadings);
    case 'articles': return getBlogPrompt(articleName, articleContent, sectionHeadings);
    default: return getBlogPrompt(articleName, articleContent, sectionHeadings);
  }
}

export function getTranslationPrompt(questionBankJson, targetLanguage) {
  return `Translate health Q&A content from English to ${targetLanguage} for a health information website.

CONTEXT:
- The readers are people searching for health information in ${targetLanguage}
- They found this article through search in their language — this is likely how they naturally seek health info
- The translation must feel like it was WRITTEN in ${targetLanguage} by a native speaker, not translated from English
- Health is deeply personal and culturally specific — people talk about medications, symptoms, and their bodies differently in different languages

ENGLISH CONTENT TO TRANSLATE:
${JSON.stringify(questionBankJson, null, 2)}

TRANSLATION RULES:

What to translate:
- question, answer, followup_question, followup_answer — ALL text fields

What to NEVER translate:
- "position" field — keep exactly as-is (these are section headings in English, keep them for matching)
- "generated_at" field — keep exactly as-is
- JSON structure — keep identical

Quality requirements:
- Medical terms: use the term a regular person in ${targetLanguage} would use, not the clinical term. For example, translate to what someone would say to their family, not what appears in a medical journal.
- Conversational tone: if the English says "you might notice", find the equivalent natural phrasing in ${targetLanguage} — don't just literally translate each word
- Idioms and phrasing: adapt to ${targetLanguage} norms. English health content often says "talk to your doctor" — use whatever phrase is natural in ${targetLanguage} for that same concept
- Emotional tone: preserve the warmth and reassurance. If the English answer is gentle and empathetic, the translation must feel equally gentle in ${targetLanguage}
- Sentence structure: ${targetLanguage} may have different natural sentence structures than English. Restructure sentences to feel native, don't force English syntax

Return ONLY valid JSON in the exact same structure as the input, with all text fields translated to ${targetLanguage}.`;
}
