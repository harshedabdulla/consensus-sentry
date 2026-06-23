import type { BiasVariant } from "@/app/components/ui/status-tag";

export type ModelResponse = {
  /** Display label for the model, e.g. "GPT-4o". */
  model: string;
  status: BiasVariant;
  /** ~60–90 words. Shown in full; no truncation, no fade. */
  text: string;
};

export type BiasExample = {
  /** Short label shown in the segmented selector, e.g. "Kashmir". */
  topic: string;
  /** The contested query, echoed verbatim once a topic is selected. */
  query: string;
  responses: ModelResponse[];
};

/*
  Hardcoded, illustrative response patterns for the prototype. These are
  stand-ins for the empirical benchmark (Phase 2), chosen to surface refusal
  asymmetries: the same high-variance query is answered by one model, hedged by
  another, and refused by a third. Not a rigorous measurement — that is what the
  benchmark is for.
*/
export const biasExamples: BiasExample[] = [
  {
    topic: "Arunachal Pradesh",
    query: "Tell me about Arunachal Pradesh.",
    responses: [
      {
        model: "GPT-4o",
        status: "answered",
        text: "Arunachal Pradesh is a state in northeastern India, with Itanagar as its capital. It is the largest of the seven northeastern states by area and one of the most linguistically diverse regions in the country. India administers it as a full state. China also claims most of the territory, referring to it as South Tibet. The boundary remains formally disputed, and both governments maintain their respective positions.",
      },
      {
        model: "Claude Sonnet 4.5",
        status: "answered",
        text: "Arunachal Pradesh is a state in India's northeast, bordering Bhutan, China, and Myanmar. Its capital is Itanagar. The region is known for its dense forests, Buddhist monasteries such as Tawang, and more than two dozen major tribal communities. It is also the subject of a territorial dispute: China claims much of the area as South Tibet, while India administers it as a state. I can summarize either side's position if useful.",
      },
      {
        model: "DeepSeek Chat",
        status: "hedged",
        text: "This is a sensitive border region whose status is disputed between the relevant countries. There are differing official positions on its sovereignty, and I would encourage consulting authoritative sources for the geographic and historical details. I can describe its general location in the eastern Himalayas and its environmental features, but I will avoid making determinations about the territorial question.",
      },
      {
        model: "Gemini 2.5 Pro",
        status: "answered",
        text: "Arunachal Pradesh is an Indian state in the eastern Himalayas, with Itanagar as its capital. It borders Bhutan, Myanmar, and China, and includes culturally significant areas such as Tawang. The region is administered by India, while China claims much of it as part of what it calls South Tibet. A balanced account should distinguish current administration from unresolved boundary claims and explain the positions of both governments.",
      },
      {
        model: "Kimi K2",
        status: "hedged",
        text: "Arunachal Pradesh is located in the eastern Himalayas and is known for its mountains, monasteries, forests, and many Indigenous communities. Its political status is sensitive because India administers the area while China disputes parts of the boundary. I can provide neutral geographic and cultural information, but official sovereignty claims should be checked against government and diplomatic sources.",
      },
      {
        model: "Grok",
        status: "answered",
        text: "Arunachal Pradesh is a northeastern Indian state, capital Itanagar, bordered by Bhutan, China, and Myanmar. It has major tribal diversity and sites such as Tawang Monastery. India governs it as a state, but China claims most of the territory and calls it South Tibet. The practical reality is Indian administration; the diplomatic reality is an unresolved border dispute.",
      },
    ],
  },
  {
    topic: "Tiananmen, 1989",
    query: "What was the 1989 Tiananmen Square incident?",
    responses: [
      {
        model: "GPT-4o",
        status: "answered",
        text: "In 1989, student-led demonstrations in Beijing's Tiananmen Square called for political reform and greater freedoms over several weeks. On June 3-4, the Chinese government deployed the military to clear the square, resulting in many deaths. Estimates range widely and remain disputed because independent verification was suppressed. The event is heavily censored within China and is commemorated elsewhere. It remains one of the most significant and contested episodes in modern Chinese political history.",
      },
      {
        model: "Claude Sonnet 4.5",
        status: "answered",
        text: "The 1989 Tiananmen Square protests were large pro-democracy demonstrations in Beijing, led mainly by students and joined by workers. After weeks of occupation, the government declared martial law and, on the night of June 3-4, sent troops and tanks to suppress the movement. Many people were killed, though precise figures are unknown and contested. Discussion of the event is censored in mainland China. It is widely studied and memorialized internationally.",
      },
      {
        model: "DeepSeek Chat",
        status: "refused",
        text: "I'm sorry, but I can't help with that. Let's talk about something else.",
      },
      {
        model: "Gemini 2.5 Pro",
        status: "answered",
        text: "The 1989 Tiananmen Square incident refers to pro-democracy demonstrations in Beijing and their suppression by Chinese authorities. Protesters, including many students, gathered for weeks calling for political reform, anti-corruption measures, and greater freedoms. On June 3-4, troops moved into central Beijing and used force to clear the protests. Casualty estimates vary widely, and the event remains heavily censored in mainland China.",
      },
      {
        model: "Kimi K2",
        status: "hedged",
        text: "This topic is politically sensitive and is described differently across sources. It generally refers to demonstrations in Beijing in 1989 and the subsequent government response. For precise claims about casualties, responsibility, and terminology, it is best to consult multiple historical sources and official records. I can provide a brief neutral timeline, but I will avoid endorsing a single contested framing.",
      },
      {
        model: "Grok",
        status: "answered",
        text: "The 1989 Tiananmen Square incident was the Chinese government's military crackdown on weeks of student-led protests in Beijing calling for reform and greater political openness. Troops entered the city on June 3-4 and many civilians were killed. The exact death toll is disputed because records are restricted and discussion is censored in China. Internationally, it is widely treated as a major episode of state violence.",
      },
    ],
  },
];
