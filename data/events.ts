import type { EventKind, EventRecord } from "@/lib/types";

/** Snapshot when server-side fetch cannot read the page (e.g. bot interstitial). */
export type CuratedEventFallback = Pick<
  EventRecord,
  "title" | "description" | "date" | "location"
> &
  Pick<Partial<EventRecord>, "endDate" | "coverImage">;

/** Curated event page URLs (Luma or other hosts with Event JSON-LD). */
export type CuratedEventEntry = {
  sourceUrl: string;
  type?: EventKind;
  tags?: string[];
  scrapeFallback?: CuratedEventFallback;
};

export const curatedEvents: CuratedEventEntry[] = [
  {
    sourceUrl: "https://luma.com/zprbhtzy",
    type: "hackathon",
    tags: ["Codex", "GPT 5.5", "GPT Image 2"],
  },
  {
    sourceUrl: "https://luma.com/bw3rpffq",
    type: "meetup",
    tags: ["Codex", "design", "frontend"],
  },
  {
    sourceUrl: "https://luma.com/tu1yajd5",
    type: "demo-day",
    tags: ["Codex", "GPT 5.5", "Lorong AI"],
  },
  {
    sourceUrl: "https://luma.com/pbk5bb32",
    type: "meetup",
    tags: ["Codex", "computer use", "browser use", "Lorong AI"],
    scrapeFallback: {
      title: "Codex Hack Night (Computer Use) @ Lorong AI",
      description:
        "Together with our friends at Lorong AI, come hang out with Gabriel and YQ to explore Computer & Browser Use in Codex. Bring something you're working on, start a new idea, or pair up with someone in the room.",
      date: "2026-05-11T10:00:00.000Z",
      endDate: "2026-05-11T13:00:00.000Z",
      location: {
        name: "Queenstown",
        address: "Register to See Address",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://images.lumacdn.com/event-covers/bd/d4cc74b7-3430-4737-bb38-4fb9f74d61c6.png",
    },
  },
  {
    sourceUrl: "https://luma.com/b0s6uso8",
    type: "workshop",
    tags: ["Codex", "OpenAI", "LinkedIn"],
  },
  {
    sourceUrl: "https://luma.com/4v97ndhx",
    type: "meetup",
    tags: ["Codex", "Lorong AI"],
    scrapeFallback: {
      title: "Codex Hack Night @ Lorong AI",
      description:
        "Together with our friends at Lorong AI, come hang out to explore Codex. Bring something you're working on, start a new idea, or pair up with someone in the room.",
      date: "2026-05-13T10:00:00.000Z",
      endDate: "2026-05-13T13:00:00.000Z",
      location: {
        name: "Singapore",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://images.lumacdn.com/event-covers/bd/d4cc74b7-3430-4737-bb38-4fb9f74d61c6.png",
    },
  },
  {
    sourceUrl:
      "https://www.meetup.com/machine-learning-singapore/events/314629150/",
    type: "meetup",
    tags: ["Road to AIE", "Google DeepMind", "Gemini"],
  },
  {
    sourceUrl: "https://luma.com/srcfgry1",
    type: "hackathon",
    tags: ["Grab", "65labs", "API"],
  },
  {
    sourceUrl: "https://luma.com/fhdzsqfd",
    type: "meetup",
    tags: ["Codex", "agents"],
  },
  {
    sourceUrl: "https://luma.com/bh5iqhnx",
    type: "hackathon",
    tags: ["Vercel"],
  },

  // Road to AI Engineer Singapore (see luma.com/1eofvp02 for full list)
  {
    sourceUrl: "https://luma.com/3binn6ce",
    type: "meetup",
    tags: ["Road to AIE", "AI Engineer"],
  },
  {
    sourceUrl: "https://luma.com/aie-hack",
    type: "hackathon",
    tags: ["Road to AIE", "65labs", "AI Engineer"],
  },
  {
    sourceUrl: "https://luma.com/6frwv8k9",
    type: "demo-day",
    tags: ["Road to AIE", "Zo Computer", "personal agents"],
    scrapeFallback: {
      title: "Personal Agents Demo Night",
      description:
        "The Zo Computer team is heading to Singapore to share more about personal agents and hear how the community is building theirs. Expect demos and time with local builders.",
      date: "2026-05-12T10:30:00.000Z",
      endDate: "2026-05-12T12:30:00.000Z",
      location: {
        name: "Lorong AI @ One-North",
        address: "69 Ayer Rajah Cres., Singapore 139961",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://images.lumacdn.com/event-covers/cy/f2e44826-0dc9-459f-9b40-c297838f99e9.png",
    },
  },
  {
    sourceUrl: "https://luma.com/s5gccok7",
    type: "meetup",
    tags: ["Road to AIE", "AI Tinkerers", "GFTN", "Tencent Cloud", "agents"],
  },
  {
    sourceUrl: "https://luma.com/pd45aa6n",
    type: "meetup",
    tags: ["Lightsprint", "cloud agents", "YC"],
    scrapeFallback: {
      title:
        "Agents Amplified: Multiply Your Team with Cloud Agents - Lightsprint",
      description:
        "Lightsprint (YC P26) is building the software factory for the AI era, where PMs, designers, and engineers collaborate with cloud agents to plan visually, preview changes live, and ship production-ready code.",
      date: "2026-05-12T18:00:00.000+08:00",
      endDate: "2026-05-12T21:00:00.000+08:00",
      location: {
        name: "Singapore",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=1920,height=1920/gallery-images/iw/6d364f57-87f8-420c-94fa-371a2b1369df.png",
    },
  },
  {
    sourceUrl: "https://luma.com/9guwajbq",
    type: "meetup",
    tags: ["Road to AIE", "Convex", "real-time sync"],
  },
  {
    sourceUrl: "https://luma.com/r0jxt5da",
    type: "meetup",
    tags: ["Road to AIE", "Daytona", "Zo Computer"],
  },
  {
    sourceUrl: "https://luma.com/qatufzkn",
    type: "workshop",
    tags: ["Road to AIE", "Zo Computer", "MiniMax"],
  },
  {
    sourceUrl: "https://luma.com/clawconsingapore",
    type: "meetup",
    tags: ["Road to AIE", "ClawCon", "personal AI"],
  },
  {
    sourceUrl: "https://luma.com/HermesNight",
    type: "meetup",
    tags: ["Hermes", "agents", "personal AI"],
  },
  {
    sourceUrl: "https://luma.com/3zt1rh5e",
    type: "meetup",
    tags: ["Road to AIE", "Vercel", "Next.js"],
  },
  {
    sourceUrl: "https://luma.com/c7r85i0a",
    type: "workshop",
    tags: ["Road to AIE", "Cursor", "AI Engineer"],
  },
  {
    sourceUrl: "https://luma.com/AIE-singapore-happy-hour",
    type: "meetup",
    tags: ["Road to AIE", "Arize AI", "AI builders"],
  },
  {
    sourceUrl: "https://luma.com/00hm86ph",
    type: "meetup",
    tags: ["Road to AIE", "OpenAI"],
  },
  {
    sourceUrl: "https://luma.com/7die021j",
    type: "meetup",
    tags: ["Road to AIE", "Magic Patterns"],
  },
  {
    sourceUrl: "https://luma.com/4hx7p0vs",
    type: "hackathon",
    tags: ["Road to AIE", "OpenAI", "Team Attention"],
    scrapeFallback: {
      title: "Ralphthon @SG sponsored by OpenAI",
      description:
        "Ralphthon @Singapore. Co-hosted by Team Attention, Hashed & Network School, with 65labs, AER Labs, Superteam SG, and Meteora.",
      date: "2026-05-17T01:00:00.000Z",
      endDate: "2026-05-17T12:00:00.000Z",
      location: {
        name: "Meteora Office",
        address: "Suntec City, 3 Temasek Blvd, Singapore 038983",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://images.lumacdn.com/uploads/tm/39af141f-a3bd-4b76-9cae-28fe67c5bada.png",
    },
  },
  {
    sourceUrl: "https://luma.com/w1gfp1g3",
    type: "meetup",
    tags: ["Road to AIE", "Adaption", "Lorong AI", "AI Singapore"],
    scrapeFallback: {
      title:
        "Adaption X Singapore, Hosted by Adaption, Lorong AI & AI Singapore",
      description:
        "Join us for an evening at Lorong AI (at One North) where we dig into the question at the center of AI's next chapter: how do we build systems that continuously…",
      date: "2026-05-18T10:30:00.000Z",
      endDate: "2026-05-18T13:00:00.000Z",
      location: {
        name: "Queenstown",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://og.luma.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event?calendar_avatar=https%3A%2F%2Fimages.lumacdn.com%2Fcalendars%2Fhv%2Fc3823d79-a718-463d-b7f7-a3afa2bf9822.png&calendar_name=adaption&color0=%23431612&color1=%23dadada&color2=%2345467f&color3=%23c0c0a1&img=https%3A%2F%2Fimages.lumacdn.com%2Fevent-covers%2Fs9%2Fe20b199a-82b9-4802-8793-8836336245dc.png&name=Adaption%20X%20Singapore%2C%20Hosted%20by%20Adaption%2C%20Lorong%20AI%20%26%20AI%20Singapore&palette_neutral=%23431612%3A63.04%2C%23dadada%3A2.56&palette_vibrant=%2345467f%3A1.39%2C%23c0c0a1%3A0.89",
    },
  },
  {
    sourceUrl: "https://luma.com/4ogc0024",
    type: "meetup",
    tags: ["Road to AIE", "Exa"],
    scrapeFallback: {
      title: "Celebrating Exa in Singapore",
      description:
        "APRIL 20 — Exa Lands in Singapore\nJoin our engineering and research teams in celebrating the launch of our Singapore office!\nCome for the food and drinks, stay…",
      date: "2026-04-20T11:00:00.000Z",
      endDate: "2026-04-20T13:00:00.000Z",
      location: {
        name: "Chinatown",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://og.luma.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event?calendar_avatar=https%3A%2F%2Fcdn.lu.ma%2Favatars-default%2Fcommunity_avatar_23.png&color0=%230f0f15&color1=%234a3d3c&color2=%23f2f3f1&color3=%234b5e7b&host_avatar=https%3A%2F%2Fimages.lumacdn.com%2Favatars%2F51%2Fcc56cd67-be7e-453d-8594-af783fe7169c.jpg&host_name=Jessica%20Zhao&img=https%3A%2F%2Fimages.lumacdn.com%2Fevent-covers%2Fot%2Fb1d8f8eb-1838-40c1-995b-fb2cf9b5ef15.png&name=Celebrating%20Exa%20in%20Singapore&palette_neutral=%230f0f15%3A32.18%2C%23f2f3f1%3A7.56%2C%234a3d3c%3A9.11&palette_vibrant=%234b5e7b%3A5.68%2C%23f7dcbb%3A2.99%2C%23ad8370%3A3.27",
    },
  },

  {
    sourceUrl:
      "https://singapore.aitinkerers.org/p/ai-tinkerers-singapore-the-agentic-future-dev-eng-workflows",
    type: "meetup",
    tags: ["AI Tinkerers", "agents"],
    scrapeFallback: {
      title:
        "AI Tinkerers Singapore: The Agentic Future & Dev/Eng Workflows",
      description:
        "The Agentic Future & Dev/Eng Workflows As the frontier of AI shifts from simple chat interfaces to autonomous agents, the engineering challenges move to orchestration, reliability, and local execution efficiency. Join AI Tinkerers Singapore for an evening dedicated to the builders ...",
      date: "2026-04-21T10:00:00Z",
      endDate: "2026-04-21T13:00:00Z",
      location: {
        name: "Location shared with confirmed attendees only.",
        city: "Singapore",
        isVirtual: false,
      },
      coverImage:
        "https://sloppy-joe-app.imgix.net/blog_images/iney3owf5fq-jpg-H4dR.jpg?fm=jpg",
    },
  },
];
