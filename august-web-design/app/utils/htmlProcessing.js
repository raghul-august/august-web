export function stripBodyTag(html) {
  if (!html) return "";
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

export function extractFirstH1(html) {
  if (!html) return null;
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]*>/g, "").trim();
  }
  return null;
}

export function removeFirstH1(html) {
  if (!html) return html;
  return html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '');
}

function extractQuestionsWithRegex(regex, section) {
  const faqLabel = /^frequently\s+asked\s+questions$/i;
  const faq = [];
  let match;

  while ((match = regex.exec(section)) !== null) {
    const question = match[1].replace(/<[^>]*>/g, "").trim();
    const questionEnd = match.index + match[0].length;

    const peek = regex.exec(section);
    const answerEnd = peek ? peek.index : section.length;
    regex.lastIndex = questionEnd;

    const answerHtml = section.substring(questionEnd, answerEnd).trim();

    if (question && !faqLabel.test(question)) {
      faq.push({ question, answerHtml });
    }
  }
  return faq;
}

export function extractFAQandRest(html) {
  if (!html) return { restHtml: "", faq: [] };

  const faqRegex =
    /<h[1-6][^>]*>\s*frequently\s+asked\s+questions[^<]*<\/h[1-6]>/i;
  const faqMatch = html.match(faqRegex);

  if (!faqMatch) {
    return { restHtml: html, faq: [] };
  }

  const faqStartIndex = faqMatch.index;
  const faqHeading = faqMatch[0];

  const afterFaqHtml = html.substring(faqStartIndex + faqHeading.length);
  const endMatch = afterFaqHtml.match(/<h[12][^>]*>/i);
  const faqEndIndex = endMatch
    ? faqStartIndex + faqHeading.length + endMatch.index
    : html.length;

  const faqSection = html.substring(faqStartIndex, faqEndIndex);

  const restHtml =
    html.substring(0, faqStartIndex) + html.substring(faqEndIndex);

  // Try h3-h6 headings first, fall back to <p><strong> pattern
  const h3Faq = extractQuestionsWithRegex(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/gi, faqSection);
  const faq = h3Faq.length > 0 ? h3Faq
    : extractQuestionsWithRegex(/<p[^>]*>\s*<strong>(.*?)<\/strong>\s*<\/p>/gi, faqSection);

  if (!faq.length) return { restHtml: html, faq: [] };

  return { restHtml, faq };
}

export function relocateLeadingImage(html) {
  if (!html) return html;
  const trimmed = html.trim();
  const leadingImgMatch = trimmed.match(/^(<p[^>]*>\s*<img[^>]*>\s*<\/p>|<img[^>]*>)/i);
  if (!leadingImgMatch) return html;

  const imgBlock = leadingImgMatch[0];
  const restHtml = trimmed.slice(imgBlock.length).trim();

  const blockRegex = /<(?:p|h[2-6]|ul|ol|hr|div|blockquote)[^>]*>[\s\S]*?<\/(?:p|h[2-6]|ul|ol|hr|div|blockquote)>|<hr\s*\/?>/gi;
  let match;
  let count = 0;
  let insertIndex = 0;
  while ((match = blockRegex.exec(restHtml)) !== null) {
    count++;
    if (count === 3) {
      insertIndex = match.index + match[0].length;
      break;
    }
  }

  if (insertIndex === 0) return html;

  return restHtml.slice(0, insertIndex) + '\n' + imgBlock + '\n' + restHtml.slice(insertIndex);
}
