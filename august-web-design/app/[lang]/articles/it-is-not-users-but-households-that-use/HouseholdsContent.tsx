export default function HouseholdsContent() {
  return (
    <>
      <p>We built August knowing that in India, health decisions are rarely individual. Someone in every family is the person who handles this: they book the appointments, interpret the lab results, translate what the doctor said at dinner. We built for that reality from the start. But when we analyzed 150 million messages across the platform, the scale of it surprised even us. This entire analysis was conducted using metadata alone, no additional personally identifiable or protected health information (PII/PHI) was used at any point.</p>
      <p>43% of all health queries where we can identify the subject aren&apos;t about the person asking. They&apos;re about someone else, a child, a parent, a spouse, a friend. If August has over six million registered users, then the number of people whose health is actively being navigated through the platform is likely closer to ten to twelve million. Every metric we&apos;ve used (as is industry norm) MAU, retention, outcomes, has been counting accounts, not people.</p>
      <p>Here&apos;s what the data actually looks like.</p>

      <h2>1 in 5 active users is a caregiver</h2>
      <p>We identified that roughly one in five of August&apos;s ~1.5 million active users, are those who consistently ask health questions on behalf of others. More than 30% of their queries are about a family member, and for many, that share is far higher.</p>
      <p>These are the people in every family who handle health. The one everyone texts when something feels off. The one who remembers the medications, interprets the lab results, books the follow-up.</p>
      <p>And it rarely stops at one person. 46% of the most active caregivers manage health queries for two or more family members. One in six are juggling three or more. They aren&apos;t dipping in to ask a one-off question about a relative. They are, functionally, the health operations layer for their household.</p>
      <p>Child health is the dominant concern by a wide margin: 36.5% of caregiver queries are about children. Parent care accounts for 16%, spouse care for 10%. The role skews toward younger families managing children&apos;s health, though a meaningful share are navigating the combination of child and elder care simultaneously.</p>

      <h2>Caregivers are our stickiest users</h2>
      <p>When we compare caregivers to self-care users on equal footing, same minimum activity threshold, same measurement window, caregivers show 41% longer median tenure. They send more messages per month. And the longer they stay, the more family members they tend to bring into their queries.</p>
      <p>Every caregiver we retain is effectively retaining an entire family&apos;s health engagement. We&apos;re acquiring one user but serving a household.</p>

      <h2>They&apos;re managing the most complex conditions with the least data</h2>
      <p>This is the finding that made us take a hard look at our own product, not because we didn&apos;t know caregivers existed, but because the gap between what they need and what we give them is wider than we&apos;d assumed.</p>
      <p>Caregivers ask about serious conditions at significantly higher rates than self-care users. They&apos;re more likely to be navigating diabetes (23.5% vs. 16.8%), cardiovascular disease (21.2% vs. 15.3%), and cancer (6.7% vs. 3.9%). They&apos;re also far more likely to need hospital companion support, guidance for navigating admissions, discharges, and treatment decisions on behalf of someone else.</p>
      <p>The pattern intensifies for those caring for aging parents. Among parent caregivers, 28.5% are asking about diabetes and 28.1% about cardiovascular disease. These are chronic conditions that require ongoing monitoring, medication adjustments, and clinical context to manage well.</p>
      <p>And here&apos;s the gap: caregivers upload lab reports at one-third the rate of self-care users. Just 3.6%, compared to 10.3%.</p>
      <p>The people handling the most complex health questions on our platform are doing so with the least clinical data. Some of this is access, you may not have your father&apos;s blood work on your phone. Some of it is situational: when you&apos;re sitting in a hospital waiting room asking about your mother&apos;s discharge, uploading a PDF isn&apos;t the first thing on your mind. The infrastructure exists, but the friction between a caregiver&apos;s real context and the product experience is still too wide. Establishing pipelines to leverage already existing data in health systems should help us solve for this, while also working on simplifying data upload to a larger extent.</p>

      <h2>Caregiving doesn&apos;t look different in the data, and maybe that&apos;s the point</h2>
      <p>We went looking for a behavioral signature that would distinguish caregivers from self-care users. Late-night sessions after the kids are in bed. Weekend catch-up spikes. Something we could use to detect and serve them better.</p>
      <p>We didn&apos;t find one. Caregivers and self-care users are active at almost exactly the same hours. Both groups peak at 3pm. Both maintain the same weekday-to-weekend ratio. Both send roughly the same number of messages per session.</p>
      <p>Managing a family&apos;s health isn&apos;t a separate activity that happens in stolen moments. It&apos;s interleaved with everything else, a question about your own back pain at 2pm, a question about your mother&apos;s blood pressure at 2:15, back to work at 2:20. There&apos;s no behavioral flag that says &quot;this person is doing extra work.&quot; The extra work just looks like regular usage. You only see it when you ask who the questions are actually about.</p>

      <h2>What comes next</h2>
      <p>Healthcare navigation in India is collective. It always has been, in waiting rooms, on the phone with pharmacists, at the dinner table after a doctor&apos;s visit. Digital platforms didn&apos;t create this role. We gave it a new interface. Now we need to actually design for it.</p>
      <p>Of our active user base, at least 20% are identifiable caregivers on August today, and certainly many more we can&apos;t yet detect. They are managing serious health decisions for their families with tools built for one person at a time.</p>
      <p>What that demands is straightforward: one account, multiple health profiles, shared context, proper data separation. A caregiver managing their child&apos;s asthma, their mother&apos;s diabetes, and their own migraines needs more than separate profiles, they need workflows that match how caregiving actually happens: quick context-switching, easier ways to get clinical data into the system when you&apos;re not the patient, and shared context that doesn&apos;t collapse into noise.</p>
      <p>We think the future of digital health in India, and probably well beyond India, belongs to whoever builds for the household. Not because it&apos;s a growth hack, but because that&apos;s how healthcare actually works in most of the world.</p>
    </>
  );
}
