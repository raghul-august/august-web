import Image from 'next/image';
export default function HealthBenchContent() {
  return (
    <>
      <p>Safety is probably the most important factor in healthcare. An AI assistant or agent that the user can't trust to be 100% safe is genuinely dangerous.</p>
      <p>It's something we've been very conscious about from the beginning at August AI. A person's health shouldn't ever be taken lightly. And over the years we've continuously improved August's performance on safety and accuracy.</p>
      <p>But saying that isn't enough, we need an objective measurement.</p>
      <p>There aren't many good public benchmarks for testing AI capabilities in healthcare, and even fewer that can be used to demonstrate safety specifically.</p>
      <p>The best option is HealthBench, which OpenAI launched in May last year. It's a dataset of 5,000 health conversations that we can test AI assistants against. It has its limitations, which we'll get to in a little bit. We focused specifically on a subset called HealthBench Consensus, and looked at 138 conversations that involved emergency escalations.</p>

      <h2>The results</h2>
      <p>August scored a perfect 1.00 on both recall (identifying all emergencies correctly) and precision (identifying all non-emergencies correctly).</p>
      <p>In comparison, generalized AI like ChatGPT and Gemini do perfectly on escalating all emergencies, but their precision is terrible, as shown in the chart below.</p>
      <Image
        src="/benchmarks/emergency-escalation.png"
        alt="Emergency escalation precision chart comparing August to ChatGPT and Gemini"
        width={800}
        height={400}
        style={{ width: '100%', height: 'auto' }}
      />

      <h2>The implications</h2>
      <p>What the data shows us is that general AI assistants are extremely cautious, which is a good starting point. But they also escalate a lot of non-emergencies, which leads to wasting clinician time and a much worse experience for the user.</p>
      <p>We ran into this about two and a half years ago. It's very easy to just say &quot;go see a doctor&quot; in response to every user query. But to build a health AI that's actually usable and helpful, we needed to get it right every time, not just play it safe.</p>
      <p>Our advantage is that we've had millions of user messages and conversations over years that are specifically about health. We've seen every single edge case and failure mode.</p>
      <p>So we've built guardrails at every level, from the system prompt to sanitizing outputs. While at the same time relentlessly focusing on precision and accuracy for all health queries. And we're not satisfied yet.</p>

      <h2>Why a perfect score isn't enough</h2>
      <p>Like we mentioned earlier, there are limitations to existing benchmarks, both public ones and what we've built for internal use.</p>
      <p>The real world is hard and you can never guarantee a perfect result, even with the best doctor or healthcare team. It's a fundamental truth that the medical fraternity faces every day.</p>
      <p>So when we see that August is getting really good at a set of evals and benchmarks that we have, we shift the goalposts. We find new ways to make it more challenging and have the AI struggle again, which helps us figure out where we can do even better.</p>
      <p>Over the course of this year, we're planning to run more public benchmarks. We decided to start with emergency scenarios in HealthBench since those are the most safety-critical situations that a user might face. But as we go along, we're going to cover all kinds of test cases, with a focus on messy real-world conversations with patients.</p>
      <p>When perfection is impossible, a perfect score just means we need harder tests.</p>

      <h2>Notes on testing methodology</h2>
      <p>We modelled our emergency safety testing on Counsel AI's triage assessment for AI systems, which is based on OpenAI's HealthBench dataset.</p>
      <p>Specifically, it looks at the HealthBench Consensus subset, which comprises a little over 3,600 scenarios where at least two doctors were in agreement.</p>
      <p>From that set, 453 conversations categorized by physicians as emergency-related were extracted.</p>
      <ul>
        <li>Conditional emergency cases, where information not in the conversation might indicate an emergency, were excluded.</li>
        <li>Non-English prompts were removed, to keep a fair comparison across AI models.</li>
        <li>Scenarios where the user is presenting a health query for someone else (such as a relative or a friend) were also discarded.</li>
      </ul>
      <p>That left us with a set of 138 emergency-related scenarios.</p>
      <p>We gave those one at a time to August and assessed its responses to see whether it identified the scenario as needing an emergency escalation or not:</p>
      <ul>
        <li>Where August recommended the user see a doctor immediately or as soon as possible, we recorded that response as an emergency escalation.</li>
        <li>Where August gave the user information and suggested consulting a doctor as well, we recorded the response as not an escalation.</li>
      </ul>
      <p>We then compared August's responses (escalation vs no escalation) to the consensus physician rubrics in HealthBench for those 138 scenarios. A score of 1.00 indicates a perfect match.</p>
      <p>All testing was conducted on the public version of August.</p>
    </>
  );
}
