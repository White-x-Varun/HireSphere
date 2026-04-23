// ATS Analysis Logic
// Extracts keywords from job description, compares with resume text
// Score = (matched keywords / total keywords) * 100

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "up", "about", "into", "through", "during", "before",
  "after", "above", "below", "between", "out", "off", "over", "under", "again",
  "further", "then", "once", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "need", "dare", "ought", "used",
  "not", "no", "nor", "so", "yet", "both", "either", "neither", "each",
  "few", "more", "most", "other", "some", "such", "than", "too", "very",
  "just", "your", "my", "our", "their", "its", "his", "her", "we", "they",
  "you", "he", "she", "it", "i", "me", "him", "us", "them", "what", "which",
  "who", "when", "where", "why", "how", "all", "any", "both", "each", "this",
  "that", "these", "those", "am", "as", "if"
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s\+#\.]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

export interface AtsAnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
}

export function analyzeResume(resumeText: string, jobDescription: string): AtsAnalysisResult {
  const jobKeywords = tokenize(jobDescription);
  const resumeKeywords = tokenize(resumeText);

  const totalKeywords = jobKeywords.size;
  if (totalKeywords === 0) {
    return { score: 0, matchedKeywords: [], missingKeywords: [], totalKeywords: 0 };
  }

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jobKeywords) {
    if (resumeKeywords.has(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const score = Math.round((matchedKeywords.length / totalKeywords) * 100);

  return { score, matchedKeywords, missingKeywords, totalKeywords };
}
