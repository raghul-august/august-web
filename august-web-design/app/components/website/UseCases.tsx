"use client";

import { useState, useRef } from "react";
import { track } from "@/app/utils/analytics";
import { TrackedCTA } from "./TrackedCTA";

const categories = [
  "Skin Conditions",
  "Mental Health",
  "Women's Health",
  "Digestive Health",
  "Bones, Joints & Muscles",
  "Urinary & Kidney",
  "Heart Health",
  "Diabetes & Endocrine",
];

const useCaseData: Record<
  string,
  {
    title: string;
    cards: {
      title: string;
      description: string;
      question: string;
      link: string;
    }[];
  }
> = {
  "Skin Conditions": {
    title: "Skin conditions",
    cards: [
      {
        title: "Lesion Analysis",
        description: "Differentiating between benign moles, suspicious spots, rashes, or acne.",
        question: "I noticed a new spot on my arm that looked a bit different from my other moles. Is it infected?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%20noticed%20a%20new%20spot%20on%20my%20arm%20that%20looked%20a%20bit%20different%20from%20my%20other%20moles.%20Is%20it%20infected%3F",
      },
      {
        title: "Allergy Identification",
        description: "Recognizing triggers like cosmetics, detergents, or environmental factors.",
        question: "I used a new face cream and I end up with red patches. Is it an allergy? What am I allergic to?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%20used%20a%20new%20face%20cream%20and%20I%20end%20up%20with%20red%20patches.%20Is%20it%20an%20allergy%3F%20What%20am%20I%20allergic%20to%3F",
      },
      {
        title: "Treatment Options",
        description: "Understanding when to use OTC treatments versus prescription medications.",
        question: "I\u2019ve had a rash that won\u2019t go away despite using over-the-counter creams\u2014should I see a doctor about it?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20had%20a%20rash%20that%20won%E2%80%99t%20go%20away%20despite%20using%20over-the-counter%20creams%E2%80%94should%20I%20see%20a%20doctor%20about%20it%3F",
      },
      {
        title: "Chronic Condition Management",
        description: "Ongoing care for conditions like eczema, psoriasis, or rosacea.",
        question: "I\u2019ve had eczema for years but it still flares up unpredictably. What should i do?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20had%20eczema%20for%20years%20but%20it%20still%20flares%20up%20unpredictably.%20What%20should%20i%20do%3F",
      },
    ],
  },

  "Mental Health": {
    title: "Mental health",
    cards: [
      {
        title: "Anxiety & Stress",
        description: "Managing daily anxiety, panic attacks, and stress-related symptoms.",
        question: "I\u2019ve been feeling very anxious lately. What can I do to manage my anxiety?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20feeling%20more%20anxious%20and%20down%20than%20usual.%20Is%20it%20stress%20or%20something%20more%20serious%3F",
      },
      {
        title: "Sleep Issues",
        description: "Understanding insomnia, sleep quality, and healthy sleep habits.",
        question: "I can\u2019t sleep well at night. What could be causing this?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20feeling%20more%20anxious%20and%20down%20than%20usual.%20Is%20it%20stress%20or%20something%20more%20serious%3F",
      },
      {
        title: "Mood Changes",
        description: "Exploring causes of mood swings, low mood, and emotional well-being.",
        question: "I\u2019ve been feeling really low and unmotivated. Should I be concerned?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20feeling%20more%20anxious%20and%20down%20than%20usual.%20Is%20it%20stress%20or%20something%20more%20serious%3F",
      },
      {
        title: "Burnout",
        description: "Recognizing and recovering from workplace and personal burnout.",
        question: "I feel constantly exhausted and detached from work. Is this burnout?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20feeling%20more%20anxious%20and%20down%20than%20usual.%20Is%20it%20stress%20or%20something%20more%20serious%3F",
      },
    ],
  },

  "Women's Health": {
    title: "Women's health",
    cards: [
      {
        title: "Reproductive Health",
        description: "Clarifying concerns about pregnancy symptoms, fertility issues, and contraception.",
        question: "I\u2019ve been spotting and cramping before my period and feeling emotional. Am I pregnant?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20spotting%20and%20cramping%20before%20my%20period%20and%20feeling%20emotional.%20Am%20I%20pregnant%3F",
      },
      {
        title: "Menopause Transition",
        description: "Managing hot flashes, mood changes, and long-term bone health.",
        question: "I\u2019m 52 and struggling with hot flashes and night sweats that are ruining my sleep. Is this normal for menopause?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20spotting%20and%20cramping%20before%20my%20period%20and%20feeling%20emotional.%20Am%20I%20pregnant%3F",
      },
      {
        title: "Menstrual & Hormonal Issues",
        description: "Evaluating irregular cycles, severe cramps, and hormonal imbalances.",
        question: "My periods are irregular, I\u2019m breaking out, and I\u2019ve gained weight. Is this PCOS? What\u2019s happening?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20spotting%20and%20cramping%20before%20my%20period%20and%20feeling%20emotional.%20Am%20I%20pregnant%3F",
      },
      {
        title: "Screening & Prevention",
        description: "Guidance on Pap smears, mammograms, and other preventive measures.",
        question: "I\u2019m 30 and unsure if I should get a mammogram. What happens in a mammogram and will it harm my body?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20spotting%20and%20cramping%20before%20my%20period%20and%20feeling%20emotional.%20Am%20I%20pregnant%3F",
      },
    ],
  },

  "Digestive Health": {
    title: "Digestive health",
    cards: [
      {
        title: "Symptom Assessment",
        description: "Differentiating between various causes of stomach pain, bloating, and acid reflux.",
        question: "I keep getting stomach pain and bloating after meals. I burp for few hours after eating. What\u2019s happening?",
        link: "https://www.meetaugust.ai/redirect/wa?message=When%20I%E2%80%99m%20stressed%2C%20my%20IBS%20gets%20worse.%20How%20can%20I%20manage%20it%20better%20in%20those%20moments%3F",
      },
      {
        title: "Long-Term Management",
        description: "Strategies for chronic conditions such as Crohn\u2019s disease or ulcerative colitis.",
        question: "When I\u2019m stressed, my IBS gets worse. How can I manage it better in those moments?",
        link: "https://www.meetaugust.ai/redirect/wa?message=When%20I%E2%80%99m%20stressed%2C%20my%20IBS%20gets%20worse.%20How%20can%20I%20manage%20it%20better%20in%20those%20moments%3F",
      },
      {
        title: "Diagnostic Testing",
        description: "Clarifying the need for endoscopies, colonoscopies, or abdominal imaging.",
        question: "My doctor says I might need an endoscopy. What happens in an endoscopy and is there an alternative?",
        link: "https://www.meetaugust.ai/redirect/wa?message=When%20I%E2%80%99m%20stressed%2C%20my%20IBS%20gets%20worse.%20How%20can%20I%20manage%20it%20better%20in%20those%20moments%3F",
      },
      {
        title: "Preventative Care",
        description: "Guidance on nutritional choices to avoid common gastrointestinal issues.",
        question: "Give me a list of food items and a meal plan to ensure that I don\u2019t have any gastric issues.",
        link: "https://www.meetaugust.ai/redirect/wa?message=When%20I%E2%80%99m%20stressed%2C%20my%20IBS%20gets%20worse.%20How%20can%20I%20manage%20it%20better%20in%20those%20moments%3F",
      },
    ],
  },

  "Bones, Joints & Muscles": {
    title: "Bones, Joints & Muscles",
    cards: [
      {
        title: "Pain Source Identification",
        description: "Determining the cause of joint or back pain (e.g., injury, arthritis).",
        question: "I\u2019ve been getting a tingling feeling in my legs. How do I know if it\u2019s from my nerves, spine, or something else?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20getting%20a%20tingling%20feeling%20in%20my%20legs.%20How%20do%20I%20know%20if%20it%E2%80%99s%20from%20my%20nerves%2C%20spine%2C%20or%20something%20else%3F",
      },
      {
        title: "Rehabilitation Processes",
        description: "Clarifying recovery timelines and post-treatment exercises to get better.",
        question: "If I get rotator cuff surgery, how long will recovery take and when can I get back to regular activities?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20getting%20a%20tingling%20feeling%20in%20my%20legs.%20How%20do%20I%20know%20if%20it%E2%80%99s%20from%20my%20nerves%2C%20spine%2C%20or%20something%20else%3F",
      },
      {
        title: "Imaging & Diagnosis",
        description: "Explaining the role of X-rays, MRIs, or CT scans. And the differences between them.",
        question: "My doctor wants me to get an MRI to figure out why my ankle still hurts months after an injury. Why not an X-Ray?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20getting%20a%20tingling%20feeling%20in%20my%20legs.%20How%20do%20I%20know%20if%20it%E2%80%99s%20from%20my%20nerves%2C%20spine%2C%20or%20something%20else%3F",
      },
      {
        title: "Injury Prevention",
        description: "Ergonomic advice and proper exercise techniques to avoid recurring injuries.",
        question: "I\u2019ve been feeling a tightness on my thigh during runs. Could it be an IT band issue and how can I prevent it?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%E2%80%99ve%20been%20getting%20a%20tingling%20feeling%20in%20my%20legs.%20How%20do%20I%20know%20if%20it%E2%80%99s%20from%20my%20nerves%2C%20spine%2C%20or%20something%20else%3F",
      },
    ],
  },

  "Urinary & Kidney": {
    title: "Urinary & Kidney",
    cards: [
      {
        title: "Symptom Differentiation",
        description: "Identifying signs of UTIs versus kidney stones or prostate issues.",
        question: "I\u2019m having trouble starting to urinate, and the stream feels weak. Do I have renal disease or an infection?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%27m%20having%20trouble%20starting%20to%20urinate%2C%20and%20the%20stream%20feels%20weak.%20Do%20I%20have%20renal%20disease%20or%20an%20infection%3F",
      },
      {
        title: "Long-Term Management",
        description: "Practice strategies for chronic kidney disease or preventing recurrent issues.",
        question: "I\u2019ve been diagnosed with early-stage chronic kidney disease. Is this terminal? Will I need dialysis?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%27m%20having%20trouble%20starting%20to%20urinate%2C%20and%20the%20stream%20feels%20weak.%20Do%20I%20have%20renal%20disease%20or%20an%20infection%3F",
      },
      {
        title: "Diagnostic Tests",
        description: "Explaining urine tests, ultrasounds, or CT scans to interpret the findings.",
        question: "What\u2019s the difference between an ultrasound and a CT scan for checking out kidney stones?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%27m%20having%20trouble%20starting%20to%20urinate%2C%20and%20the%20stream%20feels%20weak.%20Do%20I%20have%20renal%20disease%20or%20an%20infection%3F",
      },
      {
        title: "Preventive Practices",
        description: "Hygiene tips and lifestyle adjustments to reduce infection risk.",
        question: "My friends have claimed drinking beer and alcohol help in reducing kidney stones. Is it true?",
        link: "https://www.meetaugust.ai/redirect/wa?message=I%27m%20having%20trouble%20starting%20to%20urinate%2C%20and%20the%20stream%20feels%20weak.%20Do%20I%20have%20renal%20disease%20or%20an%20infection%3F",
      },
    ],
  },

  "Heart Health": {
    title: "Heart Health",
    cards: [
      {
        title: "Symptom Evaluation",
        description: "Distinguishing between chest pain types, palpitations, and shortness of breath.",
        question: "Hey August, I\u2019ve been feeling this weird chest pain now and then. Should I be really worried about it?",
        link: "https://www.meetaugust.ai/join/wa?message=Hey%20August%2C%20I%27ve%20been%20feeling%20this%20weird%20chest%20pain%20now%20and%20then.%20Should%20I%20be%20really%20worried%20about%20it%3F",
      },
      {
        title: "Medication Concerns",
        description: "Managing side effects, interactions, and the right medication for your heart condition.",
        question: "I started taking beta-blockers for my heart, but I\u2019m noticing some side effects. Is it normal to feel a bit off?",
        link: "https://www.meetaugust.ai/join/wa?message=Hey%20August%2C%20I%27ve%20been%20feeling%20this%20weird%20chest%20pain%20now%20and%20then.%20Should%20I%20be%20really%20worried%20about%20it%3F",
      },
      {
        title: "Diagnostic Clarification",
        description: "Interpreting blood pressure readings, cholesterol levels, and ECG results.",
        question: "Hey August, My HDL is 55, my LDL is 140, and my triglycerides are at 180. What should I do? I\u2019m confused.",
        link: "https://www.meetaugust.ai/join/wa?message=Hey%20August%2C%20I%27ve%20been%20feeling%20this%20weird%20chest%20pain%20now%20and%20then.%20Should%20I%20be%20really%20worried%20about%20it%3F",
      },
      {
        title: "Lifestyle Adjustments",
        description: "Modifying diet (e.g., low-sodium) and exercise routines for heart health.",
        question: "I recently recovered from a stroke. Please provide me a diet and exercise plan for better cardiovascular health.",
        link: "https://www.meetaugust.ai/join/wa?message=Hey%20August%2C%20I%27ve%20been%20feeling%20this%20weird%20chest%20pain%20now%20and%20then.%20Should%20I%20be%20really%20worried%20about%20it%3F",
      },
    ],
  },

  "Diabetes & Endocrine": {
    title: "Diabetes & Endocrine",
    cards: [
      {
        title: "Blood Sugar Monitoring",
        description: "Interpreting A1c, daily glucose variations, and over 4000+ biomarkers.",
        question: "My A1c came back at 7.5%, and my daily sugar levels feel unpredictable. How should I track it?",
        link: "https://www.meetaugust.ai/redirect/wa?message=My%20A1c%20came%20back%20at%207.5%25%2C%20and%20my%20daily%20sugar%20levels%20feel%20unpredictable.%20How%20should%20I%20track%20it%3F",
      },
      {
        title: "Diet & Exercise",
        description: "Crafting meal plans and physical activity tailored to aid your medical condition.",
        question: "I have hypothyroidism. Can you please provide me a diet and exercise plan for helping me with my thyroid?",
        link: "https://www.meetaugust.ai/redirect/wa?message=My%20A1c%20came%20back%20at%207.5%25%2C%20and%20my%20daily%20sugar%20levels%20feel%20unpredictable.%20How%20should%20I%20track%20it%3F",
      },
      {
        title: "Therapeutic Decisions",
        description: "Choose between injections & oral medications, while understanding the pros & cons.",
        question: "With my rising A1c levels, my doctor has prescribed me injections instead of oral meds. What do I do?",
        link: "https://www.meetaugust.ai/redirect/wa?message=My%20A1c%20came%20back%20at%207.5%25%2C%20and%20my%20daily%20sugar%20levels%20feel%20unpredictable.%20How%20should%20I%20track%20it%3F",
      },
      {
        title: "Long-Term Management",
        description: "Adjusting treatment over time and recognising warning signs of anything detrimental.",
        question: "My T3 and TSH has been creeping up over the past few months. Should I be concerned?",
        link: "https://www.meetaugust.ai/redirect/wa?message=My%20A1c%20came%20back%20at%207.5%25%2C%20and%20my%20daily%20sugar%20levels%20feel%20unpredictable.%20How%20should%20I%20track%20it%3F",
      },
    ],
  },
};

// Default data for categories without specific content
const defaultCards = [
  {
    title: "Symptom Assessment",
    description: "Understanding your symptoms and possible causes.",
    question: "I have some concerning symptoms. Can you help me understand what might be going on?",
    link: "https://www.meetaugust.ai/redirect/wa?message=I%20have%20some%20concerning%20symptoms.%20Can%20you%20help%20me%20understand%20what%20might%20be%20going%20on%3F",
  },
  {
    title: "Treatment Guidance",
    description: "Exploring treatment options and next steps.",
    question: "What treatment options are available for my condition?",
    link: "https://www.meetaugust.ai/redirect/wa?message=What%20treatment%20options%20are%20available%20for%20my%20condition%3F",
  },
  {
    title: "Prevention Tips",
    description: "Preventive care and lifestyle recommendations.",
    question: "How can I prevent this condition from getting worse?",
    link: "https://www.meetaugust.ai/redirect/wa?message=How%20can%20I%20prevent%20this%20condition%20from%20getting%20worse%3F",
  },
  {
    title: "When to See a Doctor",
    description: "Knowing when professional medical attention is needed.",
    question: "Should I see a doctor about my symptoms?",
    link: "https://www.meetaugust.ai/redirect/wa?message=Should%20I%20see%20a%20doctor%20about%20my%20symptoms%3F",
  },
];

export function UseCases({ initialCountry }: { initialCountry?: string | null }) {
  const [activeCategory, setActiveCategory] = useState("Skin Conditions");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragStartPos = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    dragStartPos.current = e.pageX;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const data = useCaseData[activeCategory] || {
    title: activeCategory.toLowerCase(),
    cards: defaultCards,
  };

  return (
    <section id="usecases" className="py-12 sm:py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-base sm:text-xl font-semibold text-primary-400 mb-4">
            Use cases
          </p>
          <h2 className="text-[28px] sm:text-4xl font-semibold leading-[1.2] tracking-[-0.96px] text-dark mb-4">
            See how others use August
          </h2>
          <p className="text-base text-[#595959] font-medium max-w-[636px] mx-auto">
            Real people, real questions. See how August supports 5 Million
            users on their health journey.
          </p>
        </div>

        {/* Category Tabs */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`overflow-x-auto scrollbar-hide sm:[&::-webkit-scrollbar]:block sm:[&::-webkit-scrollbar]:h-[6px] sm:[&::-webkit-scrollbar-track]:bg-gray-100 sm:[&::-webkit-scrollbar-track]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-gray-300 sm:[&::-webkit-scrollbar-thumb]:rounded-full sm:[scrollbar-width:thin] sm:[scrollbar-color:#d1d5db_#f3f4f6] pb-4 mb-8 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          <div className="flex gap-2 w-fit">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={(e) => {
                  if (Math.abs(e.pageX - dragStartPos.current) > 5) {
                    e.preventDefault();
                    return;
                  }
                  setActiveCategory(cat);
                  track("pill_click", {
                    button_name: cat,
                    section: "use_cases",
                  });
                }}
                className={`px-4 py-2 rounded-pill transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeCategory === cat
                    ? "bg-[#f4f5f5] text-[#141515] text-sm font-semibold border-[1.5px] border-[#141515]"
                    : "bg-transparent text-[#111111] text-sm font-medium border border-[#cacEcd] hover:border-[#141515]/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Category Content */}
        <div className="mb-4">
          <p className="text-lg text-dark">
            <span className="font-semibold">{activeCategory}</span>
            {" "}
            <span className="text-[#595959]">related queries users ask:</span>
          </p>
        </div>

        {/* Cards Grid - horizontal scroll on mobile */}
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {data.cards.map((card, cardIndex) => (
            <a
              key={card.title}
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track("card_click", {
                  position: String(cardIndex + 1),
                  section: "use_cases",
                })
              }
              className="group flex flex-col bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-card transition-shadow flex-shrink-0 w-[80vw] snap-start sm:w-auto sm:flex-shrink min-h-[420px]"
            >
              <div className="mb-4">
                <div className="w-10 h-10 rounded-lg bg-lime-light flex items-center justify-center mb-4">
                  <svg
                    width="18"
                    height="21"
                    viewBox="-1 -1 18 21"
                    fill="none"
                  >
                    <path
                      d="M5 10.0001L7 12.0001L11 8.00007M7.19836 0.850791L1.19836 3.47579C0.470388 3.79428 0 4.51351 0 5.30811V11.0001C0 15.4184 3.58172 19.0001 8 19.0001C12.4183 19.0001 16 15.4184 16 11.0001V5.30811C16 4.51351 15.5296 3.79428 14.8016 3.47579L8.80164 0.850791C8.2906 0.62721 7.7094 0.62721 7.19836 0.850791Z"
                      stroke="#08907C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-dark mb-1">{card.title}</p>
                <p className="text-sm text-[#595959]">{card.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex-1">
                <p className="text-sm text-dark/80">{card.question}</p>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-[#737373] font-semibold bg-gray-100 rounded px-1.5 py-0.5">AU</span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-dark/20 rounded-full" />
                  <span className="w-1.5 h-1.5 bg-dark/20 rounded-full" />
                  <span className="w-1.5 h-1.5 bg-dark/20 rounded-full" />
                </span>
              </div>

              <div className="mt-3 border border-primary-500 rounded-pill py-2.5 text-center text-sm font-medium text-primary-500 group-hover:bg-primary-500/5 transition-colors">
                Try this question
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center mt-10 gap-3">
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 500, lineHeight: '150%', color: '#1D1D1D' }}>Get free health answers now</p>
          <TrackedCTA
            href="https://www.meetaugust.ai/join/wa?message=Hello%20August&utm=page_cta"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base px-6 py-3 rounded-5xl transition-colors font-[family-name:var(--font-geist)]"
            button_name="use_cases"
            button_copy="Talk To August Now"
            initialCountry={initialCountry}
          >
            Talk To August Now
          </TrackedCTA>
        </div>
      </div>
    </section>
  );
}
